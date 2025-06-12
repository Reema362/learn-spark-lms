
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Play, Pause, Volume2, VolumeX, Maximize2, RotateCcw, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Reset states when dialog opens/closes or URL changes
  useEffect(() => {
    if (isOpen && videoUrl) {
      setHasError(false);
      setIsLoading(true);
      setIsPlaying(false);
      console.log('Loading video from URL:', videoUrl);
    }
  }, [isOpen, videoUrl]);

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
      });
    }
  };

  const handleVideoLoad = () => {
    console.log('Video loaded successfully');
    setIsLoading(false);
    setHasError(false);
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const video = e.currentTarget;
    const error = video.error;
    console.error('Video error:', {
      code: error?.code,
      message: error?.message,
      url: videoUrl
    });
    setHasError(true);
    setIsLoading(false);
    setIsPlaying(false);
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
        console.log('Video load started');
        setIsLoading(true);
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
              src={videoUrl}
              className="w-full h-auto max-h-96"
              controls={false}
              playsInline
              preload="metadata"
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
                <strong>Video playback error:</strong> The video file could not be loaded or played. 
                This might be due to:
                <ul className="list-disc list-inside mt-2 ml-4">
                  <li>Invalid file format (try MP4, WebM, or MOV)</li>
                  <li>File not accessible in the storage bucket</li>
                  <li>Network connectivity issues</li>
                  <li>Corrupted video file</li>
                </ul>
                <p className="text-xs mt-2 break-all">
                  <strong>Video URL:</strong> {videoUrl}
                </p>
              </AlertDescription>
            </Alert>
          )}
          
          {/* Fallback message if video fails to load */}
          {!hasError && (
            <div className="text-center text-muted-foreground">
              <p>If the video doesn't load, the URL might be invalid or the file might not be accessible.</p>
              <p className="text-xs mt-1 break-all">Video URL: {videoUrl}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoPlayer;
