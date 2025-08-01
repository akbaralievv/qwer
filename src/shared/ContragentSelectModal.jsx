/* eslint-disable react/prop-types */
import React from 'react';

import ModalUi from 'src/ui/ModalUi';

// eslint-disable-next-line import/no-cycle
import ContragentView from 'src/sections/contragent/view/view';

export default function ContragentSelectModal({ open, setOpen, onSelect, selected }) {
  return (
    <ModalUi width="85%" height="98%" open={open} setOpen={setOpen}>
      <ContragentView
        setContragent={contragent => {
          onSelect(contragent);
          setOpen(false);
        }}
        selectedFromModal={selected}
        multiSelect
      />
    </ModalUi>
  );
}