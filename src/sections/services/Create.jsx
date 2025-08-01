import PropTypes from 'prop-types';
import React, { useState } from 'react';

import {
  Box,
  Button,
  Snackbar,
  MenuItem,
  TextField,
  Container,
  Typography,
} from '@mui/material';

import { useCreateServiceMutation } from 'src/store/api/serviceApi';

function CreateService({
  setOpen,
  setSnackbarOpen,
  snackbarOpen,
  setSnackbarMessage,
  snackbarMessage,
}) {
  const initialDataState = {
    title: '',
    value: '',
    date: '',
    code: '',
    math_oper: '',
    measurement: '',
  };

  const [newData, setNewData] = useState(initialDataState);
  const [createData] = useCreateServiceMutation();
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    setNewData(initialDataState);
    setErrors({});
    setOpen(false);
  };

  const handleSnackbarClose = (_, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setNewData({ ...newData, [name]: value });

    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const isValidForm = () => {
    const { title, value, date, code, math_oper, measurement } = newData;
    const validationErrors = {};

    if (!title.trim()) validationErrors.title = 'Необходимо заполнить название';
    if (!value || Number.isNaN(Number(value))) validationErrors.value = 'Введите числовое значение';
    if (!date.trim()) validationErrors.date = 'Укажите дату';
    if (!code.trim()) validationErrors.code = 'Укажите код платежа';
    if (!math_oper.trim()) validationErrors.math_oper = 'Выберите знак';
    if (!measurement.trim()) validationErrors.measurement = 'Укажите единицу измерения';

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!isValidForm()) return;

    setIsLoading(true);
    try {
      // Формируем объект для сохранения (без createdAt/updatedAt)
      const saveData = {
        title: newData.title,
        value: Number(newData.value),
        date: newData.date,
        code: newData.code,
        math_oper: newData.math_oper,
        measurement: newData.measurement,
      };

      const response = await createData(saveData);
      if (response?.error) {
        if (response.error.data?.message) {
          setSnackbarMessage(`Ошибка: ${response.error.data.message}`);
        } else {
          setSnackbarMessage('Ошибка при создании услуги');
        }
      } else if (response?.data) {
        setSnackbarMessage('Услуга успешно создана!');
        handleClose();
      } else {
        setSnackbarMessage('Неизвестная ошибка при создании услуги');
      }
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarMessage('Произошла ошибка. Попробуйте снова.');
      setSnackbarOpen(true);
      console.error('Error creating service:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Typography variant="h6" component="h2" textAlign="center" gutterBottom>
        Добавить вид услуги
      </Typography>
      <Container
        maxWidth="95%"
        sx={{
          mt: 4,
          display: 'flex',
          flexDirection: 'column',
          gap: '11px',
          justifyContent: 'start',
        }}
      >
        <TextField
          name="title"
          label="Название"
          fullWidth
          value={newData.title}
          onChange={handleChange}
          error={Boolean(errors.title)}
          helperText={errors.title}
        />
        <TextField
          name="value"
          label="Значение"
          fullWidth
          value={newData.value}
          onChange={handleChange}
          error={Boolean(errors.value)}
          helperText={errors.value}
        />
        <TextField
          name="date"
          label="Дата"
          type="date"
          fullWidth
          value={newData.date}
          onChange={handleChange}
          error={Boolean(errors.date)}
          helperText={errors.date}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          name="code"
          label="Код платежа"
          fullWidth
          value={newData.code}
          onChange={handleChange}
          error={Boolean(errors.code)}
          helperText={errors.code}
        />
        <TextField
          select
          name="math_oper"
          label="Знак"
          variant="outlined"
          value={newData.math_oper}
          onChange={handleChange}
          fullWidth
          error={Boolean(errors.math_oper)}
          helperText={errors.math_oper}
        >
          <MenuItem value="+">+</MenuItem>
          <MenuItem value="-">-</MenuItem>
          <MenuItem value="*">*</MenuItem>
          <MenuItem value="/">/</MenuItem>
          <MenuItem value="%">%</MenuItem>
        </TextField>
        <TextField
          name="measurement"
          label="Ед. измерения"
          fullWidth
          value={newData.measurement}
          onChange={handleChange}
          error={Boolean(errors.measurement)}
          helperText={errors.measurement}
        />
      </Container>
      <Box sx={{ display: 'flex', justifyContent: 'end', mt: 2, mr: 2.2 }}>
        <Button onClick={handleClose} color="error">
          Закрыть
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading}>
          Добавить
        </Button>
      </Box>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      />
    </>
  );
}

CreateService.propTypes = {
  setOpen: PropTypes.func.isRequired,
  setSnackbarOpen: PropTypes.func.isRequired,
  snackbarOpen: PropTypes.bool.isRequired,
  setSnackbarMessage: PropTypes.func.isRequired,
  snackbarMessage: PropTypes.string.isRequired,
};

export default CreateService;
