import React from 'react';
import { useRecoilState } from 'recoil';
import { ApplicationTheme } from '@/common/models/types';
import { themeState } from '@/renderer/state/settingStates';
import { RadioGroup } from '@houdoku/ui/components/RadioGroup';
import { cn } from '@houdoku/ui/util';

export const SettingsTheme: React.FC = () => {
  const [theme, setTheme] = useRecoilState(themeState);

  return (
    <>
      <div className="flex flex-col space-y-2">
        <div>
          <h3 className="pb-0 mb-0 font-medium">Theme</h3>
          <p className="text-muted-foreground text-sm pt-0 !mt-0">Select the application theme.</p>
        </div>

        <RadioGroup className="grid max-w-md grid-cols-2 gap-8">
          <div className="cursor-pointer" onClick={() => setTheme(ApplicationTheme.Light)}>
            <div
              className={cn(
                'items-center rounded-md border-2 p-1',
                theme === ApplicationTheme.Light ? 'border-foreground' : 'border-muted',
              )}
            >
              <div className="space-y-2 rounded-sm bg-[#ecedef] p-2">
                <div className="space-y-2 rounded-md bg-white p-2 shadow-sm">
                  <div className="h-2 w-[80px] rounded-lg bg-[#ecedef]" />
                  <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                </div>
                <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                  <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                  <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                </div>
              </div>
            </div>
            <span className="block w-full text-center text-sm font-medium pt-1">Light</span>
          </div>
          <div className="cursor-pointer" onClick={() => setTheme(ApplicationTheme.Dark)}>
            <div
              className={cn(
                'items-center rounded-md border-2 p-1',
                theme === ApplicationTheme.Dark ? 'border-foreground' : 'border-muted',
              )}
            >
              <div className="space-y-2 rounded-sm bg-slate-950 p-2">
                <div className="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
                  <div className="h-2 w-[80px] rounded-lg bg-slate-400" />
                  <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                </div>
                <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                  <div className="h-4 w-4 rounded-full bg-slate-400" />
                  <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                </div>
              </div>
            </div>
            <span className="block w-full text-center text-sm font-medium pt-1">Dark</span>
          </div>
        </RadioGroup>
      </div>
    </>
  );
};
