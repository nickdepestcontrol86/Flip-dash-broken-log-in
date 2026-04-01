// RemotionPreview - Helper for displaying Remotion videos
// 
// IMPORTANT: For best results, use the Player component directly in your page:
//
// import { Player } from "@remotion/player";
// import { MyVideo } from "../videos/my-video";
//
// <Player
//   component={MyVideo}
//   durationInFrames={150} // duration * fps (e.g., 5 seconds * 30 fps = 150)
//   fps={30}
//   compositionWidth={1920}
//   compositionHeight={1080}
//   style={{ width: "100%", height: "100%" }}
//   autoPlay
//   loop
// />

import React from "react";
import { Player } from "@remotion/player";

interface RemotionPreviewProps {
  component: React.ComponentType<unknown>; // The video component to render
  durationInFrames: number; // Total frames (duration * fps)
  fps?: number; // Frames per second (default: 30)
  compositionWidth?: number; // Width in pixels (default: 1920)
  compositionHeight?: number; // Height in pixels (default: 1080)
  className?: string;
  autoPlay?: boolean;
  loop?: boolean;
  controls?: boolean;
}

/**
 * RemotionPreview - Displays Remotion compositions immediately in the browser
 * 
 * Uses Remotion Player to render the composition for instant preview.
 * This shows the animated video immediately without waiting for MP4 render.
 */
export function RemotionPreview({
  component,
  durationInFrames,
  fps = 30,
  compositionWidth = 1920,
  compositionHeight = 1080,
  className = "",
  autoPlay = true,
  loop = true,
  controls = false,
}: RemotionPreviewProps) {
  return (
    <div className={className} style={{ width: "100%", height: "100%" }}>
      <Player
        component={component}
        durationInFrames={durationInFrames}
        compositionWidth={compositionWidth}
        compositionHeight={compositionHeight}
        fps={fps}
        controls={controls}
        loop={loop}
        autoPlay={autoPlay}
        style={{
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
}

export default RemotionPreview;
