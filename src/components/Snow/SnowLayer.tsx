import React from 'react';
import Snowflake from './Snowflake';
import { SnowflakeProps } from './types';

type SnowLayerProps = {
  count: number;
  speed: number;
  snowflakeProps: SnowflakeProps;
};

export default function SnowLayer({ count, speed, snowflakeProps }: SnowLayerProps) {
  return (
    <div className="fixed inset-0 pointer-events-none">
      {[...Array(count)].map((_, i) => {
        const left = `${Math.random() * 100}%`;
        const animationDelay = `${Math.random() * 4}s`;
        const animationDuration = `${speed + Math.random() * 2}s`;

        return (
          <div
            key={i}
            className="animate-snowfall"
            style={{
              position: 'absolute',
              left,
              top: '-2%',
              animationDelay,
              animationDuration,
            }}
          >
            <Snowflake {...snowflakeProps} />
          </div>
        );
      })}
    </div>
  );
}