import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { Slide } from '../types';
import { Modal } from './ui/modal';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';

interface LabViewerProps {
  labUrl: string;
  labIndex: number;
}

interface LabState {
  isLoading: boolean;
  hasError: boolean;
}

const LabViewer: React.FC<LabViewerProps> = ({ labUrl, labIndex }) => {
  const [labState, setLabState] = useState<LabState>({
    isLoading: true,
    hasError: false,
  });

  // Validate and sanitize lab URL
  const isValidUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === "https:" || urlObj.protocol === "http:";
    } catch {
      return false;
    }
  };

  const handleIframeLoad = () => {
    setLabState({ isLoading: false, hasError: false });
  };

  const handleIframeError = () => {
    setLabState({ isLoading: false, hasError: true });
  };

  if (!isValidUrl(labUrl)) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <div className="flex items-start">
          <span className="text-red-600 dark:text-red-400 text-2xl mr-3 flex-shrink-0">
            ⚠️
          </span>
          <div>
            <h3 className="text-red-800 dark:text-red-200 font-medium text-lg mb-2">
              ⚠️ Invalid Lab URL
            </h3>
            <p className="text-red-600 dark:text-red-300 text-sm mb-3">
              The lab URL is not valid or uses an unsupported protocol. Only HTTP
              and HTTPS URLs are supported.
            </p>
            <p className="text-red-500 dark:text-red-400 text-xs font-mono break-all bg-red-100 dark:bg-red-800 p-2 rounded">
              {labUrl}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden relative">
      {/* Loading indicator */}
      {labState.isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-800 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Loading lab...
            </span>
          </div>
        </div>
      )}

      {/* Error state */}
      {labState.hasError && !labState.isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 dark:bg-red-900/30 z-10">
          <div className="text-center p-6">
            <span className="text-red-600 dark:text-red-400 text-3xl mb-2 block">
              ⚠️
            </span>
            <h3 className="text-red-800 dark:text-red-200 font-medium mb-2">
              Failed to load lab
            </h3>
            <p className="text-red-600 dark:text-red-300 text-sm">
              The lab content could not be loaded. This might be due to network
              issues or the lab being unavailable.
            </p>
          </div>
        </div>
      )}

      {/* Lab iframe */}
      <iframe
        src={labUrl}
        title={`Interactive Lab ${labIndex + 1}`}
        className="w-full h-full border-0"
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
        loading="lazy"
      />
    </div>
  );
};

interface LabsModalProps {
  isOpen: boolean;
  onClose: () => void;
  slide: Slide | null;
}

export const LabsModal: React.FC<LabsModalProps> = ({ isOpen, onClose, slide }) => {
  if (!slide?.slideLabUrl) {
    return null;
  }

  const labUrls = Array.isArray(slide.slideLabUrl) 
    ? slide.slideLabUrl 
    : [slide.slideLabUrl];

  const hasMultipleLabs = labUrls.length > 1;

  if (hasMultipleLabs) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        className="w-[95vw] h-[90vh]"
      >
        <div className="p-4 h-full">
          <Tabs defaultValue="lab-0" className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Slide {slide.slideIndex} Labs
                </h2>
                <TabsList>
                  {labUrls.map((url, index) => (
                    <TabsTrigger key={`lab-${url}-${index}`} value={`lab-${index}`}>
                      Lab {index + 1}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200 flex-shrink-0"
                aria-label="Close modal"
                title="Close labs"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1">
              {labUrls.map((url, index) => (
                <TabsContent 
                  key={`content-${url}-${index}`}
                  value={`lab-${index}`}
                  className="h-full"
                >
                  <LabViewer labUrl={url} labIndex={index} />
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </div>
      </Modal>
    );
  }

  // Single lab
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="w-[95vw] h-[90vh]"
    >
      <div className="p-4 h-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Slide {slide.slideIndex} Lab
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200 flex-shrink-0"
            aria-label="Close modal"
            title="Close lab"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="h-[calc(100%-3rem)]">
          <LabViewer labUrl={labUrls[0]} labIndex={0} />
        </div>
      </div>
    </Modal>
  );
};