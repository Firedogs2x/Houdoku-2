import React, { useState, useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { ApplicationTheme } from '@/common/models/types';
import {
  themeState,
  chapterCountBgColorState,
  chapterCountFontColorState,
  scrollBarSliderColorState,
  starRatingFillColorState,
  starRatingFontColorState,
} from '@/renderer/state/settingStates';
import { RadioGroup } from '@houdoku/ui/components/RadioGroup';
import { Slider } from '@houdoku/ui/components/Slider';
import { Button } from '@houdoku/ui/components/Button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
} from '@houdoku/ui/components/AlertDialog';
import { cn } from '@houdoku/ui/util';

type ColorMode = 'RGB' | 'HSB';
type ColorVariableType =
  | 'chapterCountBg'
  | 'chapterCountFont'
  | 'scrollBarSlider'
  | 'starRatingFill'
  | 'starRatingFont'
  | null;

// Helper functions for color conversions
function rgbToHsb(r: number, g: number, b: number): { h: number; s: number; b: number } {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  let h = 0;
  const s = max === 0 ? 0 : delta / max;
  const v = max;

  if (delta !== 0) {
    if (max === rNorm) {
      h = ((gNorm - bNorm) / delta + (gNorm < bNorm ? 6 : 0)) / 6;
    } else if (max === gNorm) {
      h = ((bNorm - rNorm) / delta + 2) / 6;
    } else {
      h = ((rNorm - gNorm) / delta + 4) / 6;
    }
  }

  return { h: h * 360, s: s * 100, b: v * 100 };
}

function hsbToRgb(h: number, s: number, b: number): { r: number; g: number; b: number } {
  const hNorm = h / 360;
  const sNorm = s / 100;
  const bNorm = b / 100;

  const i = Math.floor(hNorm * 6);
  const f = hNorm * 6 - i;
  const p = bNorm * (1 - sNorm);
  const q = bNorm * (1 - f * sNorm);
  const t = bNorm * (1 - (1 - f) * sNorm);

  let r = 0,
    g = 0,
    bl = 0;

  switch (i % 6) {
    case 0:
      (r = bNorm), (g = t), (bl = p);
      break;
    case 1:
      (r = q), (g = bNorm), (bl = p);
      break;
    case 2:
      (r = p), (g = bNorm), (bl = t);
      break;
    case 3:
      (r = p), (g = q), (bl = bNorm);
      break;
    case 4:
      (r = t), (g = p), (bl = bNorm);
      break;
    case 5:
      (r = bNorm), (g = p), (bl = q);
      break;
  }

  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(bl * 255) };
}

