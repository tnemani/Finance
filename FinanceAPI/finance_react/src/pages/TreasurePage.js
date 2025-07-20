import DiamondPage from './DiamondPage';
import GoldPage from './GoldPage';
import SilverPage from './SilverPage';

function TreasurePage(props) {
  return (
    <>
      <DiamondPage {...props} />
      <div style={{ marginTop: 10 }} />
      <GoldPage {...props} />
      <div style={{ marginTop: 10 }} />
      <SilverPage {...props} />
    </>
  );
}

export default TreasurePage;
