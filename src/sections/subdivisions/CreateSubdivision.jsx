import PropTypes from 'prop-types';
import React, { useState } from 'react';

import { Box, Button, Snackbar, TextField, Container, Typography } from '@mui/material';

import { useCreateSubdivisionMutation } from 'src/store/api/subdivsion';

function CreateSubdivision({
  setOpen,
  setSnackbarOpen,
  snackbarOpen,
  setSnackbarMessage,
  snackbarMessage,
}) {
  const initialUserState = {
    title: '',
  };

  const [newUser, setNewUser] = useState(initialUserState);
  const [createData] = useCreateSubdivisionMutation();
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    setNewUser(initialUserState);
    setErrors({});
    setOpen(false);
  };

  const handleSnackbarClose = (_, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setNewUser({ ...newUser, [name]: value });

    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const isValidForm = () => {
    const { title } = newUser;
    // eslint-disable-next-line
    const errors = {};

    if (!title.trim()) {
      errors.title = 'Необходимо заполнить название';
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!isValidForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await createData(newUser);
      if (response?.error) {
        if (response.error.data?.message) {
          setSnackbarMessage(`Ошибка: ${response.error.data.message}`);
        } else {
          setSnackbarMessage('Ошибка при создании документа');
        }
      } else if (response?.data) {
        setSnackbarMessage('Документ успешно создан!');
        handleClose();
      } else {
        setSnackbarMessage('Неизвестная ошибка при создании документа');
      }
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarMessage('Произошла ошибка. Попробуйте снова.');
      setSnackbarOpen(true);
      console.error('Error creating subdivision:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Typography variant="h6" component="h2" textAlign="center" gutterBottom>
        Добавить новый курс
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
          value={newUser.title}
          onChange={handleChange}
          error={Boolean(errors.title)}
          helperText={errors.title}
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

CreateSubdivision.propTypes = {
  setOpen: PropTypes.func.isRequired,
  setSnackbarOpen: PropTypes.func.isRequired,
  snackbarOpen: PropTypes.bool.isRequired,
  setSnackbarMessage: PropTypes.func.isRequired,
  snackbarMessage: PropTypes.string.isRequired,
};

export default CreateSubdivision;
