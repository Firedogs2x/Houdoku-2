import React from 'react';
import { useSetRecoilState } from 'recoil';
import { Languages, Series } from '@tiyo/common';
import { Badge } from '@houdoku/ui/components/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@houdoku/ui/components/Card';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@houdoku/ui/components/Select';
import { seriesListState, seriesState } from '@/renderer/state/libraryStates';
import library from '@/renderer/services/library';

type Props = {
  series: Series;
};

type SeriesWithRating = Series & {
  rating?: number;
};

const SeriesDetailsInfoGrid: React.FC<Props> = (props: Props) => {
  const setSeries = useSetRecoilState(seriesState);
  const setSeriesList = useSetRecoilState(seriesListState);
  const language = Languages[props.series.originalLanguageKey];
  const languageStr = language !== undefined && 'name' in language ? language.name : 'Unknown';
  const ratingValue = (props.series as SeriesWithRating).rating ?? 0;

  const getCreatorsText = () => {
    const creators = Array.from(new Set([...props.series.authors, ...props.series.artists]));
    return creators.length > 0 ? creators.join('; ') : 'Unknown';
  };

  const handleRatingChange = (value: string) => {
    const rating = Number(value);
    const newSeries = library.upsertSeries({ ...props.series, rating });
    setSeries(newSeries);
    setSeriesList(library.fetchSeriesList());
  };

  return (
    <div className="grid grid-cols-4 gap-2 py-3">
      <div className="col-span-full flex justify-end pr-1 -mb-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold">Series Rating:</span>
          <Select value={`${ratingValue}`} onValueChange={handleRatingChange}>
            <SelectTrigger className="h-7 w-16 rounded-xl border border-border bg-card px-2 py-1 text-sm font-bold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="bottom">
              <SelectGroup>
                {Array.from({ length: 11 }, (_, value) => (
                  <SelectItem key={value} value={`${value}`}>
                    {value}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Card className="col-span-2">
        <CardHeader className="px-3 pb-0.5 pt-2">
          <CardTitle className="text-xs font-medium">Creator(s)</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-2">
          <span className="font-bold text-sm line-clamp-1" title={getCreatorsText()}>
            {getCreatorsText()}
          </span>
        </CardContent>
      </Card>
      <Card className="col-span-1">
        <CardHeader className="px-3 pb-0.5 pt-2">
          <CardTitle className="text-xs font-medium">Status</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-2">
          <span className="font-bold text-sm line-clamp-1">{props.series.status || 'Unknown'}</span>
        </CardContent>
      </Card>
      <Card className="col-span-1">
        <CardHeader className="px-3 pb-0.5 pt-2">
          <CardTitle className="text-xs font-medium">Original Language</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-2">
          <span className="font-bold text-sm line-clamp-1">{languageStr}</span>
        </CardContent>
      </Card>
      <div className="col-span-full space-x-1">
        {props.series.tags.map((tag: string) => (
          <Badge key={tag} className="capitalize" variant="secondary">
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default SeriesDetailsInfoGrid;
