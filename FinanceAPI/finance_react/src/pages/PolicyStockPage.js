import StockPage from './StockPage';
import StudentGetPagePage from './StudentGetPage';
import PolicyPage from './PolicyPage';

function PolicyStockPage(props) {
  return (
    <>
      <StudentGetPagePage {...props} />
      <div style={{ marginTop: 10 }} />
      <StockPage {...props} />
      <div style={{ marginTop: 10 }} />
      <PolicyPage {...props} />

    </>
  );
}

export default PolicyStockPage;
