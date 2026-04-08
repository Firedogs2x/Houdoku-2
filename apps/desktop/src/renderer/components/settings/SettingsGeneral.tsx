import React from 'react';
const { ipcRenderer } = require('electron');
const fs = require('fs');
import { FolderOpen } from 'lucide-react';
import { useRecoilState } from 'recoil';
import ipcChannels from '@/common/constants/ipcChannels.json';
import { toast } from '@houdoku/ui/hooks/use-toast';
import { createBackup, getConfiguredBackupDirectory, restoreBackup } from '@/renderer/util/backup';
import {
  autoBackupState,
  autoBackupCountState,
  autoCheckForUpdatesState,
  backupFolderState,
} from '@/renderer/state/settingStates';
import { Checkbox } from '@houdoku/ui/components/Checkbox';
import { Label } from '@houdoku/ui/components/Label';
import { Switch } from '@houdoku/ui/components/Switch';
import { Input } from '@houdoku/ui/components/Input';
import { Button } from '@houdoku/ui/components/Button';

export const SettingsGeneral: React.FC = () => {
  const [autoCheckForUpdates, setAutoCheckForUpdates] = useRecoilState(autoCheckForUpdatesState);
  const [autoBackup, setAutoBackup] = useRecoilState(autoBackupState);
  const [autoBackupCount, setAutoBackupCount] = useRecoilState(autoBackupCountState);
  const [backupFolder, setBackupFolder] = useRecoilState(backupFolderState);

  const handleSelectBackupFolder = () => {
    ipcRenderer
      .invoke(ipcChannels.APP.SHOW_OPEN_DIALOG, true, [], 'Select Backup Folder')
      .then((fileList: string[]) => {
        if (fileList && fileList.length > 0) {
          setBackupFolder(fileList[0]);
        }
      })
      .catch((error: unknown) => {
        console.error(error);
        toast({
          title: 'Failed to select backup folder',
          description: 'An error occurred while opening the folder picker.',
        });
      });
  };

  const handleCreateBackup = async () => {
    try {
      await createBackup();
    } catch (error) {
      console.error(error);
    }
  };

  const handleRestoreBackup = async () => {
    let configuredBackupFolder: string;

    try {
      configuredBackupFolder = getConfiguredBackupDirectory();
    } catch (error) {
      console.error(error);
      toast({
        title: 'Backup folder required',
        description:
          'Select a valid backup folder before creating or restoring backups. Please create the folder before selecting it.',
      });
      return;
    }

    try {
      const fileList = (await ipcRenderer.invoke(
        ipcChannels.APP.SHOW_OPEN_DIALOG,
        false,
        [
          {
            name: 'Houdoku Backup',
            extensions: ['json'],
          },
        ],
        'Select backup file',
        configuredBackupFolder,
      )) as string[];

      if (!fileList || fileList.length === 0) {
        return;
      }

      const selectedFile = fileList[0];
      if (!fs.existsSync(selectedFile)) {
        toast({
          title: 'Backup file not found',
          description: 'The selected backup file could not be found.',
        });
        return;
      }

      const fileContent = (await ipcRenderer.invoke(
        ipcChannels.APP.READ_ENTIRE_FILE,
        selectedFile,
      )) as string;

      restoreBackup(fileContent);
      toast({
        title: 'Backup restored',
        description: 'Your backup file was restored successfully.',
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Failed to restore backup',
        description: 'An error occurred while restoring the selected backup file.',
      });
    }
  };

  const backupFolderDisplay = backupFolder
    ? backupFolder.split(/[\\/]/).pop()
    : 'Set as Backup Folder';

  return (
    <>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="checkboxCheckForUpdatesAutomatically"
          checked={autoCheckForUpdates}
          onCheckedChange={(checked) => setAutoCheckForUpdates(checked === true)}
        />
        <Label htmlFor="checkboxCheckForUpdatesAutomatically" className="font-normal">
          Check for Houdoku updates automatically
        </Label>
      </div>

      <div className="flex flex-col space-y-2">
        <div>
          <h3 className="pb-0 mb-0 font-medium">Backup</h3>
          <p className="text-muted-foreground text-sm pt-0 !mt-0">
            Options for backing up your data.
          </p>
        </div>

        <div className="pt-2 flex items-start space-x-2">
          <div className="flex-1">
            <div>
              <h3 className="pb-0 mb-0 font-medium">Set Backup Folder:</h3>
              <p className="text-muted-foreground text-sm pt-0 !mt-0">
                Set Backup Folder: Click the folder icon to open the file explorer. Select the
                folder where you wish to save all of your backup files. Please create the folder
                prior to selecting it.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="default"
            onClick={handleSelectBackupFolder}
            className="border border-input"
          >
            <FolderOpen />
          </Button>
          <Input readOnly value={backupFolderDisplay} className="flex-1" />
        </div>

        <div className="h-4" aria-hidden="true" />

        <div className="flex space-x-2">
          <Button size="sm" onClick={() => void handleCreateBackup()}>
            Create Backup
          </Button>
          <Button size="sm" onClick={() => void handleRestoreBackup()}>
            Restore Backup
          </Button>
        </div>
        <div className="border rounded-lg p-4 flex flex-col space-y-2">
          <div className="space-y-2 flex flex-row items-center justify-between">
            <div className="space-y-0.5">
              <span>Automatic backups</span>
              <p className="text-sm text-muted-foreground">Automatically backup your library.</p>
            </div>
            <Switch checked={autoBackup} onCheckedChange={(checked) => setAutoBackup(checked)} />
          </div>
          {autoBackup && (
            <div className="flex items-center space-x-2">
              <span>Create up to</span>
              <Input
                className="max-w-20"
                type="number"
                value={autoBackupCount}
                min={1}
                onChange={(e) => setAutoBackupCount(+e.target.value)}
              />
              <span>daily backups.</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
