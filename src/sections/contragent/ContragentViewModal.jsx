/* eslint-disable react/prop-types */
import React from 'react';

import { Box, Modal, Button, TextField, Typography } from '@mui/material';

const FIELDS = [
  { key: 'id', label: 'ID' },
  { key: 'ls', label: 'Л.счет' },
  { key: 'name', label: 'ФИО' },
  { key: 'inn', label: 'ИНН/ПИН' },
  { key: 'subdiv_one', label: 'Факультет' },
  { key: 'division', label: 'Курс' },
  { key: 'resident', label: 'Резидент' },
  { key: 'tel', label: 'Телефон' },
  { key: 'address', label: 'Адрес' },
  { key: 'status', label: 'Статус' },
  { key: 'email', label: 'Email' },
];

function ContragentViewModal({ open, onClose, data }) {
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
          minWidth: 500,
          maxWidth: '98vw',
          maxHeight: '98vh',
          overflowY: 'auto',
        }}
      >
        <Typography variant="h6" mb={3} align="center" fontWeight={700}>
          Просмотр контрагента
        </Typography>
        <Box
          display="grid"
          gridTemplateColumns={{
            xs: '1fr',
            sm: '1fr 1fr',
            md: '1fr 1fr 1fr'
          }}
          gap={2}
          mb={2}
        >
          {FIELDS.map(col => (
            <TextField
              key={col.key}
              label={col.label}
              name={col.key}
              value={data?.[col.key] || ''}
              fullWidth
              disabled
            />
          ))}
        </Box>
        <Box display="flex" gap={2} mt={2} justifyContent="flex-end">
          <Button onClick={onClose} sx={{ background: '#e57373', color: '#fff', '&:hover': { background: '#b71c1c' } }}>
            Закрыть
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

export default React.memo(ContragentViewModal);