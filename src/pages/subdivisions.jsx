import { Helmet } from 'react-helmet-async';

import SubdivisionsPage from 'src/sections/subdivisions/view/view';

export default function Facultative() {
  return (
    <>
      <Helmet>
        <title> Подразделения </title>
      </Helmet>
      <SubdivisionsPage />
    </>
  );
}
