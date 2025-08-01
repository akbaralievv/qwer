import { Helmet } from 'react-helmet-async';

import { ContragentView } from 'src/sections/contragent/view';

// ----------------------------------------------------------------------

export default function ContragentPage() {
  return (
    <>
      <Helmet>
        <title> Контрагент </title>
      </Helmet>

      <ContragentView />
    </>
  );
}
