import FourOhOneKPage from './FourOhOneKPage';
import SSNPage from './SSNPage';

function RetirementPage(props) {
  return (
    <>
      <FourOhOneKPage {...props} />
      <div style={{ marginTop: 10 }} />
      <SSNPage {...props} />
    </>
  );
}

export default RetirementPage;
