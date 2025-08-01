/* eslint-disable react/prop-types */
import React, { useState } from 'react';

import { Box, Button, TextField, Typography } from '@mui/material';

import { useCreateAgregatorMutation } from 'src/store/api/agregatorsApi';

export default function Create({ setOpen, setSnackbarOpen, setSnackbarMessage }) {
  const [form, setForm] = useState({ title: '', inn: '' });
  const [createAgregator, { isLoading }] = useCreateAgregatorMutation();

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await createAgregator(form).unwrap();
      setSnackbarMessage('Агрегатор успешно создан');
      setSnackbarOpen(true);
      setOpen(false);
      setForm({ title: '', inn: '' });
    } catch {
      setSnackbarMessage('Ошибка при создании');
      setSnackbarOpen(true);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} p={3} minWidth={350}>
      <Typography variant="h6" mb={2}>Создать агрегатор</Typography>
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
        <Button type="submit" variant="contained" disabled={isLoading}>Создать</Button>
      </Box>
    </Box>
  );
}