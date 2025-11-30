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
} from '@/renderer/state/settingStates';

export const SettingsFolders: React.FC = () => {
  const [masterFolder, setMasterFolder] = useRecoilState(masterFolderState);
  const [useFolderAsTitle, setUseFolderAsTitle] = useRecoilState(useFolderAsTitleState);
  const [coverImageFolder, setCoverImageFolder] = useRecoilState(coverImageFolderState);
  const [coverImageName, setCoverImageName] = useRecoilState(coverImageNameState);

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
    <ScrollArea className="h-full w-full">
      <div className="flex flex-col space-y-4 pr-4">
      <div className="flex items-center space-x-2">
        <h3 className="pb-0 mb-0 font-medium">How to setup folders.</h3>
      </div>

      <div className="flex items-start space-x-2">
        <div className="flex-1">
          <div>
            <h3 className="pb-0 mb-0 font-medium">Set Master Folder:</h3>
            <p className="text-muted-foreground text-sm pt-0 !mt-0">
              Here you will click the folder icon to open the file explorer. You will select the
              folder where all of your mangas files will be located.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" onClick={handleSelectMasterFolder}>
          <FolderOpen />
        </Button>
        <Input readOnly value={folderDisplay} className="flex-1" />
      </div>

      <div className="flex items-start space-x-2">
        <div className="flex-1">
          <h3 className="pb-0 mb-0 font-medium">Set Folder Functions:</h3>
          <p className="text-muted-foreground text-sm pt-0 !mt-0">
            This option will allow you to select if you want the name of the folders inside
            the Master folder to be used as titles when adding the manga to the reader. If “No” is
            selected this option will be ignored. If “Yes” is selected then the folder names will
            be used as the manga's title.
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
            Where is your cover image located? Type the folder where it is located. If the
            cover image is to be located inside the folder selected to be used as the title
            leave the default setting which is "Title". Otherwise click in the text box and
            type in the name of the folder. Next type in the cover image name. (To use this
            option the name of all of the cover images must be the same)
          </p>
        </div>
      </div>

      <div className="flex flex-col space-y-2">
        <div className="flex items-center space-x-2">
          <Label className="text-muted-foreground text-sm w-40">Folder Name:</Label>
          <Input
            value={coverImageFolder}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCoverImageFolder(e.target.value)}
            placeholder="Title"
            className="w-48"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Label className="text-muted-foreground text-sm w-40">Cover Image Name:</Label>
          <Input
            value={coverImageName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCoverImageName(e.target.value)}
            placeholder="Name"
            className="w-48"
          />
        </div>
      </div>
    </div>
    </ScrollArea>
  );
};

export default SettingsFolders;
