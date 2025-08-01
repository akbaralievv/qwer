/* eslint-disable react/prop-types */
import React from 'react';

import { Box, Modal, Button, TextField, Typography } from '@mui/material';

const FIELDS = [
  { key: 'id', label: 'ID' },
  { key: 'title', label: 'Название' },
  { key: 'inn', label: 'ИНН' },
  { key: 'createdAt', label: 'Дата создания' },
];

function ViewModal({ open, onClose, data }) {
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
          maxWidth: '98vw',
          maxHeight: '98vh',
          overflowY: 'auto',
        }}
      >
        <Typography variant="h6" mb={3} align="center" fontWeight={700}>
          Просмотр агрегатора
        </Typography>
        <Box
          display="grid"
          gridTemplateColumns={{
            xs: '1fr',
            sm: '1fr 1fr', // две колонки на sm и выше
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

export default React.memo(ViewModal);