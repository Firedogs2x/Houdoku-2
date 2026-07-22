// Quick test of apk-reader.ts against actual APK files
const path = require('path');
const fs = require('fs');

// We need to use ts-node or compile. Let's just test the raw binary XML parsing
// by reading the actual APK and checking if adm-zip can open it.
const AdmZip = require('adm-zip');

const apkDir = path.join(process.env.APPDATA, 'Houdoku', 'Keiyoushi APK Extensions');
console.log('APK directory:', apkDir);

const files = fs.readdirSync(apkDir).filter(f => f.endsWith('.apk'));
console.log('Found APK files:', files);

for (const file of files) {
  const filePath = path.join(apkDir, file);
  console.log(`\n--- ${file} ---`);
  
  try {
    const zip = new AdmZip(filePath);
    const entries = zip.getEntries();
    console.log(`  Entry count: ${entries.length}`);
    
    const manifestEntry = entries.find(e => e.entryName === 'AndroidManifest.xml');
    if (manifestEntry) {
      const buf = manifestEntry.getData();
      console.log(`  Manifest size: ${buf.length} bytes`);
      console.log(`  First 8 bytes (hex): ${buf.subarray(0, 8).toString('hex')}`);
      // Check AXML magic
      const magic = buf.readUInt32LE(0);
      console.log(`  Magic: 0x${magic.toString(16)} (expected 0x80003)`);
    } else {
      console.log('  No AndroidManifest.xml found!');
    }
    
    // List first 10 entries
    console.log('  First entries:');
    entries.slice(0, 10).forEach(e => console.log(`    ${e.entryName} (${e.getData().length} bytes)`));
  } catch (err) {
    console.log(`  ERROR: ${err.message}`);
  }
}
