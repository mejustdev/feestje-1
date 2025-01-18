import React from 'react';
import { SnowflakeProps } from './types';

export default function Snowflake({ size = 4, opacity = 0.8, blur = 0, zIndex = 30 }: SnowflakeProps) {
  return (
    <div
      className="snowflake absolute"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        background: `rgba(255, 255, 255, ${opacity})`,
        borderRadius: '50%',
        filter: `blur(${blur}px)`,
        zIndex,
      }}
    />
  );
}