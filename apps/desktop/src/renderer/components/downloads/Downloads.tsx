import React from 'react';
import DownloadQueue from './DownloadQueue';
import MyDownloads from './MyDownloads';

const Downloads: React.FC = () => {
  return (
    <div className="px-2 w-full h-full overflow-auto flex flex-col">
      <DownloadQueue />
      <div className="h-4" />
      <MyDownloads />
    </div>
  );
};

export default Downloads;
