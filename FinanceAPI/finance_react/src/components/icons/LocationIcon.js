import React from 'react';
import locationsImg from './locations.png';

const LocationIcon = ({ size = 32 }) => (
  <img src={locationsImg} alt="Location" width={size} height={size} style={{ display: 'block' }} />
);

export default LocationIcon;
