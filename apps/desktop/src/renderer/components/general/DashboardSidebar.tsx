import * as React from 'react';
const { ipcRenderer } = require('electron');
import ipcChannels from '@/common/constants/ipcChannels.json';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from '@houdoku/ui/components/Sidebar';
import { useNavigate } from 'react-router-dom';
import routes from '@/common/constants/routes.json';
import {
  Blocks,
  ChevronRight,
  FolderDown,
  GitFork,
  Home,
  Info,
  LibraryBig,
  PencilIcon,
  Settings,
  SquarePlus,
  Trash2Icon,
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@houdoku/ui/components/Collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@houdoku/ui/components/DropdownMenu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@houdoku/ui/components/Dialog';
import { Button } from '@houdoku/ui/components/Button';
import packageJson from '../../../../package.json';
import { SettingsDialogContent } from '../settings/SettingsDialogContent';
import { categoryListState } from '@/renderer/state/libraryStates';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { useMemo, useState } from 'react';
import { libraryFilterCategoryState } from '@/renderer/state/settingStates';
import { NewCategoryDialog } from './NewCategoryDialog';
import { Category } from '@/common/models/types';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@houdoku/ui/components/ContextMenu';
import { EditCategoryDialog } from './EditCategoryDialog';
import { RemoveCategoryDialog } from './RemoveCategoryDialog';

/**
 * Sorts categories: numeric values (0-9) first, then alphabetical (A-Z).
 * Comparison is case-insensitive for alphabetical sorting.
 */
const sortCategories = (a: Category, b: Category): number => {
  const aLabel = a.label.trim();
  const bLabel = b.label.trim();

  const aStartsWithDigit = /^\d/.test(aLabel);
  const bStartsWithDigit = /^\d/.test(bLabel);

  if (aStartsWithDigit && bStartsWithDigit) {
    const aNum = parseInt(aLabel.match(/^\d+/)![0], 10);
    const bNum = parseInt(bLabel.match(/^\d+/)![0], 10);
    if (aNum !== bNum) return aNum - bNum;
    // If numeric prefix is the same, fall through to alphabetical comparison
    return aLabel.localeCompare(bLabel, undefined, { sensitivity: 'base' });
  }
  if (aStartsWithDigit && !bStartsWithDigit) return -1;
  if (!aStartsWithDigit && bStartsWithDigit) return 1;

  return aLabel.localeCompare(bLabel, undefined, { sensitivity: 'base' });
};

export function DashboardSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const navigate = useNavigate();
  const [checkingForUpdate, setCheckingForUpdate] = useState(false);
  const [showingNewCategoryDialog, setShowingNewCategoryDialog] = useState(false);
  const [showingEditCategoryDialog, setShowingEditCategoryDialog] = useState(false);
  const [showingRemoveCategoryDialog, setShowingRemoveCategoryDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>(undefined);
  const categories = useRecoilValue(categoryListState);
  const sortedCategories = useMemo(() => [...categories].sort(sortCategories), [categories]);
  const setLibraryFilterCategory = useSetRecoilState(libraryFilterCategoryState);

  const handleUpdateCheck = () => {
    if (!checkingForUpdate) {
      setCheckingForUpdate(true);
      ipcRenderer
        .invoke(ipcChannels.APP.CHECK_FOR_UPDATES)
        .finally(() => setCheckingForUpdate(false))
        .catch(console.error);
    }
  };

  return (
    <Sidebar {...props}>
      <SidebarHeader className="pt-4" />
      <SidebarContent>
        <NewCategoryDialog
          open={showingNewCategoryDialog}
          onOpenChange={setShowingNewCategoryDialog}
        />
        {selectedCategory && (
          <EditCategoryDialog
            open={showingEditCategoryDialog}
            onOpenChange={setShowingEditCategoryDialog}
            category={selectedCategory!}
          />
        )}
        {selectedCategory && (
          <RemoveCategoryDialog
            open={showingRemoveCategoryDialog}
            onOpenChange={setShowingRemoveCategoryDialog}
            category={selectedCategory!}
          />
        )}

        <SidebarGroup>
          {/* <SidebarGroupLabel>Platform</SidebarGroupLabel> */}
          <SidebarMenu>
            <Collapsible asChild defaultOpen={true} className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton>
                    <LibraryBig />
                    <span>Library</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        onClick={() => {
                          setLibraryFilterCategory('');
                          navigate(routes.LIBRARY);
                        }}
                      >
                        <span className="truncate max-w-[12rem]">All Series</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    {sortedCategories.map((category) => (
                      <SidebarMenuSubItem key={category.id}>
                        <ContextMenu>
                          <ContextMenuTrigger>
                            <SidebarMenuSubButton
                              onClick={() => {
                                setLibraryFilterCategory(category.id);
                                navigate(routes.LIBRARY);
                              }}
                            >
                              <span className="truncate max-w-[12rem]">
                                {category.label}
                              </span>
                            </SidebarMenuSubButton>
                          </ContextMenuTrigger>
                          <ContextMenuContent className="w-40">
                            <ContextMenuItem
                              onClick={() => {
                                setSelectedCategory(category);
                                setShowingEditCategoryDialog(true);
                              }}
                            >
                              <PencilIcon className="h-4 w-4 mr-2" />
                              Edit category
                            </ContextMenuItem>
                            <ContextMenuItem
                              onClick={() => {
                                setSelectedCategory(category);
                                setShowingRemoveCategoryDialog(true);
                              }}
                            >
                              <Trash2Icon className="h-4 w-4 mr-2" />
                              Delete category
                            </ContextMenuItem>
                          </ContextMenuContent>
                        </ContextMenu>
                      </SidebarMenuSubItem>
                    ))}
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        onClick={() => setShowingNewCategoryDialog(true)}
                      >
                        <span className="text-muted-foreground">New category...</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>

            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => navigate(routes.SEARCH)}>
                <SquarePlus />
                <span>Add Series</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => navigate(routes.PLUGINS)}>
                <Blocks />
                <span>Plugins</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => navigate(routes.DOWNLOADS)}>
                <FolderDown />
                <span>Downloads</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Dialog>
                <DialogTrigger asChild>
                  <SidebarMenuButton>
                    <Settings />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </DialogTrigger>
                <SettingsDialogContent />
              </Dialog>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <Dialog>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <span className="truncate font-semibold text-sm">
                      Houdoku v{packageJson.version}
                    </span>
                    <Info className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width]  rounded-lg"
                  side="right"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => handleUpdateCheck()}>
                      Check for updates
                    </DropdownMenuItem>
                    <DialogTrigger asChild>
                      <DropdownMenuItem>About Houdoku</DropdownMenuItem>
                    </DialogTrigger>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>About Houdoku</DialogTitle>
                  <DialogDescription>v{packageJson.version}</DialogDescription>
                </DialogHeader>
                <div>
                  <p>
                    Houdoku is a desktop manga reader. To add a series to your library, click the{' '}
                    <code className="relative bg-muted px-[0.3rem] py-[0.2rem] text-sm font-semibold">
                      Add Series
                    </code>{' '}
                    tab on the left panel and search for the series from a supported content source.
                    To add more content sources, install a{' '}
                    <code className="relative bg-muted px-[0.3rem] py-[0.2rem] text-sm font-semibold">
                      Plugin
                    </code>
                    .
                  </p>
                </div>
                <DialogFooter>
                  <Button variant={'secondary'} asChild>
                    <a href={packageJson.repository.url} target="_blank">
                      <GitFork />
                      Repository
                    </a>
                  </Button>
                  <Button asChild>
                    <a href={packageJson.homepage} target="_blank">
                      <Home />
                      Official Website
                    </a>
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
