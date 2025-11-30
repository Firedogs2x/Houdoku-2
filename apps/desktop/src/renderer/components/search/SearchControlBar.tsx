import React, { useState } from 'react';
import { ExtensionMetadata } from '@tiyo/common';
import { useRecoilState, useSetRecoilState, useRecoilValue } from 'recoil';
const { ipcRenderer } = require('electron');
import { useNavigate } from 'react-router-dom';
import {
  searchExtensionState,
  searchTextState,
  showingFilterDrawerState,
} from '@/renderer/state/searchStates';
import { FS_METADATA } from '@/common/temp_fs_metadata';
import ipcChannels from '@/common/constants/ipcChannels.json';
import routes from '@/common/constants/routes.json';
import storeKeys from '@/common/constants/storeKeys.json';
import persistantStore from '@/renderer/util/persistantStore';
import { Button } from '@houdoku/ui/components/Button';
import { HelpCircle, Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@houdoku/ui/components/Select';
import { Checkbox } from '@houdoku/ui/components/Checkbox';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@houdoku/ui/components/Tooltip';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@houdoku/ui/components/AlertDialog';
import { Input } from '@houdoku/ui/components/Input';
import { Label } from '@houdoku/ui/components/Label';
import {
  masterFolderState,
  useFolderAsTitleState,
  coverImageFolderState,
  coverImageNameState,
} from '@/renderer/state/settingStates';
import { seriesListState, reloadingSeriesListState } from '@/renderer/state/libraryStates';
import { reloadSeriesList } from '@/renderer/features/library/utils';
import { chapterLanguagesState } from '@/renderer/state/settingStates';
import library from '@/renderer/services/library';

interface Props {
  extensionList: ExtensionMetadata[];
  hasFilterOptions: boolean;
  handleSearch: (fresh?: boolean) => void;
  handleSearchFilesystem: (searchPaths: string[]) => void;
}

const SearchControlBar: React.FC<Props> = (props: Props) => {
  const navigate = useNavigate();
  const [searchExtension, setSearchExtension] = useRecoilState(searchExtensionState);
  const setSearchText = useSetRecoilState(searchTextState);
  const setShowingFilterDrawer = useSetRecoilState(showingFilterDrawerState);
  const [multiSeriesEnabled, setMultiSeriesEnabled] = useState(false);
  const [validationDialogShowing, setValidationDialogShowing] = useState(false);
  const [coverImageWarningShowing, setCoverImageWarningShowing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const masterFolder = useRecoilValue(masterFolderState);
  const useFolderAsTitle = useRecoilValue(useFolderAsTitleState);
  const coverImageFolder = useRecoilValue(coverImageFolderState);
  const coverImageName = useRecoilValue(coverImageNameState);
  const seriesList = useRecoilValue(seriesListState);
  const setSeriesList = useSetRecoilState(seriesListState);
  const setReloadingSeriesList = useSetRecoilState(reloadingSeriesListState);
  const chapterLanguages = useRecoilValue(chapterLanguagesState);

  const handleSelectDirectory = async () => {
    const fileList = await ipcRenderer.invoke(
      ipcChannels.APP.SHOW_OPEN_DIALOG,
      true,
      [],
      'Select Series Directory',
    );
    if (fileList.length <= 0) return;

    const selectedPath = fileList[0];

    const searchPaths = multiSeriesEnabled
      ? await ipcRenderer.invoke(ipcChannels.FILESYSTEM.LIST_DIRECTORY, selectedPath)
      : [selectedPath];

    props.handleSearchFilesystem(searchPaths);
  };

  const validateAndStartSeriesAuto = () => {
    console.debug('[Series Auto] Button clicked, validating settings...');
    console.debug(`[Series Auto] masterFolder: "${masterFolder}", useFolderAsTitle: ${useFolderAsTitle}, coverImageName: "${coverImageName}"`);
    
    // Check if Master Folder is selected and Use Folder as Title is set to Yes
    if (!masterFolder || useFolderAsTitle !== true) {
      console.debug('[Series Auto] Validation failed - showing validation dialog');
      setValidationDialogShowing(true);
      return;
    }

    // If Cover Image Name is not set, show warning
    if (!coverImageName) {
      console.debug('[Series Auto] Cover image name not set - showing warning dialog');
      setCoverImageWarningShowing(true);
      return;
    }

    // All conditions met, start the process
    console.debug('[Series Auto] Validation passed - starting Series Auto process');
    startSeriesAuto();
  };

  const startSeriesAuto = async () => {
    console.debug('[Series Auto] Starting Series Auto process');
    setIsProcessing(true);
    try {
      console.debug('[Series Auto] Invoking IPC handler with options:', {
        masterFolder,
        coverImageFolder,
        coverImageName,
        currentSeriesListLength: seriesList.length,
      });
      
      const response = await ipcRenderer.invoke(ipcChannels.SERIES_AUTO.SCAN_AND_ADD_SERIES, {
        masterFolder,
        coverImageFolder,
        coverImageName,
        currentSeriesList: seriesList,
      });

      console.debug('[Series Auto] IPC handler completed successfully');
      console.debug('[Series Auto] Response:', response);
      console.debug('[Series Auto] Log:', response.log);

      // Update the series list with the newly added series from the handler
      if (response.updatedSeriesList && response.updatedSeriesList.length > 0) {
        console.debug('[Series Auto] Updating series list with', response.updatedSeriesList.length, 'total series');
        
        // Save the updated series list to persistent storage
        persistantStore.write(
          `${storeKeys.LIBRARY.SERIES_LIST}`,
          JSON.stringify(response.updatedSeriesList),
        );
        console.debug('[Series Auto] Series list saved to storage');
        
        // Update the Recoil state
        setSeriesList(response.updatedSeriesList);
        console.debug('[Series Auto] Recoil state updated');
      } else {
        console.warn('[Series Auto] No updated series list returned from handler');
      }

      // Navigate to the library page
      console.debug('[Series Auto] Navigating to library');
      navigate(routes.LIBRARY);
    } catch (error) {
      console.error('[Series Auto] Error during Series Auto:', error);
    } finally {
      setIsProcessing(false);
      setCoverImageWarningShowing(false);
    }
  };

  const renderFilesystemControls = () => {
    return (
      <>
        <div className="flex space-x-4">
          <Button onClick={handleSelectDirectory}>Select Directory</Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex space-x-2 items-center">
                  <Checkbox
                    id="checkboxMultiSeriesMode"
                    checked={multiSeriesEnabled}
                    onCheckedChange={() => setMultiSeriesEnabled(!multiSeriesEnabled)}
                  />
                  <Label
                    htmlFor="checkboxMultiSeriesMode"
                    className="flex text-sm font-medium items-center space-x-2"
                  >
                    <span>Multi-series mode</span>
                    <HelpCircle className="w-4 h-4" />
                  </Label>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>
                  When multi-series mode is enabled, each item in the selected
                  <br />
                  directory is treated as a separate series.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button 
            onClick={validateAndStartSeriesAuto}
            disabled={isProcessing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isProcessing ? 'Processing...' : 'Series Auto'}
          </Button>
        </div>

        {/* Validation Warning Dialog */}
        <AlertDialog open={validationDialogShowing} onOpenChange={setValidationDialogShowing}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Notice</AlertDialogTitle>
            </AlertDialogHeader>
            <p className="text-sm">
              To use this function you need to Select the "Master Folder" and set the "Use folder as manga title?" to "Yes".
            </p>
            <AlertDialogFooter>
              <Button 
                onClick={() => setValidationDialogShowing(false)}
                variant="outline"
                className="bg-blue-600 hover:bg-blue-700 text-white border-none"
              >
                Cancel
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Cover Image Name Warning Dialog */}
        <AlertDialog open={coverImageWarningShowing} onOpenChange={setCoverImageWarningShowing}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Notice</AlertDialogTitle>
            </AlertDialogHeader>
            <p className="text-sm">
              You have not specified a "Cover Image Name". If you continue adding the cover image will have to be added manually later.
            </p>
            <AlertDialogFooter>
              <Button 
                onClick={() => setCoverImageWarningShowing(false)}
                variant="outline"
                className="bg-blue-600 hover:bg-blue-700 text-white border-none"
              >
                Cancel
              </Button>
              <Button 
                onClick={startSeriesAuto}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Continue
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  };

  const renderStandardControls = () => {
    return (
      <>
        <form
          className="flex flex-1 space-x-2"
          onSubmit={(e) => {
            e.preventDefault();
            props.handleSearch(true);
            return false;
          }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-8 w-full"
              placeholder="Search for a series..."
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
            />
          </div>
          <Button type="submit">Search</Button>
        </form>
        {props.hasFilterOptions ? (
          <Button variant="secondary" onClick={() => setShowingFilterDrawer(true)}>
            Options
          </Button>
        ) : undefined}
      </>
    );
  };

  return (
    <div className="flex space-x-2 py-3">
      <Select
        defaultValue={searchExtension}
        onValueChange={(value) => setSearchExtension(value || searchExtension)}
      >
        <SelectTrigger className="max-w-52">
          <SelectValue placeholder="Select extension" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {props.extensionList
              .map((metadata: ExtensionMetadata) => ({
                value: metadata.id,
                label: metadata.name,
              }))
              .map((metadata) => (
                <SelectItem key={metadata.value} value={metadata.value}>
                  {metadata.label}
                </SelectItem>
              ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      {searchExtension === FS_METADATA.id ? renderFilesystemControls() : renderStandardControls()}
    </div>
  );
};

export default SearchControlBar;
