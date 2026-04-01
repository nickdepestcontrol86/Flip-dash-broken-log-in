import React from "react";
          import { Composition } from "remotion";
          import { SafetySpecsPromo as Video0 } from "../videos/safety-specs-promo";
          
          export const RemotionRoot: React.FC = () => {
            return (
              <>
          <Composition
                      id="SafetySpecsPromo"
                      component={Video0}
                      durationInFrames={450}
                      fps={30}
                      width={1920}
                      height={1080}
                    />
              </>
            );
          };
          