export const SettingsTheme: React.FC = () => {
  const [theme, setTheme] = useRecoilState(themeState);
  const [colorMode, setColorMode] = useState<ColorMode>('RGB');

  // RGB values
  const [red, setRed] = useState(0);
  const [green, setGreen] = useState(191);
  const [blue, setBlue] = useState(252);
  const [alpha, setAlpha] = useState(100);

  // HSB values (calculated from RGB)
  const rgbToHsbValues = rgbToHsb(red, green, blue);
  const [hue, setHue] = useState(rgbToHsbValues.h);
  const [saturation, setSaturation] = useState(rgbToHsbValues.s);
  const [brightness, setBrightness] = useState(rgbToHsbValues.b);

  // Color Variables - using persisted state
  const [chapterCountBgColor, setChapterCountBgColor] = useRecoilState(chapterCountBgColorState);
  const [chapterCountFontColor, setChapterCountFontColor] = useRecoilState(
    chapterCountFontColorState,
  );
  const [scrollBarSliderColor, setScrollBarSliderColor] = useRecoilState(scrollBarSliderColorState);
  const [starRatingFillColor, setStarRatingFillColor] = useRecoilState(starRatingFillColorState);
  const [starRatingFontColor, setStarRatingFontColor] = useRecoilState(
    starRatingFontColorState,
  );

  // Dialog state
  const [selectedVariable, setSelectedVariable] = useState<ColorVariableType>(null);

  // Apply colors to CSS variables whenever they change
  useEffect(() => {
    document.documentElement.style.setProperty('--chapter-count-bg-color', chapterCountBgColor);
    document.documentElement.style.setProperty('--chapter-count-font-color', chapterCountFontColor);
    document.documentElement.style.setProperty('--scrollbar-slider-color', scrollBarSliderColor);
    document.documentElement.style.setProperty('--star-rating-fill-color', starRatingFillColor);
    document.documentElement.style.setProperty('--star-rating-font-color', starRatingFontColor);
  }, [
    chapterCountBgColor,
    chapterCountFontColor,
    scrollBarSliderColor,
    starRatingFillColor,
    starRatingFontColor,
  ]);

  const handleRgbChange = (r: number, g: number, b: number) => {
    setRed(r);
    setGreen(g);
    setBlue(b);
    const hsb = rgbToHsb(r, g, b);
    setHue(hsb.h);
    setSaturation(hsb.s);
    setBrightness(hsb.b);
  };

  const handleHsbChange = (h: number, s: number, br: number) => {
    setHue(h);
    setSaturation(s);
    setBrightness(br);
    const rgb = hsbToRgb(h, s, br);
    setRed(rgb.r);
    setGreen(rgb.g);
    setBlue(rgb.b);
  };

  const currentColor = `rgba(${red}, ${green}, ${blue}, ${alpha / 100})`;

  const handleColorVariableClick = (variable: ColorVariableType) => {
    setSelectedVariable(variable);
  };

  const handleConfirmColorChange = () => {
    if (selectedVariable === 'chapterCountBg') {
      setChapterCountBgColor(currentColor);
    } else if (selectedVariable === 'chapterCountFont') {
      setChapterCountFontColor(currentColor);
    } else if (selectedVariable === 'scrollBarSlider') {
      setScrollBarSliderColor(currentColor);
    } else if (selectedVariable === 'starRatingFill') {
      setStarRatingFillColor(currentColor);
    } else if (selectedVariable === 'starRatingFont') {
      setStarRatingFontColor(currentColor);
    }
    setSelectedVariable(null);
  };

  const handleCancelColorChange = () => {
    setSelectedVariable(null);
  };

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

      {/* Color Settings Section */}
      <div className="flex flex-col space-y-2">
        <div>
          <h3 className="pb-0 mb-0 font-medium">Color Settings</h3>
        </div>

        {/* Color Picker Container */}
        <div className="border rounded-lg p-4 max-w-md">
          {/* Header with Color Preview and Mode Buttons */}
          <div className="flex items-start gap-2 mb-4">
            {/* Color Preview */}
            <div
              className="w-16 h-16 rounded border-2 border-muted flex-shrink-0"
              style={{
                background: `linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc), 
                             linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc)`,
                backgroundSize: '8px 8px',
                backgroundPosition: '0 0, 4px 4px',
              }}
            >
              <div className="w-full h-full rounded" style={{ backgroundColor: currentColor }} />
            </div>

            {/* Mode Buttons and Eye Dropper */}
            <div className="flex flex-col gap-1">
              <div className="text-xs text-muted-foreground mb-0.5">Color</div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant={colorMode === 'RGB' ? 'default' : 'outline'}
                  className="h-7 px-2 text-xs"
                  onClick={() => setColorMode('RGB')}
                >
                  RGB
                </Button>
                <Button
                  size="sm"
                  variant={colorMode === 'HSB' ? 'default' : 'outline'}
                  className="h-7 px-2 text-xs"
                  onClick={() => setColorMode('HSB')}
                >
                  HSB
                </Button>
              </div>
            </div>
          </div>

          {/* RGB Mode Sliders */}
          {colorMode === 'RGB' && (
            <div className="space-y-3">
              {/* Red Slider */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Red</label>
                  <span className="text-sm text-muted-foreground">{red}</span>
                </div>
                <Slider
                  value={[red]}
                  onValueChange={(values) => handleRgbChange(values[0], green, blue)}
                  max={255}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Green Slider */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Green</label>
                  <span className="text-sm text-muted-foreground">{green}</span>
                </div>
                <Slider
                  value={[green]}
                  onValueChange={(values) => handleRgbChange(red, values[0], blue)}
                  max={255}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Blue Slider */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Blue</label>
                  <span className="text-sm text-muted-foreground">{blue}</span>
                </div>
                <Slider
                  value={[blue]}
                  onValueChange={(values) => handleRgbChange(red, green, values[0])}
                  max={255}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Alpha Slider */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Alpha</label>
                  <span className="text-sm text-muted-foreground">{alpha}%</span>
                </div>
                <Slider
                  value={[alpha]}
                  onValueChange={(values) => setAlpha(values[0])}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          )}

          {/* HSB Mode Sliders */}
          {colorMode === 'HSB' && (
            <div className="space-y-3">
              {/* Hue Slider */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Hue</label>
                  <span className="text-sm text-muted-foreground">{Math.round(hue)}°</span>
                </div>
                <Slider
                  value={[hue]}
                  onValueChange={(values) => handleHsbChange(values[0], saturation, brightness)}
                  max={360}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Saturation Slider */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Saturation</label>
                  <span className="text-sm text-muted-foreground">{Math.round(saturation)}%</span>
                </div>
                <Slider
                  value={[saturation]}
                  onValueChange={(values) => handleHsbChange(hue, values[0], brightness)}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Brightness Slider */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Brightness</label>
                  <span className="text-sm text-muted-foreground">{Math.round(brightness)}%</span>
                </div>
                <Slider
                  value={[brightness]}
                  onValueChange={(values) => handleHsbChange(hue, saturation, values[0])}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Alpha Slider */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Alpha</label>
                  <span className="text-sm text-muted-foreground">{alpha}%</span>
                </div>
                <Slider
                  value={[alpha]}
                  onValueChange={(values) => setAlpha(values[0])}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Color Variables Section */}
      <div className="flex flex-col space-y-2">
        <div>
          <h3 className="pb-0 mb-0 font-medium">Color Variables</h3>
        </div>

        {/* Instructions */}
        <div className="text-sm text-muted-foreground space-y-1">
          <p>
            Instructions: To change the color of one of the items below you need to:
          </p>
          <ol className="list-decimal list-inside ml-0">
            <li>Use the color picker and create the color you wish to use the specified item.</li>
            <li>Once you have the color you want to use select the colored box after the item name.</li>
            <li>You will be asked if you wish to change that color setting.</li>
            <li>
              If you answer Yes then the color will change in the box and for the item. If you answer Cancel you can start
              over.
            </li>
          </ol>
        </div>

        {/* Color Variable: Chapter Count BG */}
        <div className="relative flex items-center w-full pr-[240px] mt-2">
          <span className="text-sm font-medium">Chapter Count BG</span>
          <button
            onClick={() => handleColorVariableClick('chapterCountBg')}
            className="absolute right-[200px] w-8 h-8 rounded border-2 border-muted cursor-pointer hover:border-foreground transition-colors"
            style={{ backgroundColor: chapterCountBgColor }}
            title="Click to change color"
          />
        </div>

        {/* Color Variable: Chapter Count Font */}
        <div className="relative flex items-center w-full pr-[240px]">
          <span className="text-sm font-medium">Chapter Count Font</span>
          <button
            onClick={() => handleColorVariableClick('chapterCountFont')}
            className="absolute right-[200px] w-8 h-8 rounded border-2 border-muted cursor-pointer hover:border-foreground transition-colors"
            style={{ backgroundColor: chapterCountFontColor }}
            title="Click to change color"
          />
        </div>

        {/* Color Variable: Scroll Bar Slider */}
        <div className="relative flex items-center w-full pr-[240px]">
          <span className="text-sm font-medium">Scroll Bar Slider</span>
          <button
            onClick={() => handleColorVariableClick('scrollBarSlider')}
            className="absolute right-[200px] w-8 h-8 rounded border-2 border-muted cursor-pointer hover:border-foreground transition-colors"
            style={{ backgroundColor: scrollBarSliderColor }}
            title="Click to change color"
          />
        </div>

        {/* Color Variable: Star Rating Fill */}
        <div className="relative flex items-center w-full pr-[240px]">
          <span className="text-sm font-medium">Star Rating Fill</span>
          <button
            onClick={() => handleColorVariableClick('starRatingFill')}
            className="absolute right-[200px] w-8 h-8 rounded border-2 border-muted cursor-pointer hover:border-foreground transition-colors"
            style={{ backgroundColor: starRatingFillColor }}
            title="Click to change color"
          />
        </div>

        {/* Color Variable: Star Rating Font */}
        <div className="relative flex items-center w-full pr-[240px]">
          <span className="text-sm font-medium">Star Rating Font</span>
          <button
            onClick={() => handleColorVariableClick('starRatingFont')}
            className="absolute right-[200px] w-8 h-8 rounded border-2 border-muted cursor-pointer hover:border-foreground transition-colors"
            style={{ backgroundColor: starRatingFontColor }}
            title="Click to change color"
          />
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={selectedVariable !== null} onOpenChange={(open) => !open && setSelectedVariable(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogDescription className="text-white text-center py-6">
            Do you wish to change the color.
          </AlertDialogDescription>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel onClick={handleCancelColorChange} className="bg-white text-black hover:bg-gray-100 border-0">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmColorChange} className="bg-green-500 text-black hover:bg-green-600 border-0">
              Yes
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
