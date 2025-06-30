import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import UsersIcon from './icons/UsersIcon';
import LocationIcon from './icons/LocationIcon';
import SettingsIcon from './icons/SettingsIcon';
import CashIcon from './icons/CashIcon';
import RecurringIncomeIcon from './icons/RecurringIncomeIcon';
import PoliciesStocksIcon from './icons/policies_stocks.png';

function NavMenu() {
  const location = useLocation();
  const navItems = [
    { to: '/users', icon: <UsersIcon size={40} color="#1976d2" />, label: 'Users' },
    { to: '/addresses', icon: <LocationIcon size={40} color="#1976d2" />, label: 'Addresses' },
    { to: '/cash', icon: <CashIcon size={40} color="#1976d2" />, label: 'Cash Balance' },
    { to: '/recurring-incomes', icon: <RecurringIncomeIcon size={40} color="#1976d2" />, label: 'Cyclic Wages' },
    { to: '/policy-stocks', icon: <img src={PoliciesStocksIcon} alt="Policy & Stocks" style={{ width: 40, height: 40, objectFit: 'contain' }} />, label: 'Policy & Stocks' },
    { to: '/settings', icon: <SettingsIcon size={40} color="#1976d2" />, label: 'Settings' },
  ];
  return (
    <nav style={{ padding: 16, marginBottom: 24, display: 'flex', alignItems: 'flex-end', gap: 48, justifyContent: 'flex-start' }}>
      {navItems.map(item => (
        <Link
          key={item.to}
          to={item.to}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', color: '#1976d2', minWidth: 80,
            borderBottom: location.pathname === item.to ? '2px solid #1976d2' : '2px solid transparent',
            transition: 'border-bottom 0.2s',
            paddingBottom: 2,
          }}
        >
          {item.icon}
          <span style={{ fontSize: 18, fontWeight: 700, marginTop: 4, letterSpacing: 1 }}>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}

export default NavMenu;
