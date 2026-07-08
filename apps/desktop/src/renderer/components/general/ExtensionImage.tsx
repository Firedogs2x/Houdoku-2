const { ipcRenderer } = require('electron');
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Series } from '@tiyo/common';
import blankCover from '@/renderer/img/blank_cover.png';
import ipcChannels from '@/common/constants/ipcChannels.json';
import { Loader2 } from 'lucide-react';
import { Button } from '@houdoku/ui/components/Button';

type Props = {
  series: Series;
  url?: string;
  className?: string;
  style?: React.CSSProperties;
  alt?: string;
  width?: string | number;
  height?: string | number;
  loadingDisplay?: 'cover' | 'spinner';
  allowRetry?: boolean;
  'data-num'?: number;
  onLoad?: React.ReactEventHandler<HTMLImageElement>;
};

const ExtensionImage: React.FC<Props> = (props: Props) => {
  const [resolvedUrl, setResolvedUrl] = useState<string | undefined>();
  const [isError, setIsError] = useState(false);
  const requestIdRef = useRef(0);
  const objectUrlRef = useRef<string | null>(null);
  const lastLoadKeyRef = useRef<string | null>(null);

  const loadKey = useMemo(
    () =>
      `${props.url || ''}|${props.series.id || ''}|${props.series.extensionId || ''}|${props.series.remoteCoverUrl || ''}`,
    [props.series.extensionId, props.series.id, props.series.remoteCoverUrl, props.url],
  );

  const clearObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const setResolvedImageUrl = useCallback(
    (url: string, isObjectUrl: boolean) => {
      clearObjectUrl();
      if (isObjectUrl) {
        objectUrlRef.current = url;
      }
      setResolvedUrl(url);
    },
    [clearObjectUrl],
  );

  const loadImage = useCallback(() => {
    if (props.url) {
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;

      if (props.url.startsWith('http')) {
        ipcRenderer
          .invoke(
            ipcChannels.EXTENSION.GET_IMAGE,
            props.series.extensionId,
            props.series,
            props.url,
          )
          .then((data) => {
            if (requestIdRef.current !== requestId) return;

            if (typeof data === 'string') {
              setResolvedImageUrl(data, false);
            } else {
              const url = URL.createObjectURL(new Blob([data]));
              setResolvedImageUrl(url, true);
            }
            setIsError(false);
          })
          .catch((e) => {
            if (requestIdRef.current !== requestId) return;
            console.error(e);
            setIsError(true);
          });
      } else {
        setResolvedImageUrl(props.url, false);
        setIsError(false);
      }
    } else {
      clearObjectUrl();
      setResolvedUrl(undefined);
      setIsError(false);
    }
  }, [clearObjectUrl, props.series, props.url, setResolvedImageUrl]);

  useEffect(() => {
    if (lastLoadKeyRef.current === loadKey) return;
    lastLoadKeyRef.current = loadKey;
    loadImage();
  }, [loadImage, loadKey]);

  useEffect(() => {
    return () => {
      requestIdRef.current += 1;
      clearObjectUrl();
    };
  }, [clearObjectUrl]);

  if (!resolvedUrl && props.loadingDisplay === 'spinner') {
    return (
      <div
        className={props.className}
        style={{ ...props.style, width: props.width, height: props.height }}
      >
        <Loader2 />
      </div>
    );
  }

  if (isError && props.allowRetry) {
    return (
      <div
        className={props.className}
        style={{ ...props.style, width: props.width, height: props.height }}
      >
        <Button
          onClick={() => {
            lastLoadKeyRef.current = null;
            loadImage();
          }}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <img
      className={props.className}
      style={props.style}
      src={resolvedUrl || blankCover}
      alt={props.alt}
      decoding="async"
      width={props.width}
      height={props.height}
      data-num={props['data-num']}
      onLoad={props.onLoad}
      onError={() => setIsError(true)}
    />
  );
};

export default ExtensionImage;
