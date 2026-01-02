import React from 'react';
const { ipcRenderer } = require('electron');
import { FolderOpen } from 'lucide-react';
import ipcChannels from '@/common/constants/ipcChannels.json';
import { Input } from '@houdoku/ui/components/Input';
import { Button } from '@houdoku/ui/components/Button';
import { useRecoilState } from 'recoil';
import { Checkbox } from '@houdoku/ui/components/Checkbox';
import { Label } from '@houdoku/ui/components/Label';
import { ScrollArea } from '@houdoku/ui/components/ScrollArea';
import {
  masterFolderState,
  useFolderAsTitleState,
  coverImageFolderState,
  coverImageNameState,
  chapterFolderState,
  chapterNameState,
} from '@/renderer/state/settingStates';

export const SettingsFolders: React.FC = () => {
  const [masterFolder, setMasterFolder] = useRecoilState(masterFolderState);
  const [useFolderAsTitle, setUseFolderAsTitle] = useRecoilState(useFolderAsTitleState);
  const [coverImageFolder, setCoverImageFolder] = useRecoilState(coverImageFolderState);
  const [coverImageName, setCoverImageName] = useRecoilState(coverImageNameState);
  const [chapterFolder, setChapterFolder] = useRecoilState(chapterFolderState);
  const [_chapterName, _setChapterName] = useRecoilState(chapterNameState);

  const handleSelectMasterFolder = () => {
    ipcRenderer
      .invoke(ipcChannels.APP.SHOW_OPEN_DIALOG, true, [], 'Select Master Folder')
      .then((fileList: string[]) => {
        if (fileList && fileList.length > 0) {
          setMasterFolder(fileList[0]);
        }
      })
      .catch(console.error);
  };

  const folderDisplay = masterFolder ? masterFolder.split(/[\\/]/).pop() : 'Set as Master Folder';

  return (
    <ScrollArea className="h-full w-full [&>div:nth-child(2)]:border-l-0 [&>div:nth-child(2)>div]:bg-transparent">
      <div className="flex flex-col space-y-4 pr-4">
      <div className="flex items-center space-x-2">
        <h3 className="pb-0 mb-0 font-medium">How to setup folders.</h3>
      </div>

      <div className="flex items-start space-x-2">
        <div className="flex-1">
          <div>
            <h3 className="pb-0 mb-0 font-medium">Set Master Folder:</h3>
            <p className="text-muted-foreground text-sm pt-0 !mt-0">
              Set Master Folder: Click the folder icon to open the file explorer. Select the folder
              where all of your series files are located.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="default" onClick={handleSelectMasterFolder} className="border border-input">
          <FolderOpen />
        </Button>
        <Input readOnly value={folderDisplay} className="flex-1" />
      </div>

      <div className="flex items-start space-x-2">
        <div className="flex-1">
          <h3 className="pb-0 mb-0 font-medium">Set Folder Functions:</h3>
          <p className="text-muted-foreground text-sm pt-0 !mt-0">
            Set Folder Functions: This option allows you to select if the names of the sub folders
            (level one), below the Master folder, will be used as titles for the series. If “Yes” is
            selected then sub folders names are used as titles. If “No” is selected this option is
            ignored.
          </p>
        </div>
      </div>

      <div className="flex flex-col space-y-2">
        <span className="font-medium">Use folder as manga's title?</span>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="useFolderAsTitleNo"
            checked={useFolderAsTitle === false}
            onCheckedChange={(checked) => setUseFolderAsTitle(!(checked === true))}
          />
          <Label htmlFor="useFolderAsTitleNo" className="font-normal">
            No
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="useFolderAsTitleYes"
            checked={useFolderAsTitle === true}
            onCheckedChange={(checked) => setUseFolderAsTitle(checked === true)}
          />
          <Label htmlFor="useFolderAsTitleYes" className="font-normal">
            Yes
          </Label>
        </div>
      </div>

      <div className="flex items-start space-x-2">
        <div className="flex-1">
          <h3 className="pb-0 mb-0 font-medium">Cover Image:</h3>
          <p className="text-muted-foreground text-sm pt-0 !mt-0">
            Cover Image: Set the folder where your cover image, per series, is located? Type the
            folder name where the cover image is located. If the cover image is located inside the
            sub folder (level one), below the Master folder, then leave the default setting which
            is "Title". If the image is located in a sub folder (level two), below a sub folder
            (level one), then click in the text box and type in the name of the folder. Next type
            in the cover image name. (Currently this option only allows one name to be used for
            all cover images.)
          </p>
        </div>
      </div>

      <div className="flex flex-col space-y-2">
        <div className="flex items-center space-x-2">
          <Input readOnly value={'Folder Name:'} className="text-muted-foreground text-sm w-40" />
          <Input
            value={coverImageFolder}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCoverImageFolder(e.target.value)}
            placeholder="Title"
            className="w-48"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Input readOnly value={'Cover Image Name:'} className="text-muted-foreground text-sm w-40" />
          <Input
            value={coverImageName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCoverImageName(e.target.value)}
            placeholder="Name"
            className="w-48"
          />
        </div>


        {/* Chapter Folder section (same structure as Cover Image settings) */}
        <div className="flex items-start space-x-2 pt-2">
          <div className="flex-1">
            <h3 className="pb-0 mb-0 font-medium">Chapter Folder:</h3>
            <p className="text-muted-foreground text-sm pt-0 !mt-0">
              Chapter Folder: This option allows you to select where the series chapters are
              located. If the chapters are located inside the sub folder (level one), below the
              Master folder, then leave the default setting which is "Title". If the chapters are
              located in a sub folder (level two), below a sub folder (level one), then click in
              the text box and type in the name of the folder. Settings should be identical to the
              Cover Image text.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Input readOnly value={'Folder Name:'} className="text-muted-foreground text-sm w-40" />
          <Input
            value={chapterFolder}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setChapterFolder(e.target.value)}
            placeholder="Title"
            className="w-48"
          />
        </div>

        {/* Only the Folder Name row is shown for Chapter Folder as requested */}
      </div>
    </div>
    </ScrollArea>
  );
};

export default SettingsFolders;
