import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import UsersPage from './pages/UsersPage';
import AddressesPage from './pages/AddressesPage';
import NavMenu from './components/NavMenu';
import SettingsPage from './pages/SettingsPage';
import CashPage from './pages/CashPage';
import RecurringIncomesPage from './pages/RecurringIncomesPage';
import PolicyStockPage from './pages/PolicyStockPage';
import TreasurePage from './pages/TreasurePage';
import RetirementPage from './pages/RetirementPage';

function App() {
  return (
    <Router>
      <NavMenu />
      <Routes>
        <Route path="/users" element={<UsersPage />} />
        <Route path="/addresses" element={<AddressesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/cash" element={<CashPage />} />
        <Route path="/recurring-incomes" element={<RecurringIncomesPage />} />
        <Route path="/policy-stocks" element={<PolicyStockPage />} />
        <Route path="/treasure" element={<TreasurePage />} />
        <Route path="/retirement" element={<RetirementPage />} />
        <Route path="*" element={<Navigate to="/users" />} />
      </Routes>
    </Router>
  );
}

export default App;
