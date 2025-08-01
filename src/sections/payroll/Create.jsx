import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

import {
  Box,
  Button,
  MenuItem,
  TextField,
  Container,
  Typography,
  IconButton,
  InputAdornment,
} from '@mui/material';

import ModalUi from 'src/ui/ModalUi';
import { useGetUserQuery } from 'src/store/api/user/userApi';
import { useGetPositionQuery } from 'src/store/api/positionApi';
import { useGetSubdivOnesQuery } from 'src/store/api/subdivOnes';
import { useGetSubdivisionsQuery } from 'src/store/api/subdivsion';
import { useCreatePayrollMutation } from 'src/store/api/payrollAPI';
import { useCreateOperationOneForPayrollMutation } from 'src/store/api/groupPayrollApi';

import Iconify from 'src/components/iconify';
// eslint-disable-next-line

import Services from 'src/sections/services/view/view';

import { ContragentView } from '../contragent/view';

const initialUserState = {
  amount: '',
  docDate: new Date().toISOString().split('T')[0],
  docNumber: '',
  contragent: '',
  periodFrom: '',
  periodTo: '',
  autor: '',
  division: '',
  subdiv_one: '',
  inn: '',
  comment: '',
};

function Create({
  setOpen,
  setSnackbarOpen,
  setSnackbarMessage,
}) {
  const [contragent, setContragent] = useState({});
  const [service, setService] = useState({
    dataService: {
      code: '',
      date: '',
      math_oper: '',
      title: '',
      value: '',
    },
    ID: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  // eslint-disable-next-line
  const [position, setPosition] = useState({
    rector: '',
    director: '',
  });
  // eslint-disable-next-line
  const [objectPDF, setObjectPDF] = useState({
    course: '',
    facultative: '',
    name: '',
  });
  const [newUser, setNewUser] = useState(initialUserState);
  const [openContragentModal, setOpenContragentModal] = useState(false);
  const [openServiceModal, setOpenServiceModal] = useState(false);
  const [createData] = useCreatePayrollMutation('');
  const [GetFromOperation] = useCreateOperationOneForPayrollMutation('')
  const { data: autor } = useGetUserQuery();
  const { data: subdivision } = useGetSubdivisionsQuery('');
  const { data: facultative } = useGetSubdivOnesQuery('');
  const { data: positions } = useGetPositionQuery('?populate=*');

  useEffect(() => {
    if (autor) {
      setNewUser((prev) => ({ ...prev, autor: `${autor.username} ${autor.usersurname}` }));
    }
  }, [autor]);

  const handleClickDivision = (item) => {
    setObjectPDF((prev) => ({ ...prev, division: item.attributes.title }));
  };
  const handleClickSubdiv_one = (item) => {
    setObjectPDF((prev) => ({ ...prev, subdiv_one: item.attributes.title }));
  };

  const handleClose = () => {
    setNewUser(initialUserState);
    setErrors({});
    setOpen(false);
    setContragent({});
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleCourseChange = (event) => {
    const selectedCourse = subdivision?.data.find((item) => item.id === event.target.value);
    setNewUser((prev) => ({ ...prev, division: selectedCourse?.id || '' }));
  };

  const handleFacultativeChange = (event) => {
    const selectedFacultative = facultative?.data.find((item) => item.id === event.target.value);
    setNewUser((prev) => ({ ...prev, subdiv_one: selectedFacultative?.id || '' }));
  };
  useEffect(() => {
    if (contragent?.dataUser) {
      setNewUser((prev) => ({
        ...prev,
        contragent: contragent.idUser || '',
        division: contragent.dataUser?.division?.data?.id || '',
        subdiv_one: contragent.dataUser?.subdiv_one?.data?.id || '',
      }));
    }
  }, [contragent]);

  const isValidForm = () => {
    const {
      amount,
      docDate,
      contragent: contragentTextField,
      periodFrom,
      periodTo,
      division,
      subdiv_one,
      inn,
    } = newUser;
    const formErrors = {};

    if (!amount || Number.isNaN(amount)) formErrors.amount = 'Незаполнена сумма';
    if (!docDate) formErrors.docDate = 'Незаполнена дата';
    if (!contragentTextField.toString().trim()) formErrors.contragent = 'Не выбран контрагент';
    if (!periodFrom.trim()) formErrors.periodFrom = 'Не укзан период';
    if (!periodTo.trim()) formErrors.periodTo = 'Не указан период';
    if (!division.toString().trim()) formErrors.division = 'Не выбран';
    if (!subdiv_one.toString().trim()) formErrors.subdiv_one = 'Не выбран';
    if (!inn.trim()) formErrors.inn = 'Заполните ИНН/ПИН';

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!isValidForm()) return;

    setIsLoading(true);
    try {
      const payload = {
        docDate: new Date(newUser.docDate).toISOString(),
        periodFrom: newUser.periodFrom,
        periodTo: newUser.periodTo,
        contragent: contragent.idUser,
        division: newUser.division,
        subdiv_one: newUser.subdiv_one,
        service: service.ID,
        amount: parseFloat(newUser.amount),
        comment: newUser.comment,
        autor: autor?.id,
      };
      const response = await createData(payload);

      if (response?.error) {
        setSnackbarMessage(
          `Ошибка: ${response.error.data.error.message || 'Ошибка при создании документа'}`
        );
      } else {
        setSnackbarMessage('Документ успешно создан!');
        handleClose();
      }
      setSnackbarOpen(true);
    } catch (err) {
      setSnackbarMessage('Произошла ошибка. Попробуйте снова.');
      setSnackbarOpen(true);
      console.error('Error creating:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContragentSelect = async (selectedContragent) => {
    setContragent(selectedContragent);
    setNewUser((prev) => ({ ...prev, contragent: selectedContragent.idUser }));
    handleChange({
      target: {
        name: 'contragent',
        value: selectedContragent.idUser,
      },
    });
    handleChange({
      target: {
        name: 'inn',
        value: selectedContragent.dataUser?.inn || '',
      },
    });

    const dataBody = {
      periodFrom: newUser.periodFrom,
      periodTo: newUser.periodTo,
      contragentID: selectedContragent.idUser,
    };

    try {
      const response = await GetFromOperation(dataBody);

      if (!response?.data?.data || response.data.data.length === 0) {
        alert("Нет данных для запрашивамых критериев!")
        setOpenContragentModal(false)
        return;
      }

      const firstEntry = response.data.data[0];

      setNewUser((prev) => ({
        ...prev,
        division: firstEntry.division?.id || '',
        subdiv_one: firstEntry.subdiv_one?.id || '',
        amount: firstEntry.amount || '',
      }));

      setService((prev) => ({
        ...prev,
        ID: firstEntry.service?.id || '',
        dataService: firstEntry.service || '',
      }));
    } catch (error) {
      console.error("Error GetFromOperation", error);

      if (error.response) {
        const { status } = error.response;
        const errorMessage =
          error.response.data?.message ||
          error.response.data?.error?.message ||
          "Произошла ошибка";

        setSnackbarMessage(`Ошибка ${status}: ${errorMessage}`);
      } else {
        setSnackbarMessage(
          error.message || "Ошибка соединения: Не удалось выполнить запрос"
        );
      }

      setSnackbarOpen(true);
    }
    setOpenContragentModal(false);
  };

  const handleServiceSelect = (selected) => {
    setService(selected);
    setOpenServiceModal(false)
  };

  const handleClickContragent = () => {
    const formErrors = {};
    if (!newUser.periodFrom.trim()) formErrors.periodFrom = 'Не указан период с';
    if (!newUser.periodTo.trim()) formErrors.periodTo = 'Не указан период по';

    if (Object.keys(formErrors).length > 0) {
      setErrors((prevErrors) => ({ ...prevErrors, ...formErrors }));
      return;
    }

    setOpenContragentModal(true);
  };


  useEffect(() => {
    if (positions?.data?.length) {
      const rectorName = positions.data
        .filter((el) => el.attributes.priority === 1)
        .map((el) => el.attributes?.user?.data?.attributes || '');
      const directorName = positions.data
        .filter((el) => el.attributes.priority === 2)
        .map((el) => el.attributes?.user?.data?.attributes || '');

      setPosition({
        rector: `${rectorName[0]?.usersurname} ${rectorName[0]?.username}` || '',
        director: `${directorName[0]?.usersurname} ${directorName[0]?.username}` || '',
      });
    }
  }, [positions]);

  return (
    <>
      <Typography variant="h6" component="h2" textAlign="center" gutterBottom>
        Добавить начисление
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
        <Box display="flex" justifyContent="center" gap={2.5}>
          <Box display="flex" width="100%" justifyContent="center" gap={3}>
            <TextField
              name="docDate"
              label="Дата документа"
              sx={{ width: '70%' }}
              value={newUser.docDate}
              onChange={handleChange}
              error={Boolean(errors.docDate)}
              helperText={errors.docDate}
              type="date"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              sx={{ width: '50%' }}
              name="periodFrom"
              label="Период с"
              fullWidth
              value={newUser.periodFrom}
              onChange={handleChange}
              error={Boolean(errors.periodFrom)}
              helperText={errors.periodFrom}
              type="date"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              sx={{ width: '50%' }}
              name="periodTo"
              label="Период по"
              fullWidth
              value={newUser.periodTo}
              onChange={handleChange}
              error={Boolean(errors.periodTo)}
              helperText={errors.periodTo}
              type="date"
              InputLabelProps={{ shrink: true }}
            />

          </Box>
        </Box>
        <Box sx={{ mt: 1 }} display="flex" justifyContent="center" gap={2.5}>
          <TextField
            sx={{ width: '84%' }}
            label="Контрагент"
            variant="outlined"
            value={contragent?.dataUser?.name || ''}
            error={Boolean(errors.contragent)}
            helperText={errors.contragent}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => handleClickContragent()}>
                    <Iconify icon="eva:more-vertical-fill" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            InputLabelProps={{
              shrink: Boolean(contragent?.dataUser?.name), // This will force the label to shrink if there's a value
            }}
            readOnly
          />
          <TextField
            sx={{ width: '84%' }}
            label="ИНН"
            fullWidth
            value={contragent?.dataUser?.inn || ''}
            onChange={handleChange}
            maxRows={14}
            error={Boolean(errors.inn)}
            helperText={errors.inn}
            type="number"
            InputLabelProps={{ shrink: true }}
            inputProps={{ maxLength: 14 }}
          />
          <Box display="flex" width="110%" gap={1.5}>
            <TextField
              sx={{ width: '84%' }}
              select
              name="division"
              label="Курс"
              variant="outlined"
              fullWidth
              value={newUser.division}
              onChange={handleCourseChange}
              error={Boolean(errors.division)}
              helperText={errors.division}
            >
              {(subdivision?.data?.length
                ? subdivision.data
                : []
              ).map((item) => (
                <MenuItem onClick={() => handleClickDivision(item)} key={item.id} value={item.id}>
                  {item.attributes.title}
                </MenuItem>
              ))}
              {/* Если данных нет, добавь пустой пункт */}
              {(!subdivision?.data || subdivision.data.length === 0) && (
                <MenuItem value="" disabled>
                  Нет данных
                </MenuItem>
              )}
            </TextField>
            <TextField
              sx={{ width: '84%' }}
              select
              name="subdiv_one"
              label="Факультет"
              variant="outlined"
              fullWidth
              value={newUser.subdiv_one}
              onChange={handleFacultativeChange}
              error={Boolean(errors.subdiv_one)}
              helperText={errors.subdiv_one}
            >
              {(facultative?.data?.length
                ? facultative.data
                : []
              ).map((item) => (
                <MenuItem onClick={() => handleClickSubdiv_one(item)} key={item.id} value={item.id}>
                  {item.attributes.title}
                </MenuItem>
              ))}
              {/* Если данных нет, добавь пустой пункт */}
              {(!facultative?.data || facultative.data.length === 0) && (
                <MenuItem value="" disabled>
                  Нет данных
                </MenuItem>
              )}
            </TextField>
          </Box>
        </Box>
        <Box sx={{ mt: 1 }} display="flex" justifyContent="center" gap={2.5}>
          <TextField
            sx={{ width: '84%' }}
            label="Вид услуг"
            variant="outlined"
            value={service?.dataService?.title || ''}
            error={Boolean(errors.service)}
            helperText={errors.service}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setOpenServiceModal(true)}>
                    <Iconify icon="eva:more-vertical-fill" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            InputLabelProps={{
              shrink: Boolean(service?.dataService?.title), // This will force the label to shrink if there's a value
            }}
            readOnly
          />
          <TextField
            name="amount"
            label="Количество"
            sx={{ width: '100%' }}
            value={newUser.amount}
            onChange={handleChange}
            error={Boolean(errors.contract)}
            helperText={errors.contract}
            type="number"
          />
        </Box>
        <TextField
          name="comment"
          label="Комментарии"
          sx={{ width: '100%' }}
          value={newUser.comment}
          onChange={handleChange}
          type='text'
        />
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-start' }}>
            <TextField
              sx={{ width: '100%' }}
              name="autor"
              label="Автор"
              value={`${autor?.username} ${autor?.usersurname}`}
              onChange={handleChange}
              error={Boolean(errors.autor)}
              helperText={errors.autor}
              type="string"
              InputLabelProps={{ shrink: true }}
            />
          </Box>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" color="error" sx={{ mr: 2 }} onClick={handleClose}>
              Отмена
            </Button>
            <Button variant="contained" onClick={handleSubmit} disabled={isLoading}>
              Сохранить
            </Button>
          </Box>
        </Box>
      </Container>
      <ModalUi width="85%" height="98%" open={openContragentModal} setOpen={setOpenContragentModal}>
        <ContragentView
          filterOperation="зачислен"
          filterOperation2="перемещен"
          selectedFromModal={contragent?.idUser || ''}
          setContragent={handleContragentSelect}
          reconnect={openContragentModal}
        />
      </ModalUi>
      <ModalUi width="85%" height="98%" open={openServiceModal} setOpen={setOpenServiceModal}>
        <Services
          open={openServiceModal}
          setOpen={setOpenServiceModal}
          setService={handleServiceSelect}
        />
      </ModalUi>
    </>
  );
}

Create.propTypes = {
  setOpen: PropTypes.func.isRequired,
  setSnackbarOpen: PropTypes.func.isRequired,
  setSnackbarMessage: PropTypes.func.isRequired,
};

export default Create;
