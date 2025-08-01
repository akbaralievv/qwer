/* eslint-disable no-nested-ternary */
/* eslint-disable react/prop-types */
import React from 'react';

import { Box, Modal, Button, TextField, Typography } from '@mui/material';

import { convertToRuFormat } from 'src/utils/convernRuFormat';

export default function PayrollViewModal({ open, onClose, columns, data }) {
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
          minWidth: 600,
          maxWidth: '98vw',
          maxHeight: '98vh',
          overflowY: 'auto',
        }}
      >
        <Typography variant="h6" mb={3} align="center" fontWeight={700}>
          Просмотр начисления
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
          {columns?.map(col => (
            <TextField
              key={col.key}
              label={col.label}
              name={col.key}
              value={
                ['docDate', 'periodFrom', 'periodTo'].includes(col.key)
                  ? (data?.[col.key] ? convertToRuFormat(data[col.key]) : '')
                  : col.key === 'contragent'
                    ? data?.contragentObj?.attributes?.name || ''
                    : col.key === 'division'
                      ? data?.divisionObj?.attributes?.title || ''
                      : col.key === 'subdiv_one'
                        ? data?.subdiv_oneObj?.attributes?.title || ''
                        : col.key === 'service'
                          ? data?.serviceObj?.attributes?.title || ''
                          : col.key === 'autor'
                            ? data?.autorObj
                              ? `${data.autorObj.attributes?.username || ''} ${data.autorObj.attributes?.usersurname || ''}`
                              : ''
                            : data?.[col.key] || ''
              }
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