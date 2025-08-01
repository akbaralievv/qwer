/* eslint-disable react/prop-types */
import React from 'react';

import { Box, Modal, Button, MenuItem, TextField, Typography } from '@mui/material';

import ModalUi from 'src/ui/ModalUi';
import { useGetAgregatorsQuery } from 'src/store/api/agregatorsApi';

import { ContragentView } from '../contragent/view';

export default function PaymentEditAddModal({
  open,
  mode,
  formData,
  onChange,
  onSave,
  onClose,
}) {
  const [openContragentModal, setOpenContragentModal] = React.useState(false);
  const { data: agregators = [], isLoading: agregatorsLoading } = useGetAgregatorsQuery();
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
          {mode === 'add' ? 'Добавить платеж' : 'Редактировать платеж'}
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
          <TextField
            label="ID"
            name="payment_id"
            value={formData.payment_id}
            onChange={onChange}
            fullWidth
            disabled={mode === 'edit'}
          />
          <TextField
            label="Дата оплаты"
            name="paid_at"
            type="date"
            value={formData?.paid_at}
            onChange={onChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Сумма оплаты"
            name="amount"
            type="number"
            value={formData.amount}
            onChange={onChange}
            fullWidth
          />
          <TextField
            label="Контрагент"
            value={formData.contragentName || ''}
            fullWidth
            InputProps={{
              endAdornment: (
                <Button onClick={() => setOpenContragentModal(true)} sx={{ minWidth: 0, p: 0 }}>
                  <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontSize: 22, color: '#888' }}>⋮</span>
                  </Box>
                </Button>
              ),
              readOnly: true,
            }}
          />
          <TextField
            label="ИНН"
            value={formData.inn || ''}
            fullWidth
            disabled
          />
          <TextField
            select
            label="Агрегатор"
            name="desc"
            value={formData.desc}
            onChange={onChange}
            fullWidth
            disabled={agregatorsLoading}
          >
            {agregators?.data?.map(option => (
              <MenuItem key={option.id} value={option?.attributes?.title}>
                {option?.attributes?.title}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Назначение платежа"
            name="payment_purpose"
            value={formData.payment_purpose}
            onChange={onChange}
            fullWidth
          />
          <TextField
            label="Источник"
            name="source"
            value={formData.source}
            onChange={onChange}
            fullWidth
          />
          <TextField
            label="Автор"
            name="autor"
            value={formData.autor}
            onChange={onChange}
            fullWidth
          />
        </Box>
        <Box display="flex" gap={2} mt={2} justifyContent="flex-end">
          <Button
            variant="contained"
            onClick={onSave}
            sx={{ background: '#1976d2', color: '#fff', '&:hover': { background: '#1565c0' } }}
          >
            Сохранить
          </Button>
          <Button
            onClick={onClose}
            sx={{ background: '#e57373', color: '#fff', '&:hover': { background: '#b71c1c' } }}
          >
            Отмена
          </Button>
        </Box>
        <ModalUi width="85%" height="98%" open={openContragentModal} setOpen={setOpenContragentModal}>
          <ContragentView
            selectedFromModal={formData.contragent}
            setContragent={contragent => {
              onChange({
                target: {
                  name: 'contragent',
                  value: contragent.idUser,
                }
              });
              onChange({
                target: {
                  name: 'contragentName',
                  value: contragent.dataUser?.name || '',
                }
              });
              onChange({
                target: {
                  name: 'inn',
                  value: contragent.dataUser?.inn || '',
                }
              });
              setOpenContragentModal(false);
            }}
            reconnect={openContragentModal}
          />
        </ModalUi>
      </Box>
    </Modal>
  );
}