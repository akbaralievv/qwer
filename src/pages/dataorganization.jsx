import { Helmet } from 'react-helmet-async';

import DataOrganizationPage from 'src/sections/dataOrganization/view/view';

export default function DataOrganization() {
  return (
    <>
      <Helmet>
        <title> ДАННЫЕ ОРГАНИЗАЦИИ </title>
      </Helmet>
      <DataOrganizationPage />
    </>
  );
}
