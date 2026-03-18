import path from 'path';
import { app } from 'electron';
import fs from 'fs';

export const THUMBNAILS_DIR = path.join(app.getPath('userData'), 'thumbnails');
export const PLUGINS_DIR = path.join(app.getPath('userData'), 'plugins');
export const DEFAULT_DOWNLOADS_DIR = path.join(app.getPath('userData'), 'downloads');
export const LOGS_DIR = path.join(app.getPath('userData'), 'logs');
export const EXTRACT_DIR = path.join(app.getPath('userData'), 'extracted');
export const KEIYOUSHI_APK_EXTENSIONS_DIR = path.join(
	app.getPath('userData'),
	'Keiyoushi APK Extensions',
);

export function ensureAppDataDirectories(): void {
	const appDataDirs = [
		THUMBNAILS_DIR,
		PLUGINS_DIR,
		DEFAULT_DOWNLOADS_DIR,
		LOGS_DIR,
		EXTRACT_DIR,
		KEIYOUSHI_APK_EXTENSIONS_DIR,
	];

	appDataDirs.forEach((dirPath) => {
		fs.mkdirSync(dirPath, { recursive: true });
	});
}
