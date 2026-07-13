import React, { useEffect, useState } from 'react';
const { ipcRenderer } = require('electron');
import { Series } from '@houdoku/common';
import { useRecoilState } from 'recoil';
import ipcChannels from '@/common/constants/ipcChannels.json';
import { SeriesEditControls } from '../general/SeriesEditControls';
import { importQueueState } from '@/renderer/state/libraryStates';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@houdoku/ui/components/Dialog';
import { Button } from '@houdoku/ui/components/Button';
import { Skeleton } from '@houdoku/ui/components/Skeleton';

type Props = {
  series: Series | undefined;
  editable: boolean | undefined;
  showing: boolean;
  setShowing: (showing: boolean) => void;
};

const AddSeriesModal: React.FC<Props> = (props: Props) => {
  const [customSeries, setCustomSeries] = useState<Series>();
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [importQueue, setImportQueue] = useRecoilState(importQueueState);

  useEffect(() => {
    setLoadingDetails(true);

    if (props.series !== undefined) {
      // we can't guarantee the provided series has all of the available fields (since
      // they are not usually included in the search results) so we explicitly retrieve
      // all of the series data here

      console.debug(
        `AddSeriesModal is retrieving details for series ${props.series.sourceId} from extension ${props.series.extensionId}`,
      );
      ipcRenderer
        .invoke(ipcChannels.EXTENSION.GET_SERIES, props.series.extensionId, props.series.sourceId)
        .then((series?: Series) => {
          if (series !== undefined) {
            console.debug(`AddSeriesModal found matching series ${series?.sourceId}`);
            setCustomSeries(series);
          }
          return series;
        })
        .finally(() => setLoadingDetails(false))
        .catch((e) => console.error(e));
    }
  }, [props.series]);

  const handleAdd = async () => {
    if (customSeries !== undefined) {
      setImportQueue([...importQueue, { series: customSeries, getFirst: false }]);
      props.setShowing(false);
    }
  };

  return (
    <Dialog open={props.showing} onOpenChange={props.setShowing}>
      <DialogContent className="md:max-w-[700px] lg:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Add series</DialogTitle>
        </DialogHeader>
        {loadingDetails || customSeries === undefined ? (
          <div className="flex space-x-4">
            <Skeleton className="w-40 md:w-44 lg:w-48 h-40" />
            <Skeleton className="w-full h-40" />
          </div>
        ) : (
          <SeriesEditControls
            series={customSeries}
            setSeries={(series: Series) => setCustomSeries(series)}
            editable={props.editable === true}
          />
        )}
        <DialogFooter>
          <Button variant={'secondary'} onClick={() => props.setShowing(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleAdd}>
            Add series
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddSeriesModal;
