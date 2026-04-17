import React from 'react';
import { Series } from '@tiyo/common';
import { useNavigate } from 'react-router-dom';
import { goToSeries } from '@/renderer/features/library/utils';
import { Table, TableBody, TableCell, TableRow } from '@houdoku/ui/components/Table';
import { Badge } from '@houdoku/ui/components/Badge';
import { ContextMenu, ContextMenuTrigger } from '@houdoku/ui/components/ContextMenu';
import LibraryGridContextMenu from './LibraryGridContextMenu';
import { SeriesChapterMetadata } from '@/renderer/util/librarySeriesMetadata';

type Props = {
  seriesList: Series[];
  seriesChapterMetadata: Record<string, SeriesChapterMetadata>;
  showRemoveModal: (series: Series) => void;
};

const LibraryList: React.FC<Props> = (props: Props) => {
  const navigate = useNavigate();

  const getCreatorsText = (series: Series) => {
    const creators = Array.from(new Set([...series.authors, ...series.artists]));
    return creators.length > 0 ? creators.join('; ') : 'Unknown';
  };

  const viewFunc = (series: Series) => {
    goToSeries(series, navigate);
  };

  return (
    <Table>
      <TableBody>
        {props.seriesList.map((series) => {
          const unreadChapters =
            (series.id ? props.seriesChapterMetadata[series.id]?.unreadChapters : undefined) ??
            series.numberUnread;

          return (
            <ContextMenu key={`${series.id}-${series.title}`}>
              <ContextMenuTrigger asChild>
                <TableRow className="cursor-pointer" onClick={() => viewFunc(series)}>
                  <TableCell className="truncate flex space-x-2">
                    {unreadChapters > 0 && <Badge>{unreadChapters}</Badge>}
                    <span>{series.title}</span>
                  </TableCell>
                  <TableCell className="truncate max-w-40">
                    <span>{getCreatorsText(series)}</span>
                  </TableCell>
                  <TableCell>
                    <span>{series.status}</span>
                  </TableCell>
                </TableRow>
              </ContextMenuTrigger>
              <LibraryGridContextMenu series={series} showRemoveModal={props.showRemoveModal} />
            </ContextMenu>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default LibraryList;
