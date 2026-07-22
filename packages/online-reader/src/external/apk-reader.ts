import AdmZip from 'adm-zip';

// ============================================================================
// Types
// ============================================================================

export type ApkContent = {
  packageName: string;
  versionName: string | undefined;
  versionCode: number | undefined;
  sourceKey: string;
  sourceName: string;
  baseUrl: string | undefined;
  entryCount: number;
};

export type ApkManifestData = {
  packageName: string;
  versionName: string | undefined;
  versionCode: number | undefined;
};

// ============================================================================
// Binary XML (AXML) Parser — minimal parser for AndroidManifest.xml
// ============================================================================

// Chunk type constants
const CHUNK_TYPE_STRING_POOL = 0x001c0001;
const CHUNK_TYPE_START_ELEMENT = 0x00100102;
const CHUNK_TYPE_END_ELEMENT = 0x00100103;

// Attribute type constants
const ATTR_TYPE_STRING = 0x03000008;
const _ATTR_TYPE_INT_DEC = 0x10000000;
const _ATTR_TYPE_INT_HEX = 0x11000000;

const MANIFEST_NAMESPACE = 'http://schemas.android.com/apk/res/android';

class AxmlReader {
  private buf: Buffer;
  private pos: number;

  constructor(buf: Buffer) {
    this.buf = buf;
    this.pos = 0;
  }

  readU16(): number {
    const val = this.buf.readUInt16LE(this.pos);
    this.pos += 2;
    return val;
  }

  readU32(): number {
    const val = this.buf.readUInt32LE(this.pos);
    this.pos += 4;
    return val;
  }

  readStringAt(offset: number): string {
    const end = this.buf.indexOf(0, offset);
    if (end === -1) {
      return this.buf.toString('utf-8', offset);
    }

    // Strings in AXML can be UTF-16 (2 bytes per char) or UTF-8
    // Try UTF-16 first for single-byte content that looks wrong in UTF-8
    const raw = this.buf.subarray(offset, end);
    if (raw.every((b, i) => i % 2 === 1 && b === 0)) {
      // Looks like UTF-16LE with ASCII content
      let result = '';
      for (let i = 0; i < raw.length; i += 2) {
        result += String.fromCharCode(raw[i]);
      }
      return result;
    }

    return raw.toString('utf-8');
  }

  parse(): { strings: string[]; elements: AxmlElement[] } {
    // Read header
    const magic = this.readU32();
    if (magic !== 0x00080003) {
      throw new Error(`Invalid AXML magic: 0x${magic.toString(16)}`);
    }
    /* fileSize = */ this.readU32(); // skip file size

    const strings: string[] = [];
    const elements: AxmlElement[] = [];

    while (this.pos < this.buf.length - 4) {
      const chunkType = this.readU32();

      if (chunkType === CHUNK_TYPE_STRING_POOL) {
        strings.push(...this.parseStringPool());
      } else if (chunkType === CHUNK_TYPE_START_ELEMENT) {
        elements.push(this.parseStartElement(strings));
      } else if (chunkType === CHUNK_TYPE_END_ELEMENT) {
        // Skip end elements — just need their chunk size
        const chunkSize = this.buf.readUInt32LE(this.pos);
        this.pos += chunkSize - 4; // -4 because we already read chunkType
      } else {
        // Unknown chunk — skip by reading its size
        if (this.pos + 4 <= this.buf.length) {
          const chunkSize = this.buf.readUInt32LE(this.pos);
          this.pos += chunkSize - 4;
        } else {
          break;
        }
      }
    }

    return { strings, elements };
  }

  private parseStringPool(): string[] {
    const chunkStart = this.pos - 4; // we already read type
    const chunkSize = this.readU32();
    const stringCount = this.readU32();
    const styleCount = this.readU32();
    const flags = this.readU32();
    const stringPoolOffset = this.readU32();
    const _stylePoolOffset = this.readU32();

    const isUtf8 = (flags & 0x0100) !== 0;

    // Read string offsets
    const offsets: number[] = [];
    for (let i = 0; i < stringCount; i++) {
      offsets.push(this.readU32());
    }

    // Read style offsets (skip)
    for (let i = 0; i < styleCount; i++) {
      this.readU32();
    }

    // Read strings
    const stringPoolStart = chunkStart + stringPoolOffset;
    const poolStrings: string[] = [];

    for (let i = 0; i < stringCount; i++) {
      const strOffset = stringPoolStart + offsets[i];

      if (isUtf8) {
        // UTF-8 string: 1-byte char count, 1-byte byte count, then data
        const _charCount = this.buf.readUInt8(strOffset);
        const byteCount = this.buf.readUInt8(strOffset + 1);
        const strData = this.buf.subarray(strOffset + 2, strOffset + 2 + byteCount);
        // Null-terminated
        const nullIdx = strData.indexOf(0);
        poolStrings.push(
          nullIdx >= 0
            ? strData.toString('utf-8', 0, nullIdx)
            : strData.toString('utf-8'),
        );
      } else {
        // UTF-16 string: 4-byte char count, then UTF-16LE data
        const charCount = this.buf.readUInt32LE(strOffset);
        const end = this.buf.indexOf(0, strOffset + 4);
        const strData = this.buf.subarray(strOffset + 4, end >= 0 ? end : strOffset + 4 + charCount * 2);
        poolStrings.push(strData.toString('utf-16le'));
      }
    }

    // Skip remaining chunk data
    this.pos = chunkStart + chunkSize;
    return poolStrings;
  }

