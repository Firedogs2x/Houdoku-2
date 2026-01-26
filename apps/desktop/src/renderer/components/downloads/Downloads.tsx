import React from 'react';
import DownloadQueue from './DownloadQueue';
import MyDownloads from './MyDownloads';

const Downloads: React.FC = () => {
  return (
    <div className="h-full flex flex-col">
      <DownloadQueue />
      <div className="h-4" />
      <MyDownloads />
    </div>
  );
};

export default Downloads;
