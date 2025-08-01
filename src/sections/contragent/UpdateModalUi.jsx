/* eslint-disable react/prop-types */
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

import {
  Box,
  Button,
  Select,
  MenuItem,
  TextField,
  InputLabel,
  Typography,
  FormControl,
  DialogContent,
  DialogActions,
} from '@mui/material';

import { useGetContragentTypesQuery } from '../../store/api/contragentTypeApi';

export default function UpdateModalUi({ setOpen, selectedUser, setSelectedUser, updateData }) {
  const handleDialogClose = () => {
    setOpen(false);
    setSelectedUser(null);
  };

  const [update, setUpdate] = useState({
    password: '',
    resident: '',
    inn: '',
    tel: '',
    email: '',
    address: '',
    id: '',
    divisions: '',
    name: '',
    status: '',
    subdiv_one: '',
  });

  const { data: contragentTypes } = useGetContragentTypesQuery();

  useEffect(() => {
    if (selectedUser) {
      setUpdate({
        name: selectedUser.dataUser.name ?? '',
        resident: selectedUser.dataUser.resident ?? '',
        inn: selectedUser.dataUser.inn ?? '',
        tel: selectedUser.dataUser.tel ?? '',
        email: selectedUser.dataUser.email ?? '',
        address: selectedUser.dataUser.address ?? '',
        id: selectedUser.idUser ?? '',
        ls: selectedUser.ls ?? '',
        status: selectedUser.dataUser.status ?? '',
        subdiv_one: selectedUser.dataUser.subdiv_one ?? '',
        divisions: selectedUser.dataUser.divisions ?? '',
        type: selectedUser.dataUser.type ?? '',
      });
    }
  }, [selectedUser]);

  const handleChange = (event) => {
    setUpdate({ ...update, [event.target.name]: event.target.value });
  };

  const UpdateUserData = async () => {
    try {
      const updated = { ...update };
      await updateData({ updated, id: selectedUser.idUser });
      console.log('Update successful'); // Логирование успешного обновления
      handleDialogClose(); // Закрытие модального окна после обновления
    } catch (error) {
      console.error('Error updating user:', error); // Логирование ошибок
    }
  };

  return (
    <>
      <Typography sx={{ textAlign: 'center', fontSize: '18px', mb: 2 }}>
        Данные контрагента
      </Typography>
      <DialogContent>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {/* First Row */}
          <Box display="flex" gap={2}>
            <TextField
              onChange={handleChange}
              name="name"
              label="ФИО"
              fullWidth
              value={update.name}
              disabled
            />
            <TextField
              onChange={handleChange}
              name="tel"
              label="Номер телефона"
              fullWidth
              value={update.tel ?? ''}
            />
          </Box>

          <Box display="flex" gap={2}>
            <TextField
              onChange={handleChange}
              name="email"
              label="Email адрес"
              fullWidth
              value={update.email}
            />
            <TextField
              onChange={handleChange}
              name="address"
              label="Адрес"
              fullWidth
              value={update.address}
            />
            <TextField
              onChange={e => {
                const value = e.target.value.replace(/\D/g, ''); // только цифры
                setUpdate({ ...update, inn: value });
              }}
              name="inn"
              label="ИНН"
              fullWidth
              value={update.inn}
            />
          </Box>

          <Box display="flex" gap={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="contragent-type-label">Тип контрагента</InputLabel>
              <Select
                labelId="contragent-type-label"
                name="type"
                value={update.type ?? ''}
                onChange={handleChange}
                label="Тип контрагента"
              >
                {(contragentTypes?.data && contragentTypes.data.length > 0)
                  ? contragentTypes.data.map((el) => (
                    <MenuItem key={el.id} value={String(el.id)}>
                      {el.attributes.name}
                    </MenuItem>
                  ))
                  : <MenuItem disabled value="">Нет данных</MenuItem>
                }
              </Select>
            </FormControl>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="form-label">Статус</InputLabel>
              <Select
                labelId="status-label"
                name="status"
                value={update.status}
                onChange={handleChange}
                label="Статус"
              >
                <MenuItem value="новый">зарегистрирован</MenuItem>
                <MenuItem value="заключен">зачислен</MenuItem>
                <MenuItem value="изменен">перемещен</MenuItem>
                <MenuItem value="прекращен">отчислен</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDialogClose}>Отменить</Button>
        <Button onClick={UpdateUserData} color="primary">
          Сохранить
        </Button>
      </DialogActions>
    </>
  );
}

UpdateModalUi.propTypes = {
  setOpen: PropTypes.func.isRequired,
  selectedUser: PropTypes.shape({
    idUser: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    ls: PropTypes.string,
    dataUser: PropTypes.shape({
      name: PropTypes.string.isRequired,
      resident: PropTypes.string.isRequired,
      inn: PropTypes.string.isRequired,
      tel: PropTypes.string,
      email: PropTypes.string,
      address: PropTypes.string,
      status: PropTypes.string,
    }).isRequired,
    divisions: PropTypes.string,
  }),
  setSelectedUser: PropTypes.func.isRequired,
  updateData: PropTypes.func.isRequired,
};
