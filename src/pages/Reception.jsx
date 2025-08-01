import { Helmet } from 'react-helmet-async';

import OrderForAdmissionsPage from 'src/sections/Reception/recedption/view/view';

export default function Reception() {
  return (
    <>
      <Helmet>
        <title> Договора </title>
      </Helmet>
      <OrderForAdmissionsPage />
    </>
  );
}
