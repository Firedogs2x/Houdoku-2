import React, { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { currentExtensionMetadataState } from '@/renderer/state/libraryStates';
import { Badge } from '@houdoku/ui/components/Badge';
import { getSeriesCoverUrl } from '../../../util/seriesCover';
import ExtensionImage from '../../general/ExtensionImage';

// `Series` type is imported dynamically in other modules; use `any` here to avoid type resolution issues.
// biome-ignore lint/suspicious/noExplicitAny: Dynamic import type resolution
type Series = any;

type Props = {
  series: Series;
  onDescriptionSave: (description: string) => void;
};

// Controls how far from the right page edge the description box should end.
const DESCRIPTION_RIGHT_EDGE_GAP_PX = 100;

const SeriesDetailsIntro: React.FC<Props> = (props: Props) => {
  const currentExtensionMetadata = useRecoilValue(currentExtensionMetadataState);
  const [descriptionDraft, setDescriptionDraft] = useState(props.series.description || '');

  useEffect(() => {
    setDescriptionDraft(props.series.description || '');
  }, [props.series.id, props.series.description]);

  const saveDescriptionIfChanged = () => {
    if ((props.series.description || '') !== descriptionDraft) {
      props.onDescriptionSave(descriptionDraft);
    }
  };

  return (
    <div>
      <div className="flex">
        <div className="max-w-[140px] md:max-w-[180px] mt-[2px]">
          <ExtensionImage
            url={getSeriesCoverUrl(props.series).replaceAll('\\', '/')}
            series={props.series}
            alt={props.series.title}
            className="w-auto h-auto aspect-[70/100] object-cover rounded-sm"
          />
        </div>
        <div className="w-full pt-2 px-2 pb-0 flex flex-col">
          <div>
            <div className="flex justify-between">
              <h2 className="text-lg font-bold line-clamp-1">{props.series.title}</h2>
              <Badge variant={'secondary'} className="cursor-default text-xs">
                {currentExtensionMetadata?.name}
              </Badge>
            </div>
            <div
              style={{ width: `calc(100% - ${DESCRIPTION_RIGHT_EDGE_GAP_PX}px)` }}
              className="max-w-full mt-[4px]"
            >
              <textarea
                className="w-full h-[72px] md:h-[102px] overflow-auto rounded-md border border-input bg-transparent px-3 py-2 text-sm leading-5 text-white shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                value={descriptionDraft}
                placeholder="Description"
                onChange={(e) => setDescriptionDraft(e.target.value)}
                onBlur={saveDescriptionIfChanged}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-[5px]">
            Markdown hint: **bold**, *italic*, `code`, - list item, [link](https://example.com)
          </p>
          <div>
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
      </div>
    </div>
  );
};

export default SeriesDetailsIntro;
