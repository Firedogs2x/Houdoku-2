import React, { useEffect, useState } from 'react';
const aki = require('aki-plugin-manager');
import { useLocation } from 'react-router-dom';
const { ipcRenderer } = require('electron');
import { gt } from 'semver';
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
  const [currentDownloaderVersion, setCurrentDownloaderVersion] = useState<string | undefined>(undefined);
  const [availableDownloaderVersion, setAvailableDownloaderVersion] = useState<string | undefined>(undefined);
  const [showingSettingsModal, setShowingSettingsModal] = useState(false);

  const [installingPlugins, setInstallingPlugins] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [reloading, setReloading] = useState(false);
  const location = useLocation();

  const refreshMetadata = async () => {
    setRefreshing(true);
    setCurrentDownloaderVersion(undefined);
    setAvailableDownloaderVersion(undefined);

    const currentVersion = await ipcRenderer.invoke(ipcChannels.EXTENSION_MANAGER.GET_TIYO_VERSION);
    setCurrentDownloaderVersion(currentVersion);

    await aki
      // TODO hack
      .search('author:xgi @houdoku/downloader-core', '', 1)
      // biome-ignore lint/suspicious/noExplicitAny: TODO external schema
      .then((results: any) => {
        if (results.objects.length > 0) {
          setAvailableDownloaderVersion(results.objects[0].package.version);
        }
      })
      .catch(console.error);
    setRefreshing(false);
  };

  const handleInstall = (pkgName: string, version: string) => {
    console.info(`Installing plugin ${pkgName}@${version}`);
    setInstallingPlugins([...installingPlugins, pkgName]);

    ipcRenderer
      .invoke(ipcChannels.EXTENSION_MANAGER.INSTALL, pkgName, version)
      .then(() => ipcRenderer.invoke(ipcChannels.EXTENSION_MANAGER.RELOAD))
      .then(() => refreshMetadata())
      .catch((e) => console.error(e))
      .finally(() => setInstallingPlugins(installingPlugins.filter((item) => item !== pkgName)))
      .catch((e) => console.error(e));
  };

  const handleRemove = (pkgName: string) => {
    console.info(`Removing plugin ${pkgName}...`);

    ipcRenderer
      .invoke(ipcChannels.EXTENSION_MANAGER.UNINSTALL, pkgName)
      .then(() => ipcRenderer.invoke(ipcChannels.EXTENSION_MANAGER.RELOAD))
      .then(() => refreshMetadata())
      .catch((e) => console.error(e));
  };

  const reloadPlugins = async () => {
    setReloading(true);
    await ipcRenderer.invoke(ipcChannels.EXTENSION_MANAGER.RELOAD).catch((e) => console.error(e));
    setReloading(false);
    refreshMetadata();
  };

  const renderInstallOrUninstallButton = () => {
    const isNotInstalled = currentDownloaderVersion === undefined && availableDownloaderVersion !== undefined;
    const loading = installingPlugins.includes('@houdoku/downloader-core');

    if (isNotInstalled) {
      return (
        <Button
          disabled={loading}
          onClick={() => handleInstall('@houdoku/downloader-core', availableDownloaderVersion)}
        >
          {loading && <Loader2 className="animate-spin" />}
          {installingPlugins.includes('@houdoku/downloader-core') ? 'Installing...' : 'Install'}
        </Button>
      );
    }

    return (
      <Button variant="destructive" onClick={() => handleRemove('@houdoku/downloader-core')}>
        Uninstall
      </Button>
    );
  };

  useEffect(() => {
    refreshMetadata();
  }, [location]);

  const downloaderCanUpdate =
    currentDownloaderVersion && availableDownloaderVersion && gt(currentDownloaderVersion, availableDownloaderVersion);

  return (
    <div className="h-full overflow-auto flex flex-col">
      <PluginSettingsModal showing={showingSettingsModal} setShowing={setShowingSettingsModal} />

      <div className="flex justify-start py-2 space-x-2">
        <Button disabled={refreshing} onClick={() => refreshMetadata()}>
          {refreshing && <Loader2 className="animate-spin" />}
          Check for Updates
        </Button>
        <Button
          variant="outline"
          disabled={reloading || currentDownloaderVersion === undefined}
          onClick={() => reloadPlugins()}
        >
          {reloading && <Loader2 className="animate-spin" />}
          Reload Installed Plugins
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
            <TableCell>Houdoku-2-Downloader</TableCell>
            <TableCell>
              Adds support for importing content from other sources, including 3rd-party websites.
            </TableCell>
            <TableCell className="text-center">
              {availableDownloaderVersion === currentDownloaderVersion || !currentDownloaderVersion ? (
                availableDownloaderVersion
              ) : (
                <>
                  {currentDownloaderVersion}→
                  <span className="font-bold underline">{availableDownloaderVersion}</span>
                </>
              )}
            </TableCell>
            <TableCell>
              <div className="flex space-x-2">
                {currentDownloaderVersion !== undefined ? (
                  <Button variant={'outline'} onClick={() => setShowingSettingsModal(true)}>
                    Settings
                  </Button>
                ) : undefined}

                {downloaderCanUpdate ? (
                  <Button onClick={() => handleInstall('@houdoku/downloader-core', availableDownloaderVersion)}>
                    Update
                  </Button>
                ) : undefined}
                {renderInstallOrUninstallButton()}
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

export default Plugins;
