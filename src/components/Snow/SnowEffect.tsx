import React from 'react';
import SnowLayer from './SnowLayer';

export default function SnowEffect() {
  return (
    <>
      {/* Back layer - larger, slower snowflakes */}
      <SnowLayer
        count={30}
        speed={8}
        snowflakeProps={{
          size: 6,
          opacity: 0.3,
          blur: 1,
          zIndex: 30
        }}
      />
      
      {/* Middle layer - medium snowflakes */}
      <SnowLayer
        count={50}
        speed={6}
        snowflakeProps={{
          size: 4,
          opacity: 0.6,
          blur: 0.5,
          zIndex: 40
        }}
      />
      
      {/* Front layer - smaller, faster snowflakes */}
      <SnowLayer
        count={40}
        speed={4}
        snowflakeProps={{
          size: 3,
          opacity: 0.8,
          blur: 0,
          zIndex: 50
        }}
      />
    </>
  );
}