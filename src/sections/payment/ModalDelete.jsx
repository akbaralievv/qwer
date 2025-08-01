/* eslint-disable react/prop-types */
import React from 'react';

import { Box, Modal, Button, Typography } from '@mui/material';

import { convertToRuFormat } from 'src/utils/convernRuFormat';

export default function ModalDelete({
  open,
  onClose,
  onConfirm,
  deleteInfo
}) {
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          minWidth: 400,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Typography variant="h6" mb={2}>Подтверждение удаления</Typography>
        <Typography>
          Вы точно хотите удалить документ <b>{deleteInfo?.payment_id}</b>?
        </Typography>
        <Typography>
          Контрагент: <b>{deleteInfo?.contragent}</b><br />
          Сумма: <b>{deleteInfo?.amount}</b><br />
          Дата оплаты: <b>{deleteInfo?.paid_at ? convertToRuFormat(deleteInfo.paid_at) : ''}</b>
        </Typography>
        <Box display="flex" gap={2} mt={2}>
          <Button variant="contained" color="error" onClick={onConfirm}>Удалить</Button>
          <Button onClick={onClose}>Отмена</Button>
        </Box>
      </Box>
    </Modal>
  );
}