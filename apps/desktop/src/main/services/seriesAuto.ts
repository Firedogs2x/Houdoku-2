import { IpcMain } from 'electron';
import fs from 'fs';
import path from 'path';
import { Series, SeriesStatus, LanguageKey } from '@tiyo/common';
import { pathToFileURL } from 'url';
import { v4 as uuidv4 } from 'uuid';
import ipcChannels from '@/common/constants/ipcChannels.json';
import { FS_METADATA } from '@/common/temp_fs_metadata';

interface SeriesAutoOptions {
  masterFolder: string;
  coverImageFolder: string;
  coverImageName: string;
  currentSeriesList: Series[];
}

interface SeriesAutoLog {
  programName: string;
  version: string;
  foldersScanned: number;
  seriesAdded: number;
  foldersSkipped: number;
  skippedFolderNames: string[];
  timestamp: string;
}

const SPECIAL_CHARS = ['#', '$'];

const shouldSkipFolder = (folderName: string): boolean => {
  return SPECIAL_CHARS.some((char) => folderName.startsWith(char));
};

const seriesExists = (title: string, seriesList: Series[]): boolean => {
  return seriesList.some((s) => s.title === title);
};

const findCoverImage = (
  masterFolder: string,
  folderName: string,
  coverImageFolder: string,
  coverImageName: string,
): string | null => {
  try {
    // Handle empty coverImageFolder (treat as 'Title')
    const actualCoverFolder = coverImageFolder || 'Title';
    
    // Determine the cover image location
    const coverPath =
      actualCoverFolder === 'Title'
        ? path.join(masterFolder, folderName)
        : path.join(masterFolder, folderName, actualCoverFolder);

    if (!fs.existsSync(coverPath)) {
      return null;
    }

    const files = fs.readdirSync(coverPath);
    const coverFile = files.find((file) => file === coverImageName);

    if (coverFile) {
      return path.join(coverPath, coverFile);
    }

    return null;
  } catch (error) {
    console.error(`Error finding cover image for ${folderName}:`, error);
    return null;
  }
};

const createSeriesAutoLog = (log: SeriesAutoLog, appPath: string): void => {
  const logContent = `
=== Series Auto Log ===
Program: ${log.programName}
Version: ${log.version}
Timestamp: ${log.timestamp}

Statistics:
- Folders Scanned: ${log.foldersScanned}
- Series Added: ${log.seriesAdded}
- Folders Skipped: ${log.foldersSkipped}

Skipped Folders:
${log.skippedFolderNames.map((name) => `  - ${name}`).join('\n')}
`;

  const logPath = path.join(appPath, 'Series Auto Log.txt');
  fs.writeFileSync(logPath, logContent.trim());
  console.info(`Series Auto Log created at: ${logPath}`);
};

export const createSeriesAutoIpcHandlers = (ipcMain: IpcMain, appPath: string) => {
  console.debug('Creating Series Auto IPC handlers in main...');

  ipcMain.handle(
    ipcChannels.SERIES_AUTO.SCAN_AND_ADD_SERIES,
    async (_event, options: SeriesAutoOptions) => {
      console.info('Starting Series Auto scan...');

      const { masterFolder, coverImageFolder, coverImageName, currentSeriesList } = options;

      if (!fs.existsSync(masterFolder)) {
        throw new Error(`Master folder does not exist: ${masterFolder}`);
      }

      const log: SeriesAutoLog = {
        programName: 'Houdoku',
        version: '2.17.0', // This should ideally come from package.json
        foldersScanned: 0,
        seriesAdded: 0,
        foldersSkipped: 0,
        skippedFolderNames: [],
        timestamp: new Date().toISOString(),
      };

      try {
        const items = fs.readdirSync(masterFolder);

        for (const item of items) {
          const itemPath = path.join(masterFolder, item);
          const stat = fs.statSync(itemPath);

          // Only process directories
          if (!stat.isDirectory()) {
            continue;
          }

          // Check for special characters
          if (shouldSkipFolder(item)) {
            log.foldersSkipped++;
            log.skippedFolderNames.push(`${item} (Special character)`);
            continue;
          }

          // Check if series already exists in library
          if (seriesExists(item, currentSeriesList)) {
            log.foldersScanned++;
            log.foldersSkipped++;
            log.skippedFolderNames.push(`${item} (Already in library)`);
            continue;
          }

          log.foldersScanned++;

          // Find cover image
          const coverImagePath = findCoverImage(masterFolder, item, coverImageFolder, coverImageName);

          // Create and save new series
          const newSeries: Series = {
            id: uuidv4(),
            title: item,
            status: SeriesStatus.ONGOING,
            extensionId: FS_METADATA.id,
            sourceId: itemPath,
            preview: false,
            originalLanguageKey: LanguageKey.ENGLISH,
            altTitles: [],
            description: '',
            authors: [],
            artists: [],
            tags: [],
            remoteCoverUrl: '',
            trackerKeys: {},
            numberUnread: 0,
          };

          if (coverImagePath) {
            // Use pathToFileURL to create a proper file:// URL for the cover
            newSeries.remoteCoverUrl = pathToFileURL(coverImagePath).toString();
          }

          currentSeriesList.push(newSeries);
          log.seriesAdded++;

          console.info(`Added series: ${item}`);
        }

        // Create and save log file
        createSeriesAutoLog(log, appPath);

        console.info('Series Auto scan completed');
        return {
          success: true,
          log,
          updatedSeriesList: currentSeriesList,
        };
      } catch (error) {
        console.error('Error during Series Auto scan:', error);
        throw error;
      }
    },
  );

  ipcMain.handle(ipcChannels.SERIES_AUTO.GET_APP_PATH, () => {
    return appPath;
  });
};
