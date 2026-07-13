import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
const { ipcRenderer } = require('electron');
import ipcChannels from '@/common/constants/ipcChannels.json';
import PluginSettingsModal from './PluginSettingsModal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@houdoku/ui/components/Table';
import { Button } from '@houdoku/ui/components/Button';
import { Loader2 } from 'lucide-react';

const Plugins: React.FC = () => {
  const [currentOnlineReaderVersion, setCurrentOnlineReaderVersion] = useState<string | undefined>(undefined);
  const [showingSettingsModal, setShowingSettingsModal] = useState(false);

  const [reloading, setReloading] = useState(false);
  const location = useLocation();

  const refreshMetadata = async () => {
    setCurrentOnlineReaderVersion(undefined);

    const currentVersion = await ipcRenderer.invoke(ipcChannels.EXTENSION_MANAGER.GET_ONLINE_READER_VERSION);
    setCurrentOnlineReaderVersion(currentVersion);
  };

  const reloadPlugins = async () => {
    setReloading(true);
    await ipcRenderer.invoke(ipcChannels.EXTENSION_MANAGER.RELOAD).catch((e) => console.error(e));
    setReloading(false);
    refreshMetadata();
  };

  useEffect(() => {
    refreshMetadata();
  }, [location]);

  return (
    <div className="h-full overflow-auto flex flex-col">
      <PluginSettingsModal showing={showingSettingsModal} setShowing={setShowingSettingsModal} />

      <div className="flex justify-start py-2 space-x-2">
        <Button
          variant="outline"
          disabled={reloading}
          onClick={() => reloadPlugins()}
        >
          {reloading && <Loader2 className="animate-spin" />}
          Reload Content Sources
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Version</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Online Reader</TableCell>
            <TableCell>
              Built-in content sources for discovering and reading manga from various websites.
            </TableCell>
            <TableCell className="text-center">
              {currentOnlineReaderVersion}
            </TableCell>
            <TableCell>
              <div className="flex space-x-2">
                {currentOnlineReaderVersion !== undefined ? (
                  <Button variant={'outline'} onClick={() => setShowingSettingsModal(true)}>
                    Settings
                  </Button>
                ) : undefined}
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

export default Plugins;
