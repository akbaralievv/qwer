import { Helmet } from 'react-helmet-async';
// eslint-disable-next-line
import PayrollPage from 'src/sections/payroll/view/view';

// ----------------------------------------------------------------------

export default function Payroll() {
  return (
    <>
      <Helmet>
        <title> НАЧИСЛЕНИЕ </title>
      </Helmet>
      <PayrollPage />
    </>
  );
}
