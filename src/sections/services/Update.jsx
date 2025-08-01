import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

import {
  Box,
  Button,
  Snackbar,
  MenuItem,
  TextField,
  Typography,
  DialogContent,
  DialogActions,
} from '@mui/material';

export default function UpdateService({
  setOpen,
  selectedUser,
  setSelectedUser,
  updateData,
  setSnackbarMessage,
  setSnackbarOpen,
  snackbarOpen,
  snackbarMessage,
}) {
  const handleDialogClose = () => {
    setOpen(false);
    setSelectedUser(null);
  };

  const [update, setUpdate] = useState({
    title: '',
    date: '',
    value: '',
    code: '',
    math_oper: '',
  });

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  useEffect(() => {
    if (selectedUser) {
      setUpdate({
        title: selectedUser.dataUser.title,
        date: selectedUser.dataUser.date,
        value: selectedUser.dataUser.value,
        code: selectedUser.dataUser.code,
        math_oper: selectedUser.dataUser.math_oper,
      });
    }
  }, [selectedUser]);

  const UpdateUserData = async () => {
    try {
      const updatedData = { ...update };
      const response = await updateData({ updated: updatedData, id: String(selectedUser.idUser) });

      if (response?.error) {
        // Handle error from the API response
        if (response.error.data?.message) {
          setSnackbarMessage(`Ошибка: ${response.error.data.message}`);
        } else {
          setSnackbarMessage('Ошибка при обновлении подразделения');
        }
      } else if (response?.data) {
        setSnackbarMessage('Подразделение успешно обновлено');
        handleDialogClose();
      } else {
        setSnackbarMessage('Неизвестная ошибка при обновлении подразделения');
      }
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarMessage('Произошла ошибка. Попробуйте снова.');
      setSnackbarOpen(true);
      console.error('Error updating subdivision:', error);
    }
  };

  return (
    <>
      <Typography sx={{ textAlign: 'center', fontSize: '18px' }}>Изменить данные</Typography>
      <DialogContent>
        {selectedUser && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              alignItems: 'start',
              gap: '10px',
            }}
          >
            <TextField
              onChange={(e) => setUpdate({ ...update, date: e.target.value })}
              name="date"
              label="Дата"
              sx={{ width: '100%' }}
              value={update.date}
            />
            <TextField
              onChange={(e) => setUpdate({ ...update, title: e.target.value })}
              name="title"
              label="Название"
              sx={{ width: '100%' }}
              value={update.title}
            />
            <TextField
              onChange={(e) => setUpdate({ ...update, value: e.target.value })}
              name="value"
              label="Значение"
              sx={{ width: '100%' }}
              value={update.value}
            />
            <TextField
              onChange={(e) => setUpdate({ ...update, code: e.target.value })}
              name="code"
              label="Код платежа"
              sx={{ width: '100%' }}
              value={update.code}
            />
            <TextField
              select
              onChange={(e) => setUpdate({ ...update, math_oper: e.target.value })}
              name="math_oper"
              label="Знак"
              sx={{ width: '100%' }}
              value={update.math_oper}
            >
              <MenuItem value="+">+</MenuItem>
              <MenuItem value="-">-</MenuItem>
              <MenuItem value="*">*</MenuItem>
              <MenuItem value="/">/</MenuItem>
              <MenuItem value="%">%</MenuItem>
            </TextField>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDialogClose}>Отменить</Button>
        <Button onClick={UpdateUserData} color="primary">
          Сохранить
        </Button>
      </DialogActions>
      <Snackbar
        color="white"
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      />
    </>
  );
}

UpdateService.propTypes = {
  setOpen: PropTypes.func.isRequired,
  selectedUser: PropTypes.shape({
    idUser: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    dataUser: PropTypes.shape({
      title: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
      code: PropTypes.string.isRequired,
      math_oper: PropTypes.string.isRequired,
    }).isRequired,
  }),
  setSelectedUser: PropTypes.func.isRequired,
  updateData: PropTypes.func.isRequired,
  setSnackbarOpen: PropTypes.func.isRequired,
  snackbarOpen: PropTypes.bool.isRequired,
  setSnackbarMessage: PropTypes.func.isRequired,
  snackbarMessage: PropTypes.string.isRequired,
};
