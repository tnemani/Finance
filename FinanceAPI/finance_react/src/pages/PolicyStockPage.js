import React from 'react';
import policiesStocksIcon from '../components/icons/policies_stocks.png';
import StockPage from './StockPage';
import StudentGetPagePage from './StudentGetPage';
import PolicyPagePage from './PolicyPage';
import PolicyPage from './PolicyPage';

function PolicyStockPage(props) {
  return (
    <>
      <StockPage {...props} />
      <div style={{ marginTop: 10 }} />
      <PolicyPage {...props} />
      <div style={{ marginTop: 10 }} />
      <StudentGetPagePage {...props} />
    </>
  );
}

export default PolicyStockPage;
