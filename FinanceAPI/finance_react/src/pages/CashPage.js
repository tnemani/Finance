import React from 'react';
import BalancesPage from './BalancesPage';
import PersonTransactionsPage from './PersonTransactionsPage';

export default function CashPage(props) {
  return (
    <>
      <BalancesPage {...props} />
      <div style={{ marginTop: 10 }} />
      <PersonTransactionsPage {...props} />
    </>
  );
}
