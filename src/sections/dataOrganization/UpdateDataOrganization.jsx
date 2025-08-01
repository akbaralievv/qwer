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

export default function UpdateDataOrganization({
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
    address: '',
    fullName: '',
    regNumber: '',
    inn: '',
    bik: '',
    ls: '',
    okpo: '',
  });

  const handleSnackbarClose = (_, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  useEffect(() => {
    if (selectedUser) {
      setUpdate({
        title: selectedUser.dataUser.title,
        address: selectedUser.dataUser.address,
        fullName: selectedUser.dataUser.fullName,
        regNumber: selectedUser.dataUser.regNumber || '',
        inn: selectedUser.dataUser.inn || '',
        bik: selectedUser.dataUser.bik || '',
        ls: selectedUser.dataUser.ls || '',
        okpo: selectedUser.dataUser.okpo || '',
        region: selectedUser.dataUser.region || '',
        lengthOfLs: selectedUser.dataUser.lengthOfLs || '',
      });
    }
  }, [selectedUser]);

  const UpdateUserData = async () => {
    try {
      const updatedData = { ...update };
      const response = await updateData({ updated: updatedData, id: String(selectedUser.idUser) });

      if (response?.error) {
        if (response.error.data?.message) {
          setSnackbarMessage(`Ошибка: ${response.error.data.message}`);
        } else {
          setSnackbarMessage('Ошибка при обновлении подразделения');
        }
      } else if (response?.data) {
        setSnackbarMessage('Данные успешно обновлены');
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
      <Typography sx={{ textAlign: 'center', fontSize: '18px' }}>Данные организации</Typography>
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
              onChange={(e) => setUpdate({ ...update, fullName: e.target.value })}
              name="fullName"
              label="Полное название"
              sx={{ width: '100%' }}
              value={update.fullName}
            />
            <Box display="flex" justifyContent="space-between" gap={1.5} mt={1} width="100%">
              <TextField
                onChange={(e) => setUpdate({ ...update, address: e.target.value })}
                name="address"
                label="Адрес организации"
                sx={{ width: '100%' }}
                value={update.address}
              />
              <TextField
                onChange={(e) => setUpdate({ ...update, title: e.target.value })}
                name="title"
                label="Краткое название"
                sx={{ width: '100%' }}
                value={update.title}
              />
            </Box>
            <Box display="flex" justifyContent="space-between" gap={1.5} mt={1} width="100%">
              <TextField
                onChange={(e) => setUpdate({ ...update, regNumber: e.target.value })}
                name="regNumber"
                label="Регистрационный номер"
                sx={{ width: '100%' }}
                value={update.regNumber}
              />
              <TextField
                onChange={(e) => setUpdate({ ...update, inn: e.target.value })}
                name="inn"
                label="ИНН"
                sx={{ width: '100%' }}
                value={update.inn}
              />
              <TextField
                onChange={(e) => setUpdate({ ...update, bik: e.target.value })}
                name="bik"
                label="БИК"
                sx={{ width: '100%' }}
                value={update.bik}
              />
            </Box>
            <Box display="flex" justifyContent="space-between" gap={1.5} mt={1} width="100%">
              <TextField
                onChange={(e) => setUpdate({ ...update, ls: e.target.value })}
                name="ls"
                label="Рассчетный счет"
                sx={{ width: '100%' }}
                value={update.ls}
              />
              <TextField
                onChange={(e) => setUpdate({ ...update, okpo: e.target.value })}
                name="okpo"
                label="ОКПО"
                sx={{ width: '100%' }}
                value={update.okpo}
              />
              <TextField
                onChange={(e) => setUpdate({ ...update, region: e.target.value })}
                name="region"
                label="Префикс для ЛС"
                sx={{ width: '100%' }}
                value={update.region}
              />
              <TextField
                onChange={(e) => setUpdate({ ...update, lengthOfLs: e.target.value })}
                name="lengthOfLs"
                label="Длина ЛС"
                sx={{ width: '100%' }}
                value={update.lengthOfLs}
              />
            </Box>
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

UpdateDataOrganization.propTypes = {
  setOpen: PropTypes.func.isRequired,
  selectedUser: PropTypes.shape({
    idUser: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    dataUser: PropTypes.shape({
      title: PropTypes.string.isRequired,
      fullName: PropTypes.string.isRequired,
      address: PropTypes.string.isRequired,
      regNumber: PropTypes.string,
      inn: PropTypes.string,
      bik: PropTypes.string,
      ls: PropTypes.string,
      okpo: PropTypes.string,
      region: PropTypes.string,
      lengthOfLs: PropTypes.string,
    }).isRequired,
  }),
  setSelectedUser: PropTypes.func.isRequired,
  updateData: PropTypes.func.isRequired,
  setSnackbarOpen: PropTypes.func.isRequired,
  snackbarOpen: PropTypes.bool.isRequired,
  setSnackbarMessage: PropTypes.func.isRequired,
  snackbarMessage: PropTypes.string.isRequired,
};
