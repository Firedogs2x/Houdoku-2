import React from 'react';
const { ipcRenderer } = require('electron');
import { useRecoilState } from 'recoil';
import ipcChannels from '@/common/constants/ipcChannels.json';
import { createBackup, restoreBackup } from '@/renderer/util/backup';
import {
  autoBackupState,
  autoBackupCountState,
  autoCheckForUpdatesState,
} from '@/renderer/state/settingStates';
import { Checkbox } from '@houdoku/ui/components/Checkbox';
import { Label } from '@houdoku/ui/components/Label';
import { Switch } from '@houdoku/ui/components/Switch';
import { Input } from '@houdoku/ui/components/Input';
import { Button } from '@houdoku/ui/components/Button';
import { toast } from '@houdoku/ui/hooks/use-toast';

export const SettingsGeneral: React.FC = () => {
  const [autoCheckForUpdates, setAutoCheckForUpdates] = useRecoilState(autoCheckForUpdatesState);
  const [autoBackup, setAutoBackup] = useRecoilState(autoBackupState);
  const [autoBackupCount, setAutoBackupCount] = useRecoilState(autoBackupCountState);

  const handleRestoreBackup = () => {
    ipcRenderer
      .invoke(
        ipcChannels.APP.SHOW_OPEN_DIALOG,
        false,
        [
          {
            name: 'Houdoku Backup',
            extensions: ['json'],
          },
        ],
        'Select backup file',
      )
      .then((fileList: string) => {
        if (fileList.length > 0) {
          return ipcRenderer.invoke(ipcChannels.APP.READ_ENTIRE_FILE, fileList[0]);
        }
        return false;
      })
      .then((fileContent: string) => {
        if (fileContent) {
          const toastHandle = toast({
            title: 'Restoring backup...',
            description: 'This may take a few moments. Please wait...',
            duration: 600000, // 10 minutes
          });
          
          try {
            restoreBackup(fileContent);
            // Note: page will reload automatically after successful restore
          } catch (error) {
            toastHandle.dismiss();
            toast({
              title: 'Backup restore failed',
              description: error instanceof Error ? error.message : 'Unknown error occurred',
              variant: 'destructive',
              duration: 10000,
            });
          }
        }
      })
      .catch((error) => {
        console.error('[SettingsGeneral] Error during backup restore:', error);
        toast({
          title: 'Failed to load backup file',
          description: error instanceof Error ? error.message : 'Unknown error occurred',
          variant: 'destructive',
          duration: 10000,
        });
      });
  };

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

        <div className="flex space-x-2">
          <Button size="sm" onClick={createBackup}>
            Create Backup
          </Button>
          <Button size="sm" onClick={handleRestoreBackup}>
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
