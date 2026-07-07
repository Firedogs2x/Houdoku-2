import React from 'react';
import { useRecoilValue } from 'recoil';
import { currentExtensionMetadataState } from '@/renderer/state/libraryStates';
import { ScrollArea } from '@houdoku/ui/components/ScrollArea';
import { Badge } from '@houdoku/ui/components/Badge';
import { getSeriesCoverUrl } from '../../../util/seriesCover';
import ExtensionImage from '../../general/ExtensionImage';

// `Series` type is imported dynamically in other modules; use `any` here to avoid type resolution issues.
// biome-ignore lint/suspicious/noExplicitAny: Dynamic import type resolution
type Series = any;

type Props = {
  series: Series;
};

const SeriesDetailsIntro: React.FC<Props> = (props: Props) => {
  const currentExtensionMetadata = useRecoilValue(currentExtensionMetadataState);

  return (
    <div>
      <div className="flex">
        <div className="max-w-[140px] md:max-w-[180px]">
          <ExtensionImage
            url={getSeriesCoverUrl(props.series).replaceAll('\\', '/')}
            series={props.series}
            alt={props.series.title}
            className="w-auto h-auto aspect-[70/100] object-cover rounded-sm"
          />
        </div>
        <div className="w-full py-2 px-2">
          <div className="flex justify-between">
            <h2 className="text-lg font-bold line-clamp-1">{props.series.title}</h2>
            <Badge variant={'secondary'} className="cursor-default text-xs">
              {currentExtensionMetadata?.name}
            </Badge>
          </div>
          <ScrollArea className="h-[60px] md:h-[90px]">{props.series.description}</ScrollArea>
        </div>
      </div>
      <div className="mt-2 px-2">
        <div className="text-base font-bold text-white">Alternate Titles:</div>
        <div className="text-sm text-white ml-2">
          <div>
            <span className="font-bold">Alt 1:</span>
            <span className="ml-1">{props.series.altTitles?.[0] || ''}</span>
          </div>
        </div>
        <div className="text-sm text-white ml-2">
          <div>
            <span className="font-bold">Alt 2:</span>
            <span className="ml-1">{props.series.altTitles?.[1] || ''}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeriesDetailsIntro;
