import { Helmet } from 'react-helmet-async';

import DirectoryView from 'src/sections/directory/DirectoryView';


export default function AppPage() {
  return (
    <>
      <Helmet>
        <title>DIRECTORY</title>
      </Helmet>
      <DirectoryView />
    </>
  );
}
