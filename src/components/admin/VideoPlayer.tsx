
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Play, Pause, Volume2, VolumeX, Maximize2, RotateCcw, AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { StorageService } from '@/services/storageService';

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  isOpen: boolean;
  onClose: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, title, isOpen, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorDetails, setErrorDetails] = useState<string>('');
  const [publicVideoUrl, setPublicVideoUrl] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Get public video URL when component mounts or videoUrl changes
  useEffect(() => {
    if (videoUrl) {
      const publicUrl = StorageService.getPublicVideoUrl(videoUrl);
      setPublicVideoUrl(publicUrl);
      console.log('Video URL converted from:', videoUrl, 'to:', publicUrl);
    }
  }, [videoUrl]);

  // Reset states when dialog opens/closes or URL changes
  useEffect(() => {
    if (isOpen && publicVideoUrl) {
      setHasError(false);
      setIsLoading(true);
      setIsPlaying(false);
      setErrorDetails('');
      console.log('Loading video from public URL:', publicVideoUrl);
    }
  }, [isOpen, publicVideoUrl]);

  const handlePlayPause = () => {
    if (!videoRef.current || hasError) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('Error playing video:', error);
          setHasError(true);
          setErrorDetails(`Playback failed: ${error.message}`);
        });
      }
    }
  };

  const handleMuteToggle = () => {
    if (!videoRef.current) return;
    
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const handleRestart = () => {
    if (!videoRef.current || hasError) return;
    
    videoRef.current.currentTime = 0;
    const playPromise = videoRef.current.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.error('Error restarting video:', error);
        setHasError(true);
        setErrorDetails(`Restart failed: ${error.message}`);
      });
    }
  };

  const handleRetry = () => {
    if (!videoRef.current) return;
    
    setHasError(false);
    setIsLoading(true);
    setErrorDetails('');
    
    // Force reload the video
    videoRef.current.load();
  };

  const handleVideoLoad = () => {
    console.log('Video loaded successfully');
    setIsLoading(false);
    setHasError(false);
    setErrorDetails('');
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const video = e.currentTarget;
    const error = video.error;
    
    let errorMessage = 'Unknown video error';
    if (error) {
      switch (error.code) {
        case MediaError.MEDIA_ERR_ABORTED:
          errorMessage = 'Video playback was aborted';
          break;
        case MediaError.MEDIA_ERR_NETWORK:
          errorMessage = 'Network error while loading video';
          break;
        case MediaError.MEDIA_ERR_DECODE:
          errorMessage = 'Video format not supported or file corrupted';
          break;
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
          errorMessage = 'Video format not supported or URL inaccessible';
          break;
        default:
          errorMessage = error.message || 'Unknown video error';
      }
    }
    
    console.error('Video error:', {
      code: error?.code,
      message: error?.message,
      url: publicVideoUrl,
      errorMessage
    });
    
    setHasError(true);
    setIsLoading(false);
    setIsPlaying(false);
    setErrorDetails(errorMessage);
  };

  const handleVideoEvents = (ref: HTMLVideoElement | null) => {
    videoRef.current = ref;
    if (ref) {
      ref.addEventListener('loadeddata', handleVideoLoad);
      ref.addEventListener('play', () => setIsPlaying(true));
      ref.addEventListener('pause', () => setIsPlaying(false));
      ref.addEventListener('ended', () => setIsPlaying(false));
      ref.addEventListener('error', handleVideoError as any);
      ref.addEventListener('loadstart', () => {
        console.log('Video load started for URL:', publicVideoUrl);
        setIsLoading(true);
      });
      ref.addEventListener('canplay', () => {
        console.log('Video can start playing');
        setIsLoading(false);
      });
    }
  };

  // Clean up event listeners
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        const video = videoRef.current;
        video.removeEventListener('loadeddata', handleVideoLoad);
        video.removeEventListener('error', handleVideoError as any);
      }
    };
  }, []);

  if (!publicVideoUrl) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl w-full">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center items-center p-8">
            <p className="text-muted-foreground">No video URL available</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative bg-black rounded-lg overflow-hidden">
            {/* Loading indicator */}
            {isLoading && !hasError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                <span className="ml-3 text-white">Loading video...</span>
              </div>
            )}

            <video
              ref={handleVideoEvents}
              src={publicVideoUrl}
              className="w-full h-auto max-h-96"
              controls={false}
              playsInline
              preload="metadata"
              crossOrigin="anonymous"
            >
              Your browser does not support the video tag.
            </video>
            
            {/* Custom Controls Overlay */}
            {!hasError && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handlePlayPause}
                      className="text-white hover:bg-white/20"
                      disabled={hasError}
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRestart}
                      className="text-white hover:bg-white/20"
                      disabled={hasError}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleMuteToggle}
                      className="text-white hover:bg-white/20"
                      disabled={hasError}
                    >
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleFullscreen}
                      className="text-white hover:bg-white/20"
                      disabled={hasError}
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Error display */}
          {hasError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <strong>Video playback error:</strong> {errorDetails}
                  
                  <div className="mt-3">
                    <p className="text-sm">This might be due to:</p>
                    <ul className="list-disc list-inside text-sm ml-2 space-y-1">
                      <li>Invalid video file format (try MP4, WebM, or MOV)</li>
                      <li>File not accessible in the storage bucket</li>
                      <li>Network connectivity issues</li>
                      <li>Corrupted or incomplete video file</li>
                      <li>File name contains special characters</li>
                    </ul>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRetry}
                      className="flex items-center gap-1"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Retry
                    </Button>
                  </div>
                  
                  <p className="text-xs mt-2 break-all opacity-75">
                    <strong>Video URL:</strong> {publicVideoUrl}
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}
          
          {/* Fallback message if video fails to load */}
          {!hasError && (
            <div className="text-center text-muted-foreground">
              <p className="text-sm">If the video doesn't load, check the file format and storage accessibility.</p>
              <p className="text-xs mt-1 break-all opacity-75">Video URL: {publicVideoUrl}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoPlayer;
