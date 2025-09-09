import React from 'react';
import Svg, { Path } from 'react-native-svg';

type EmailIconProps = {
  width?: number;
  height?: number;
  color?: string;
}

const EmailIcon = ({ 
  width = 48, 
  height = 48, 
  color = "#00AAEC" 
}: EmailIconProps) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path 
      d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" 
      stroke={color} 
      strokeWidth="2" 
      fill="none"
    />
    <Path 
      d="m22 6-10 7L2 6" 
      stroke={color} 
      strokeWidth="2" 
      fill="none"
    />
  </Svg>
);

export default EmailIcon;
