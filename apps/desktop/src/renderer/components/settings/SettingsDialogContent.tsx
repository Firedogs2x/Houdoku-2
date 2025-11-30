import * as React from 'react';
import {
  BookOpenIcon,
  KeyboardIcon,
  LibraryBigIcon,
  NotebookTextIcon,
  SettingsIcon,
  ToyBrickIcon,
  FolderOpen,
} from 'lucide-react';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@houdoku/ui/components/Breadcrumb';
import { DialogContent, DialogTitle } from '@houdoku/ui/components/Dialog';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@houdoku/ui/components/Sidebar';
import { useState } from 'react';
import { SettingsGeneral } from './SettingsGeneral';
import { SettingsLibrary } from './SettingsLibrary';
import { SettingsReader } from './SettingsReader';
import { SettingsKeybinds } from './SettingsKeybinds';
import { SettingsIntegrations } from './SettingsIntegrations';
import { SettingsTrackers } from './SettingsTrackers';
import { SettingsFolders } from './SettingsFolders';

export enum SettingsPage {
  General = 'General',
  Library = 'Library',
  Folders = 'Folders',
  Reader = 'Reader',
  Keybinds = 'Keybinds',
  Trackers = 'Trackers',
  Integrations = 'Integrations',
}

type SettingsPageProps = {
  name: string;
  // accept lucide or react-icons style components
  icon: React.ComponentType<any>;
  component: React.FC;
};

const PAGES: { [key in SettingsPage]: SettingsPageProps } = {
  [SettingsPage.General]: { name: 'General', icon: SettingsIcon, component: SettingsGeneral },
  [SettingsPage.Folders]: { name: 'Folders', icon: FolderOpen, component: SettingsFolders },
  [SettingsPage.Library]: { name: 'Library', icon: LibraryBigIcon, component: SettingsLibrary },
  [SettingsPage.Reader]: { name: 'Reader', icon: BookOpenIcon, component: SettingsReader },
  [SettingsPage.Keybinds]: { name: 'Keybinds', icon: KeyboardIcon, component: SettingsKeybinds },
  [SettingsPage.Trackers]: {
    name: 'Trackers',
    icon: NotebookTextIcon,
    component: SettingsTrackers,
  },
  [SettingsPage.Integrations]: {
    name: 'Integrations',
    icon: ToyBrickIcon,
    component: SettingsIntegrations,
  },
};

type SettingsDialogContentProps = {
  defaultPage?: SettingsPage;
};

export function SettingsDialogContent(props: SettingsDialogContentProps) {
  const [activePage, setActivePage] = useState<SettingsPage>(
    props.defaultPage ?? SettingsPage.General,
  );

  return (
    <>
      <style>{`.settings-dialog * { border-color: rgba(255, 90, 0, 0.4) !important; } .settings-dialog .border { border-color: rgba(255, 90, 0, 0.4) !important; }`}</style>
      <DialogContent className="settings-dialog overflow-hidden !p-0 md:max-h-[500px] md:max-w-[700px] lg:max-w-[800px] text-foreground">
        <DialogTitle className="sr-only">Settings</DialogTitle>
      <SidebarProvider className="items-start">
        <Sidebar collapsible="none">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                  <SidebarMenu>
                    {/** Diagnostic logging of pages (will appear in renderer console) */}
                    {console.log(
                      'SettingsDialogContent: pages',
                      Object.entries(PAGES).map(([page, pageProps]) => ({
                        page,
                        componentType: typeof pageProps.component,
                        isElement: React.isValidElement(pageProps.component),
                        iconType: typeof pageProps.icon,
                      })),
                    )}
                    {Object.entries(PAGES).map(([page, pageProps]) => {
                      const pageKey: SettingsPage = page as SettingsPage;
                      const Icon = pageProps.icon;

                      // Icon can be either a component type or an already-created element.
                      let iconElement: React.ReactNode = null;
                      if (React.isValidElement(Icon)) {
                        iconElement = Icon;
                      } else if (typeof Icon === 'function') {
                        const IconComp = Icon as React.ComponentType<any>;
                        iconElement = <IconComp />;
                      }

                      return (
                        <SidebarMenuItem key={PAGES[pageKey].name}>
                          <SidebarMenuButton
                            isActive={pageKey === activePage}
                            onClick={() => setActivePage(pageKey)}
                          >
                            {iconElement}
                            <span>{pageProps.name}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <main className="flex h-[480px] flex-1 flex-col overflow-hidden">
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink>Settings</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{PAGES[activePage].name}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-4 pt-0 space-y-2">
            {(() => {
              const compOrElement: any = PAGES[activePage].component;
              // Debugging guard: log unexpected types to help trace rendering issues
              if (React.isValidElement(compOrElement)) {
                console.error('SettingsDialogContent: component is a React element instead of a component for page', activePage, compOrElement);
                return compOrElement;
              }

              if (typeof compOrElement !== 'function') {
                console.error('SettingsDialogContent: component is not a function for page', activePage, compOrElement);
                return null;
              }

              const ActiveComp = compOrElement as React.ComponentType<any>;
              return <ActiveComp />;
            })()}
          </div>
        </main>
      </SidebarProvider>
      </DialogContent>
    </>
  );
}