  private parseStartElement(strings: string[]): AxmlElement {
    const chunkStart = this.pos - 4;
    const chunkSize = this.readU32();
    const _lineNumber = this.readU32();
    const _commentIndex = this.readU32();
    const nsIndex = this.readU32();
    const nameIndex = this.readU32();
    const _attrStart = this.readU16();
    const attrSize = this.readU16();
    const attrCount = this.readU16();
    const _idIndex = this.readU16();
    const _classIndex = this.readU16();
    const _styleIndex = this.readU16();

    const name = strings[nameIndex] || '';

    // Parse attributes
    const attributes: AxmlAttribute[] = [];
    const attrBase = this.pos;

    for (let i = 0; i < attrCount; i++) {
      const attrPos = attrBase + i * attrSize;
      if (attrPos + 20 > this.buf.length) break;

      const attrNsIndex = this.buf.readUInt32LE(attrPos);
      const attrNameIndex = this.buf.readUInt32LE(attrPos + 4);
      const attrValueIndex = this.buf.readUInt32LE(attrPos + 8);
      const attrType = this.buf.readU32LE(attrPos + 12);
      const attrData = this.buf.readUInt32LE(attrPos + 16);

      let attrValue: string | number = attrData;

      if (attrType === ATTR_TYPE_STRING) {
        attrValue = strings[attrValueIndex] || '';
      }

      const attrNs = strings[attrNsIndex] || '';
      const attrName = strings[attrNameIndex] || '';

      attributes.push({
        ns: attrNs,
        name: attrName,
        value: attrValue,
      });
    }

    // Skip to end of element
    this.pos = chunkStart + chunkSize;

    return { name, ns: strings[nsIndex] || '', attributes };
  }
}

type AxmlElement = {
  name: string;
  ns: string;
  attributes: AxmlAttribute[];
};

type AxmlAttribute = {
  ns: string;
  name: string;
  value: string | number;
};

// ============================================================================
// Public API
// ============================================================================

/**
 * Parse AndroidManifest.xml (binary XML) from a Buffer.
 * Extracts package, versionName, and versionCode.
 */
export const parseManifest = (manifestBytes: Buffer): ApkManifestData => {
  const reader = new AxmlReader(manifestBytes);
  const { elements } = reader.parse();

  const manifestEl = elements.find((el) => el.name === 'manifest');
  if (!manifestEl) {
    throw new Error('Could not find <manifest> element in AndroidManifest.xml');
  }

  let packageName = '';
  let versionName: string | undefined;
  let versionCode: number | undefined;

  for (const attr of manifestEl.attributes) {
    if (attr.name === 'package' && typeof attr.value === 'string') {
      packageName = attr.value;
    } else if (
      attr.ns === MANIFEST_NAMESPACE &&
      attr.name === 'versionName' &&
      typeof attr.value === 'string'
    ) {
      versionName = attr.value;
    } else if (
      attr.ns === MANIFEST_NAMESPACE &&
      attr.name === 'versionCode' &&
      typeof attr.value === 'number'
    ) {
      versionCode = attr.value;
    }
  }

  if (!packageName) {
    throw new Error('Could not find package attribute in AndroidManifest.xml');
  }

  return { packageName, versionName, versionCode };
};

/**
 * Extract and parse the contents of an APK file.
 *
 * APK files are ZIP archives. This function opens the APK,
 * extracts AndroidManifest.xml, and parses the key metadata fields.
 *
 * @param filePath Absolute path to the .apk file
 * @returns ApkContent with package name, version info, source key/name, and entry count
 */
