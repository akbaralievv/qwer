import { Helmet } from 'react-helmet-async';

import MovingPage from 'src/sections/deduction/view/view';

export default function Moving() {
  return (
    <>
      <Helmet>
        <title> ПРИКАЗ НА ОТЧИСЛЕНИЕ </title>
      </Helmet>
      <MovingPage />
    </>
  );
}
