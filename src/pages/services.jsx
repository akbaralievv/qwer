import { Helmet } from 'react-helmet-async';

import Services from 'src/sections/services/view/view';

export default function ServicesPage() {
  return (
    <>
      <Helmet>
        <title> Виды услуг </title>
      </Helmet>
      <Services />
    </>
  );
}
