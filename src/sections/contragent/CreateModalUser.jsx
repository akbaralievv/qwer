import * as React from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Button, Snackbar, MenuItem, TextField } from '@mui/material';

import { useGetUserQuery } from 'src/store/api/user/userApi';
import { useGetSubdivOnesQuery } from 'src/store/api/subdivOnes';
import { useGetSubdivisionsQuery } from 'src/store/api/subdivsion';
import { useCreateContragentMutation } from 'src/store/api/contragentAPI';
import { useGetContragentTypesQuery } from 'src/store/api/contragentTypeApi';

function CreateUserUi({
  setOpen,
  setSnackbarOpen,
  snackbarOpen,
  setSnackbarMessage,
  snackbarMessage,
}) {
  const { data: idCompany } = useGetUserQuery('');

  const { data: subdivisions } = useGetSubdivisionsQuery('');
  const { data: subdivOnes } = useGetSubdivOnesQuery('');
  const { data: contragentTypes } = useGetContragentTypesQuery();

  const initialUserState = {
    name: '',
    tel: '',
    email: '',
    address: '',
    inn: '',
    resident: '',
    status: 'новый',
    create_ls: true,
    mycompany: idCompany?.mycompany?.id ?? '',
    subdiv_one: '',
    division: '',
    type:'',
  };

  const [newUser, setNewUser] = React.useState(initialUserState);
  const [createData, error] = useCreateContragentMutation();
  const [errors, setErrors] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(false);

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

    if (name === 'inn' && value.length > 14) {
      return;
    }

    setNewUser({ ...newUser, [name]: value });

    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const isValidForm = () => {
    const { name, tel, email, address, status } = newUser;
    // eslint-disable-next-line
    const formErrors = {};

    if (!name.trim()) {
      formErrors.name = 'Необходимо заполнить ФИО';
    }
    if (!tel.trim()) {
      formErrors.tel = 'Необходимо заполнить номер телефона';
    }
    if (!email.trim()) {
      formErrors.email = 'Необходимо заполнить email адрес';
    }
    if (!address.trim()) {
      formErrors.address = 'Необходимо заполнить адрес';
    }
    if (!status) {
      formErrors.status = 'Необходимо заполнить статус';
    }

    // if (resident !== 'XXX' && resident !== 'EAES' && (!inn.trim() || !/^\d{14}$/.test(inn))) {
    //   formErrors.inn = 'ИНН должен состоять из 14 цифр';
    // }

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!isValidForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await createData(newUser);
      if (response?.data) {
        setSnackbarMessage('Документ успешно создан!');
        setSnackbarOpen(true);
      } else {
        setSnackbarMessage('Ошибка при создании документа: ', error.error.message);
        setSnackbarOpen(true);
      }
      handleClose();
    } catch (errorMessage) {
      setSnackbarMessage('Произошла ошибка. Попробуйте снова.');
      setSnackbarOpen(true);
      console.error('Error creating user:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Typography variant="h6" component="h2" textAlign="center" gutterBottom>
        Добавить контрагента
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          alignItems: 'start',
          gap: '15px',
        }}
      >
        <Box display="flex" justifyContent="space-between" width="100%" gap={2}>
          <TextField
            onChange={handleChange}
            name="name"
            label="ФИО"
            sx={{ width: '100%' }}
            value={newUser.name ?? ''}
            error={Boolean(errors.name)}
            helperText={errors.name}
          />
          <TextField
            onChange={handleChange}
            name="tel"
            label="Номер телефона"
            sx={{ width: '100%' }}
            value={newUser.tel}
            error={Boolean(errors.tel)}
            helperText={errors.tel}
          />
        </Box>
        <Box display="flex" justifyContent="space-between" width="100%" gap={2}>
          <TextField
            onChange={handleChange}
            name="email"
            label="Email адрес"
            sx={{ width: '100%' }}
            value={newUser.email}
            error={Boolean(errors.email)}
            helperText={errors.email}
          />
          <TextField
            onChange={handleChange}
            name="address"
            label="Адрес"
            sx={{ width: '100%' }}
            value={newUser.address}
            error={Boolean(errors.address)}
            helperText={errors.address}
          />
          <TextField
            onChange={e => {
              const value = e.target.value.replace(/\D/g, '');
              handleChange({ target: { name: 'inn', value } });
            }}
            name="inn"
            label="ИНН"
            sx={{ width: '100%' }}
            value={newUser.inn}
            error={Boolean(errors.inn)}
            helperText={errors.inn}
          />
        </Box>
        <Box display="flex" justifyContent="space-between" width="100%" gap={2}>
          <TextField
            select
            name="type"
            label="Тип контрагента"
            variant="outlined"
            value={newUser.type ?? ''}
            onChange={handleChange}
            fullWidth
            error={Boolean(errors.type)}
            helperText={errors.type}
          >
            {(contragentTypes?.data && contragentTypes.data.length > 0)
              ? contragentTypes.data.map((el) => (
                  <MenuItem key={el.id} value={String(el.id)}>
                    {el.attributes.name}
                  </MenuItem>
                ))
              : <MenuItem disabled value="">Нет данных</MenuItem>
            }
          </TextField>
          <TextField
            select
            name="division"
            label="Курс"
            variant="outlined"
            value={newUser.division ?? ''}
            onChange={handleChange}
            fullWidth
            error={Boolean(errors.division)}
            helperText={errors.division}
          >
            {(subdivisions?.data && subdivisions.data.length > 0)
              ? subdivisions.data.map((el) => (
                <MenuItem key={el.id} value={String(el.id)}>
                  {el.attributes.title}
                </MenuItem>
              ))
              : <MenuItem disabled value="">Нет данных</MenuItem>
            }
          </TextField>
          <TextField
            select
            name="subdiv_one"
            label="Факультет"
            variant="outlined"
            value={newUser.subdiv_one ?? ''}
            onChange={handleChange}
            fullWidth
            error={Boolean(errors.subdiv_one)}
            helperText={errors.subdiv_one}
          >
            {(subdivOnes?.data && subdivOnes.data.length > 0)
              ? subdivOnes.data.map((el) => (
                <MenuItem key={el.id} value={String(el.id)}>
                  {el.attributes.title}
                </MenuItem>
              ))
              : <MenuItem disabled value="">Нет данных</MenuItem>
            }
          </TextField>
          <TextField
            select
            name="status"
            label="Статус"
            variant="outlined"
            value={newUser.status}
            onChange={handleChange}
            fullWidth
            error={Boolean(errors.status)}
            helperText={errors.status}
          >
            <MenuItem value="новый">новый</MenuItem>
            <MenuItem value="заключен">заключен</MenuItem>
            <MenuItem value="изменен">изменен</MenuItem>
            <MenuItem value="прекращен">прикращен</MenuItem>
          </TextField>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'end', mt: 2, mr: 2.2 }}>
        <Button onClick={handleClose} color="error">
          Закрыть
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading}>
          Добавить
        </Button>
      </Box>
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

CreateUserUi.propTypes = {
  setOpen: PropTypes.func.isRequired,
  setSnackbarOpen: PropTypes.func.isRequired,
  snackbarOpen: PropTypes.bool.isRequired,
  setSnackbarMessage: PropTypes.func.isRequired,
  snackbarMessage: PropTypes.string.isRequired,
};

export default CreateUserUi;
