import { Helmet } from 'react-helmet-async';

import AgregatorsPage from 'src/sections/agregators/view/view';

export default function Facultative() {
  return (
    <>
      <Helmet>
        <title> Агрегаторы </title>
      </Helmet>
      <AgregatorsPage />
    </>
  );
}
