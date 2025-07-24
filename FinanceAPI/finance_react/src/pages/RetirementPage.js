import FourOOneKPage from './FourOOneKPage';
import SSNPage from './SSNPage';

function RetirementPage(props) {
  return (
    <>
      <SSNPage {...props} />
      <div style={{ marginTop: 10 }} />
      <FourOOneKPage {...props} />
    </>
  );
}

export default RetirementPage;
