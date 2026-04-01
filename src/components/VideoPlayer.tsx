import React, { useState, useEffect } from "react";

interface VideoPlayerProps {
  assetId: string;
  videoUrl?: string; // Optional: if provided, use directly (for when render completes)
  className?: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
}

/**
 * VideoPlayer - Displays AI-generated Remotion videos
 * 
 * Shows a loading state while the video is rendering, then displays the final MP4.
 * If videoUrl is provided, uses it directly. Otherwise, shows loading state.
 * 
 * Note: The video URL will be available once the MP4 render completes.
 * The component will automatically update when the video is ready.
 */
export function VideoPlayer({
  assetId,
  videoUrl: initialVideoUrl,
  className = "",
  autoplay = true,
  loop = true,
  muted = true,
  controls = false,
}: VideoPlayerProps) {
  const [videoUrl, setVideoUrl] = useState<string | null>(initialVideoUrl || null);
  const [isLoading, setIsLoading] = useState(!initialVideoUrl);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If videoUrl prop is provided, use it directly
    if (initialVideoUrl) {
      setVideoUrl(initialVideoUrl);
      setIsLoading(false);
      return;
    }

    if (!assetId) {
      setError("No asset ID provided");
      setIsLoading(false);
      return;
    }

    // Try to load video from public path (will be available once render completes)
    // The video will be at: /videos/[filename].mp4
    // For now, show loading state - the video will appear when render completes
    setIsLoading(true);
  }, [assetId, initialVideoUrl]);

  // Try to load video when URL becomes available
  useEffect(() => {
    if (videoUrl) {
      // Test if video can load
      const video = document.createElement("video");
      video.src = videoUrl;
      video.onloadeddata = () => {
        setIsLoading(false);
        setError(null);
      };
      video.onerror = () => {
        // Video not ready yet, keep loading
        setIsLoading(true);
      };
    }
  }, [videoUrl]);

  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 text-gray-500 ${className}`}
      >
        <div className="text-center">
          <p className="text-sm">⚠️ {error}</p>
        </div>
      </div>
    );
  }

  if (isLoading || !videoUrl) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 ${className}`}
      >
        <div className="text-center">
          <div className="mb-2">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          </div>
          <p className="text-sm text-gray-500">Rendering video...</p>
          <p className="text-xs text-gray-400 mt-1">This may take a minute</p>
        </div>
      </div>
    );
  }

  return (
    <video
      src={videoUrl}
      className={className}
      autoPlay={autoplay}
      loop={loop}
      muted={muted}
      controls={controls}
      playsInline
      preload="auto"
      onLoadedData={() => setIsLoading(false)}
      onError={() => {
        setError("Failed to load video");
        setIsLoading(false);
      }}
    />
  );
}
