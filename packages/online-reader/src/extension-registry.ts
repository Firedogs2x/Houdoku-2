import { ExtensionClientInterface, ExtensionMetadata } from '@houdoku/common';

// ============================================================================
// Types
// ============================================================================

export type ExtensionSource = 'built-in' | 'apk-virtual';

export type ExtensionEntry = {
  metadata: ExtensionMetadata;
  client: ExtensionClientInterface;
  source: ExtensionSource;
};

// ============================================================================
// ExtensionRegistry
// ============================================================================

/**
 * Central registry for all content-source extensions.
 *
 * Built-in extensions are registered once at startup. APK-virtual extensions
 * are registered/unregistered dynamically as APK files are added/removed from
 * the extensions directory.
 *
 * The registry is the single source of truth for `getExtensions()`. All APK
 * mode filtering, selection overrides, and adapter profiles are applied by
 * the caller (TiyoClient) on top of the raw registry state.
 */
export class ExtensionRegistry {
  private _entries = new Map<string, ExtensionEntry>();

  // ------------------------------------------------------------------
  // Registration
  // ------------------------------------------------------------------

  /**
   * Register a built-in extension. Silently replaces any existing entry
   * with the same ID.
   */
  registerBuiltIn(id: string, metadata: ExtensionMetadata, client: ExtensionClientInterface): void {
    this._entries.set(id, { metadata, client, source: 'built-in' });
  }

  /**
   * Register an APK-virtual extension. Silently replaces any existing
   * APK entry with the same ID.
   */
  registerApk(id: string, metadata: ExtensionMetadata, client: ExtensionClientInterface): void {
    this._entries.set(id, { metadata, client, source: 'apk-virtual' });
  }

  /**
   * Remove an APK-virtual extension by ID. Does nothing for built-in entries.
   *
   * @returns true if an entry was removed
   */
  unregisterApk(id: string): boolean {
    const entry = this._entries.get(id);
    if (entry === undefined || entry.source !== 'apk-virtual') {
      return false;
    }
    return this._entries.delete(id);
  }

  /**
   * Remove ALL APK-virtual entries. Called before a full APK rescan
   * so stale entries don't persist.
   */
  clearApkEntries(): void {
    for (const [id, entry] of this._entries) {
      if (entry.source === 'apk-virtual') {
        this._entries.delete(id);
      }
    }
  }

  // ------------------------------------------------------------------
  // Query
  // ------------------------------------------------------------------

  /**
   * Get a single extension entry by ID.
   */
  get(id: string): ExtensionEntry | undefined {
    return this._entries.get(id);
  }

  /**
   * Get all registered extensions as a plain object keyed by extension ID.
   * This is the format consumed by the existing `getExtensions()` pipeline.
   */
  getAll(): Record<string, ExtensionEntry> {
    return Object.fromEntries(this._entries);
  }

  /**
   * Get all extension IDs currently registered.
   */
  getIds(): string[] {
    return Array.from(this._entries.keys());
  }

  /**
   * Get the total number of registered extensions.
   */
  get size(): number {
    return this._entries.size;
  }

  /**
   * Check if a built-in extension with the given ID exists.
   */
  hasBuiltIn(id: string): boolean {
    const entry = this._entries.get(id);
    return entry !== undefined && entry.source === 'built-in';
  }

  /**
   * Check if any APK-virtual extension is registered.
   */
  hasAnyApk(): boolean {
    for (const entry of this._entries.values()) {
      if (entry.source === 'apk-virtual') {
        return true;
      }
    }
    return false;
  }

  // ------------------------------------------------------------------
  // Iteration
  // ------------------------------------------------------------------

  /**
   * Get all built-in extension entries.
   */
  getBuiltInEntries(): ExtensionEntry[] {
    return Array.from(this._entries.values()).filter(
      (entry) => entry.source === 'built-in',
    );
  }

  /**
   * Get all APK-virtual extension entries.
   */
  getApkEntries(): ExtensionEntry[] {
    return Array.from(this._entries.values()).filter(
      (entry) => entry.source === 'apk-virtual',
    );
  }

  // ------------------------------------------------------------------
  // Metadata helpers
  // ------------------------------------------------------------------

  /**
   * Get metadata for all built-in extensions (needed by source-key mapping).
   */
  getBuiltInMetadataList(): ExtensionMetadata[] {
    return this.getBuiltInEntries().map((entry) => entry.metadata);
  }
}
