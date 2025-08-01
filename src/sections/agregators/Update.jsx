/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';

import { Box, Button, TextField, Typography } from '@mui/material';

import { useUpdateAgregatorMutation } from 'src/store/api/agregatorsApi';

export default function Update({
  selectedUser,
  setOpen,
  setSelectedUser,
  setSnackbarOpen,
  setSnackbarMessage,
}) {
  const [form, setForm] = useState({ title: '', inn: '' });
  const [updateAgregator, { isLoading }] = useUpdateAgregatorMutation();

  useEffect(() => {
    if (selectedUser?.dataUser) {
      setForm({
        title: selectedUser.dataUser.title || '',
        inn: selectedUser.dataUser.inn || '',
      });
    }
  }, [selectedUser]);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await updateAgregator({ id: selectedUser.idUser, updated: form }).unwrap();
      setSnackbarMessage('Агрегатор успешно обновлён');
      setSnackbarOpen(true);
      setOpen(false);
      setSelectedUser(null);
    } catch {
      setSnackbarMessage('Ошибка при обновлении');
      setSnackbarOpen(true);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} p={3} minWidth={350}>
      <Typography variant="h6" mb={2}>Изменить агрегатор</Typography>
      <TextField
        label="Название"
        name="title"
        value={form.title}
        onChange={handleChange}
        fullWidth
        required
        sx={{ mb: 2 }}
      />
      <TextField
        label="ИНН"
        name="inn"
        value={form.inn}
        onChange={e => {
          const value = e.target.value.replace(/\D/g, '');
          handleChange({ target: { name: 'inn', value } });
        }}
        fullWidth
        required
        sx={{ mb: 2 }}
      />
      <Box display="flex" gap={2} justifyContent="flex-end" mt={2}>
        <Button onClick={() => setOpen(false)} disabled={isLoading}>Отмена</Button>
        <Button type="submit" variant="contained" disabled={isLoading}>Сохранить</Button>
      </Box>
    </Box>
  );
}