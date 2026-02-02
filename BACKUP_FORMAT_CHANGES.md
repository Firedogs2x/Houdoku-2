# Backup Format Changes - Version 2.17.0+

## Overview

The backup JSON format has been improved to be cleaner, more organized, and more readable. This document describes the new format and how the backup/restore functionality has been updated.

## New Backup Format Structure

The new backup format is a structured JSON object with the following top-level keys:

```json
{
  "backupDate": "YYYY-MM-DD",
  "settings": {
    "general": { /* General settings */ },
    "reader": { /* Reader settings */ },
    "keybinds": { /* Keybind settings */ },
    "trackers": { /* Tracker settings */ },
    "integrations": { /* Integration settings */ },
    "folders": { /* Folder configuration */ },
    "library": { /* Library-specific settings */ }
  },
  "series": [ /* Array of Series objects */ ],
  "chapters": {
    "seriesId1": [ /* Array of Chapter objects */ ],
    "seriesId2": [ /* Array of Chapter objects */ ]
  },
  "extensions": {
    "extensionId1": "settings-json-string",
    "extensionId2": "settings-json-string"
  },
  "trackers": {
    "trackerId1": "token-string",
    "trackerId2": "token-string"
  }
}
```

## Key Features of the New Format

### 1. **Organized Settings by Category**
Settings are now grouped into logical categories instead of using localStorage key prefixes:
- **general**: Core application settings (theme, auto-backup, refresh on start, etc.)
- **reader**: Reader-specific settings (page style, spacing, reading direction, etc.)
- **keybinds**: Keyboard shortcut configurations
- **trackers**: Tracker-related settings
- **integrations**: Extension integration settings
- **folders**: Folder and cover image configuration
- **library**: Library display and behavior settings

### 2. **Clear Data Organization**
- **series**: All manga series are stored in a flat array with complete metadata
- **chapters**: Chapters are organized by series ID, making it easy to correlate with series
- **extensions**: Third-party extension settings are stored separately with clear IDs
- **trackers**: Tracker authentication tokens are stored separately for security purposes

### 3. **Backup Metadata**
- **backupDate**: ISO date format (YYYY-MM-DD) making it easy to identify when the backup was created

### 4. **Human-Readable Format**
The JSON is formatted with proper indentation (2 spaces) for easy manual inspection and debugging

## Changes to Backup/Restore Functions

### File: `apps/desktop/src/renderer/util/backup.ts`

#### New Interfaces
- `NewBackupFormat`: TypeScript interface defining the new backup structure

#### New Helper Functions
- `extractSettingsByPrefix()`: Extracts settings from localStorage using a given prefix
- `extractExtensions()`: Gathers all extension settings
- `extractTrackers()`: Gathers all tracker authentication tokens
- `isNewBackupFormat()`: Type guard to detect if a backup uses the new format

#### Updated `createBackup()` Function
- Now creates structured backups using the new format
- Properly organizes series and chapters by ID
- Extracts and includes settings from all categories
- Uses pretty-printed JSON (2-space indentation) for readability

#### Updated `createAutoBackup()` Function
- Creates automatic backups with the same new structured format
- Maintains backward compatibility with auto-backup features
- Still respects the auto-backup count limit (old backups are cleaned up)

#### Updated `restoreBackup()` Function
- **Backward Compatible**: Automatically detects backup format (old or new)
- For **new format backups**:
  - Restores all series with full metadata
  - Restores all chapters per series, preserving read status
  - Logs information about available settings/extensions/trackers (ready for future enhancement)
- For **legacy format backups**:
  - Uses original restoration logic
  - Maintains compatibility with backups created by older versions

## Technical Implementation Details

### Settings Extraction
The new backup includes settings organized by category. Each setting category (general, reader, etc.) contains key-value pairs extracted from localStorage based on known prefixes from `storeKeys.json`:
- General settings use `general-` prefix
- Reader settings use `reader-` prefix
- Tracker settings use `tracker-` prefix
- Integration settings use `integration-` prefix

### Special Setting Groups
Some settings are grouped into logical categories in the backup:
- **folders**: Contains master folder, folder naming, and cover image settings
- **library**: Contains library-specific settings like refresh behavior, column count, and view type

### Chapters Organization
Chapters are now organized by series ID as a flat key-value map instead of using the localStorage key naming convention. This makes it:
- Easier to parse and understand
- More efficient for data lookups
- Clearer in manual inspection

### Backward Compatibility
The system automatically detects whether a backup file is in the old (flat localStorage) format or the new structured format:
- If `backupDate`, `settings`, `series`, and `chapters` keys are present → **New Format**
- Otherwise → **Legacy Format** (flat localStorage dump)

This ensures that users can:
- Restore backups created with older versions
- Migrate to the new format when creating fresh backups
- Have a smooth transition period

## Migration Guide

### For Users
1. **Existing backups remain compatible**: Old backup files will continue to work
2. **New backups will use new format**: Any backup created with this version will use the structured format
3. **No action required**: The app handles format detection automatically

### For Developers
1. If adding new settings, ensure they're written to localStorage with proper prefixes
2. The `extractSettingsByPrefix()` function will automatically include them in backups
3. To add restoration of settings (currently logged but not restored), modify the `restoreBackup()` function to write settings back to localStorage

## Future Enhancements

The new format infrastructure allows for easy implementation of:
- **Settings restoration**: Currently logged; can be enabled by writing settings back to localStorage
- **Extension settings restoration**: Currently logged; ready for implementation
- **Tracker token restoration**: Currently logged; ready for implementation with proper security considerations
- **Selective restoration**: Users could restore only certain categories (e.g., just library data)
- **Backup comparison**: The structured format makes it easy to compare backups

## Files Modified

- `apps/desktop/src/renderer/util/backup.ts`: Complete rewrite of backup/restore functions with new format support

## Testing

### Linting
✅ Passed: `pnpm lint` - No formatting or code quality issues

### Build
✅ Passed: `pnpm build` - Successfully compiled all packages with no errors

### Backward Compatibility
✅ Confirmed: Legacy format detection and restoration logic is preserved

## Example Backup File

See `houdoku_backup_2026-02-02_New_Version.json` for a complete example of the new backup format structure.
