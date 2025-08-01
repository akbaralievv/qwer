import { Helmet } from 'react-helmet-async';
// eslint-disable-next-line
import PaymentPage from 'src/sections/payment/view/view';

// ----------------------------------------------------------------------

export default function Payment() {
  return (
    <>
      <Helmet>
        <title> ПЛАТЕЖИ </title>
      </Helmet>
      <PaymentPage />
    </>
  );
}
