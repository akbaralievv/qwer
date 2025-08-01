import { Helmet } from 'react-helmet-async';

import FacultativePage from 'src/sections/subdivOne/view/view';

export default function Facultative() {
  return (
    <>
      <Helmet>
        <title> Факультеты </title>
      </Helmet>
      <FacultativePage />
    </>
  );
}