export const readApkContent = (filePath: string): ApkContent => {
  const zip = new AdmZip(filePath);
  const entries = zip.getEntries();
  const entryCount = entries.length;

  const manifestEntry = entries.find(
    (entry) => entry.entryName === 'AndroidManifest.xml',
  );

  if (!manifestEntry) {
    throw new Error(
      `APK file does not contain AndroidManifest.xml: ${filePath}`,
    );
  }

  const manifestBytes = manifestEntry.getData();
  const manifest = parseManifest(manifestBytes);

  // Extract base URL from classes.dex if available
  const dexEntry = entries.find((entry) => entry.entryName === 'classes.dex');
  const baseUrl = dexEntry ? extractBaseUrlFromDex(dexEntry.getData()) : undefined;

  // Derive source key from the last segment of the package name
  const packageParts = manifest.packageName
    .split('.')
    .filter((entry) => entry.length > 0);
  const sourceKey = (
    packageParts[packageParts.length - 1] || manifest.packageName
  ).toLowerCase();

  // Derive source name as title-cased source key
  const sourceName = sourceKey
    .split(/[-_\s]+/)
    .filter((entry) => entry.length > 0)
    .map((entry) => entry.charAt(0).toUpperCase() + entry.slice(1))
    .join(' ');

  return {
    packageName: manifest.packageName,
    versionName: manifest.versionName,
    versionCode: manifest.versionCode,
    sourceKey,
    sourceName,
    baseUrl,
    entryCount,
  };
};

/**
 * List all entry paths within an APK file.
 */
export const listApkEntries = (filePath: string): string[] => {
  const zip = new AdmZip(filePath);
  return zip.getEntries().map((entry) => entry.entryName);
};

/**
 * Extract a single entry from an APK file as a Buffer.
 *
 * @param filePath Absolute path to the .apk file
 * @param entryPath Path within the APK (e.g. "AndroidManifest.xml")
 * @returns Buffer containing the entry's data
 */
export const extractApkEntry = (
  filePath: string,
  entryPath: string,
): Buffer | null => {
  const zip = new AdmZip(filePath);
  const entry = zip.getEntry(entryPath);
  if (!entry) {
    return null;
  }
  return entry.getData();
};

/**
 * Read APK content with a safe fallback. Returns undefined if the APK
 * cannot be read, rather than throwing.
 */
export const tryReadApkContent = (
  filePath: string,
): ApkContent | undefined => {
  try {
    return readApkContent(filePath);
  } catch {
    return undefined;
  }
};

// ============================================================================
// DEX URL Extraction
// ============================================================================

// Domains to exclude from DEX URL scanning (Android/system/internal)
const DEX_URL_EXCLUDE_PATTERNS = [
  /android\.com/i,
  /schemas\.android/i,
  /w3\.org/i,
  /xmlns/i,
  /google\.com/i,
  /github\.com/i,
  /gradle/i,
  /kotlin/i,
  /jetbrains/i,
];

/**
 * Scan classes.dex bytecode for the extension's base URL.
 *
 * Tachiyomi extensions store their base URL as a string constant in
 * the compiled DEX bytecode. Since strings are stored as UTF-8,
 * we can find them with a regex scan.
 *
 * Returns the most likely base URL (shortest non-API URL), or undefined.
 */
export const extractBaseUrlFromDex = (
  dexBytes: Buffer,
): string | undefined => {
  const text = dexBytes.toString('utf-8');

  // Find all https?:// URLs in the DEX
  const urlPattern =
    /https?:\/\/[a-zA-Z0-9][-a-zA-Z0-9]*(?:\.[a-zA-Z0-9][-a-zA-Z0-9]*)*\.[a-zA-Z]{2,}(?::\d+)?(?:\/[^\x00-\x1f"'\s\\<>]*)?/g;
  const matches = text.match(urlPattern);

  if (!matches || matches.length === 0) {
    return undefined;
  }

  // Deduplicate and filter out Android/system URLs
  const uniqueUrls = [...new Set(matches)].filter((url) => {
    return !DEX_URL_EXCLUDE_PATTERNS.some((pattern) => pattern.test(url));
  });

  if (uniqueUrls.length === 0) {
    return undefined;
  }

  // Prefer the shortest non-API URL as the base URL.
  // API URLs (/api/v1, /api/) are sub-paths of the base.
  const nonApiUrls = uniqueUrls.filter(
    (url) => !url.includes('/api/') && !url.includes('/api?v'),
  );

  const candidates = nonApiUrls.length > 0 ? nonApiUrls : uniqueUrls;

  // Sort by length (shortest = base URL), then alphabetically for stability
  candidates.sort((a, b) => {
    const lenDiff = a.length - b.length;
    if (lenDiff !== 0) return lenDiff;
    return a.localeCompare(b);
  });

  // Return the URL without trailing slash for consistency
  const baseUrl = candidates[0];
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
};
