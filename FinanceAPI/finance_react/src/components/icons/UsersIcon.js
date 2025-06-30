import React from 'react';
import usersImg from './users.png';

const UsersIcon = ({ size = 32 }) => (
  <img src={usersImg} alt="Users" width={size} height={size} style={{ display: 'block' }} />
);

export default UsersIcon;
