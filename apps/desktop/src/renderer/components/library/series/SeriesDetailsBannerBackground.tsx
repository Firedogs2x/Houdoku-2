import React from 'react';
import { useRecoilValue } from 'recoil';
import {
  seriesPageBannerColorAState,
  seriesPageBannerColorBState,
} from '@/renderer/state/settingStates';
import { cn } from '@houdoku/ui/util';

type Props = {
  children?: React.ReactNode;
};

export const SeriesDetailsBannerBackground: React.FC<Props> = (props: Props) => {
  const seriesPageBannerColorA = useRecoilValue(seriesPageBannerColorAState);
  const seriesPageBannerColorB = useRecoilValue(seriesPageBannerColorBState);

  return (
    <div
      className={cn('w-full h-full')}
      style={{
        background: `linear-gradient(to right, ${seriesPageBannerColorA}, ${seriesPageBannerColorB})`,
      }}
    >
      {props.children}
    </div>
  );
};
