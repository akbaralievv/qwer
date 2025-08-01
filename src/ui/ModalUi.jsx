import React from 'react';
import PropTypes from 'prop-types';

import { Box, Modal } from '@mui/material';

function ModalUi({ open, setOpen, children, width, height, radius }) {
  const style = {
    borderRadius: `${radius}px`,
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: typeof width === 'string' && width.length >= 1 ? width : '50%',
    height: typeof height === 'string' && height.length >= 1 ? height : 'auto',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 2,
  };
  function handleClose() {
    setOpen(false);
  }

  return (
    // eslint-disable-next-line react/no-unused-prop-types, react/prop-types
    <Modal
      keepMounted
      open={open}
      onClose={() => handleClose()}
      aria-labelledby="create-user-modal-title"
      aria-describedby="create-user-modal-description"
    >
      <Box sx={style}>{children}</Box>
    </Modal>
  );
}

ModalUi.propTypes = {
  open: PropTypes.bool.isRequired,
  width: PropTypes.string,
  height: PropTypes.string,
  radius: PropTypes.string,
  setOpen: PropTypes.func.isRequired,
  children: PropTypes.node,
};

export default ModalUi;
