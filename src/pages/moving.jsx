import { Helmet } from 'react-helmet-async';
// eslint-disable-next-line
import DeductionPage from 'src/sections/moving/view/view';

export default function Moving() {
  return (
    <>
      <Helmet>
        <title> ПРИКАЗ НА ПЕРЕМЕЩЕНИЕ </title>
      </Helmet>
      <DeductionPage />
    </>
  );
}
