import { Helmet } from 'react-helmet-async';
// eslint-disable-next-line
import PayrollPage from 'src/sections/payroll/GroupPayrollResult';

// ----------------------------------------------------------------------

export default function PayrollGroupResult() {
  
  return (
    <>
      <Helmet>
        <title> ФОРМИРОВАНИЕ НАЧИСЛЕНИЯ </title>
      </Helmet>
      <PayrollPage />
    </>
  );
}