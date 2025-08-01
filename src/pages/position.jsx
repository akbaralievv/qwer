import { Helmet } from 'react-helmet-async';

import PositionPage from 'src/sections/position/view/view';

// ----------------------------------------------------------------------

export default function ProductsPage() {
  return (
    <>
      <Helmet>
        <title> Сотрудники </title>
      </Helmet>

      <PositionPage />
    </>
  );
}
