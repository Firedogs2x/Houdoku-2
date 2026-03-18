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
import { toast } from '@houdoku/ui/hooks/use-toast';

type TiyoPluginUpdateStatus = {
  checked: boolean;
  installed: boolean;
  currentVersion?: string;
  latestVersion?: string;
  updateAvailable: boolean;
};

const Plugins: React.FC = () => {
  const [currentTiyoVersion, setCurrentTiyoVersion] = useState<string | undefined>(undefined);
  const [availableTiyoVersion, setAvailableTiyoVersion] = useState<string | undefined>(undefined);
  const [tiyoUpdateAvailable, setTiyoUpdateAvailable] = useState(false);
  const [showingSettingsModal, setShowingSettingsModal] = useState(false);

  const [refreshing, setRefreshing] = useState(false);
  const [reloading, setReloading] = useState(false);
  const [installingFromRelease, setInstallingFromRelease] = useState(false);
  const location = useLocation();

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    return 'Unknown error';
  };

  const refreshMetadata = async (showResultToast: boolean = false) => {
    setRefreshing(true);
    setCurrentTiyoVersion(undefined);
    setAvailableTiyoVersion(undefined);
    setTiyoUpdateAvailable(false);

    try {
      const [currentVersion, updateStatus] = await Promise.all([
        ipcRenderer.invoke(ipcChannels.EXTENSION_MANAGER.GET_TIYO_VERSION),
        ipcRenderer.invoke(ipcChannels.EXTENSION_MANAGER.CHECK_FOR_UPDATES),
      ]);

      const typedStatus = updateStatus as TiyoPluginUpdateStatus;

      setCurrentTiyoVersion(currentVersion || typedStatus.currentVersion);
      setAvailableTiyoVersion(typedStatus.latestVersion);
      setTiyoUpdateAvailable(typedStatus.updateAvailable === true);

      if (showResultToast) {
        if (!typedStatus.checked) {
          toast({
            title: 'Tiyo update check failed',
            description: 'Could not confirm latest Tiyo release right now.',
            duration: 5000,
          });
        } else if (typedStatus.updateAvailable) {
          toast({
            title: 'Tiyo update available',
            description: `Latest: ${typedStatus.latestVersion || 'unknown'}`,
            duration: 5000,
          });
        } else {
          toast({
            title: 'Tiyo is up to date',
            description: `Current: ${typedStatus.currentVersion || 'unknown'}`,
            duration: 5000,
          });
        }
      }
    } catch (error) {
      console.error(error);
      if (showResultToast) {
        toast({
          title: 'Tiyo update check failed',
          description: getErrorMessage(error),
          duration: 6000,
        });
      }
    } finally {
      setRefreshing(false);
    }
  };

  const installOrUpdateFromReleaseZip = async () => {
    setInstallingFromRelease(true);

    try {
      await ipcRenderer.invoke(ipcChannels.EXTENSION_MANAGER.INSTALL_FROM_RELEASE_ZIP);
      await ipcRenderer.invoke(ipcChannels.EXTENSION_MANAGER.RELOAD);
      await refreshMetadata();

      toast({
        title: currentTiyoVersion ? 'Tiyo updated' : 'Tiyo installed',
        description: 'Tiyo was installed from the latest release asset.',
        duration: 5000,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Failed to install Tiyo',
        description: getErrorMessage(error),
        duration: 8000,
      });
    } finally {
      setInstallingFromRelease(false);
    }
  };

  const handleRemove = async () => {
    try {
      await ipcRenderer.invoke(ipcChannels.EXTENSION_MANAGER.UNINSTALL, '@tiyo/core');
      await ipcRenderer.invoke(ipcChannels.EXTENSION_MANAGER.RELOAD);
      await refreshMetadata();

      toast({
        title: 'Tiyo uninstalled',
        description: 'Tiyo was removed successfully.',
        duration: 5000,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Failed to uninstall Tiyo',
        description: getErrorMessage(error),
        duration: 8000,
      });
    }
  };

  const reloadPlugins = async () => {
    setReloading(true);
    await ipcRenderer.invoke(ipcChannels.EXTENSION_MANAGER.RELOAD).catch((e) => console.error(e));
    setReloading(false);
    refreshMetadata(true);
  };

  const renderInstallOrUninstallButton = () => {
    if (currentTiyoVersion === undefined) {
      return (
        <Button disabled={installingFromRelease} onClick={() => installOrUpdateFromReleaseZip()}>
          {installingFromRelease && <Loader2 className="animate-spin" />}
          Install
        </Button>
      );
    }

    return (
      <Button variant="destructive" onClick={() => handleRemove()}>
        Uninstall
      </Button>
    );
  };

  useEffect(() => {
    refreshMetadata();
  }, [location]);

  return (
    <div className="h-full overflow-auto flex flex-col">
      <PluginSettingsModal showing={showingSettingsModal} setShowing={setShowingSettingsModal} />

      <div className="flex justify-start py-2 space-x-2">
        <Button disabled={refreshing} onClick={() => refreshMetadata(true)}>
          {refreshing && <Loader2 className="animate-spin" />}
          Check for Updates
        </Button>
        <Button
          variant="outline"
          disabled={reloading || currentTiyoVersion === undefined}
          onClick={() => reloadPlugins()}
        >
          {reloading && <Loader2 className="animate-spin" />}
          Reload Installed Plugins
        </Button>
        <Button disabled={installingFromRelease} onClick={() => installOrUpdateFromReleaseZip()}>
          {installingFromRelease && <Loader2 className="animate-spin" />}
          Install/Update from Release ZIP
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
            <TableCell>Tiyo Extension Manager</TableCell>
            <TableCell>
              Adds support for importing content from other sources, including 3rd-party websites.
            </TableCell>
            <TableCell className="text-center">
              {currentTiyoVersion ? (
                tiyoUpdateAvailable && availableTiyoVersion ? (
                  <>
                    {currentTiyoVersion}→
                    <span className="font-bold underline">{availableTiyoVersion}</span>
                  </>
                ) : (
                  currentTiyoVersion
                )
              ) : (
                ''
              )}
            </TableCell>
            <TableCell>
              <div className="flex space-x-2">
                {currentTiyoVersion !== undefined ? (
                  <Button variant={'outline'} onClick={() => setShowingSettingsModal(true)}>
                    Settings
                  </Button>
                ) : undefined}

                {currentTiyoVersion !== undefined && tiyoUpdateAvailable ? (
                  <Button
                    disabled={installingFromRelease}
                    onClick={() => installOrUpdateFromReleaseZip()}
                  >
                    {installingFromRelease && <Loader2 className="animate-spin" />}
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
