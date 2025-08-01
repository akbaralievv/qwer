import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

import {
  Box,
  Button,
  Snackbar,
  TextField,
  Typography,
  DialogContent,
  DialogActions,
} from '@mui/material';

export default function UpdateSubdivisions({
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
  });

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  useEffect(() => {
    if (selectedUser) {
      setUpdate({
        title: selectedUser.dataUser.title,
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
              onChange={(e) => setUpdate({ ...update, title: e.target.value })}
              name="title"
              label="Название"
              sx={{ width: '100%' }}
              value={update.title}
            />
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

UpdateSubdivisions.propTypes = {
  setOpen: PropTypes.func.isRequired,
  selectedUser: PropTypes.shape({
    idUser: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    dataUser: PropTypes.shape({
      title: PropTypes.string.isRequired,
    }).isRequired,
  }),
  setSelectedUser: PropTypes.func.isRequired,
  updateData: PropTypes.func.isRequired,
  setSnackbarOpen: PropTypes.func.isRequired,
  snackbarOpen: PropTypes.bool.isRequired,
  setSnackbarMessage: PropTypes.func.isRequired,
  snackbarMessage: PropTypes.string.isRequired,
};
