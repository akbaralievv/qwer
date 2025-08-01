/* eslint-disable no-unused-vars */
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
import { useGetServiceQuery } from 'src/store/api/serviceApi';
import { useGetPositionQuery } from 'src/store/api/positionApi';
import { useGetSubdivOnesQuery } from 'src/store/api/subdivOnes';
import { useGetSubdivisionsQuery } from 'src/store/api/subdivsion';
import { useCreateOperationMutation } from 'src/store/api/orderForAdmissions';

import Iconify from 'src/components/iconify';

import { ContragentView } from '../contragent/view';

const initialUserState = {
  contract: '',
  docDate: new Date().toISOString().split('T')[0],
  docNumber: '',
  contragent: '',
  periodFrom: '',
  periodTo: '',
  autor: '',
  basedOn: '',
  division: '',
  subdiv_one: '',
  inn: '',
  oper_type: 2,
  price: 0,
  service: '',
};

function Create({
  setOpen,
  setSnackbarOpen,
  setSnackbarMessage,
}) {
  const [contragent, setContragent] = useState({});
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState({
    rector: '',
    director: '',
  });
  const [objectPDF, setObjectPDF] = useState({
    course: '',
    facultative: '',
    name: '',
  });
  const [newUser, setNewUser] = useState(initialUserState);
  const [openContragentModal, setOpenContragentModal] = useState(false);
  const [divisionID, setDivisionID] = useState('');
  const [subdiv_oneID, setSubdiv_oneID] = useState('');
  const { data: autor } = useGetUserQuery();
  const { data: subdivision } = useGetSubdivisionsQuery('');
  const { data: facultative } = useGetSubdivOnesQuery('');
  const { data: positions } = useGetPositionQuery('?populate=*');
  const { data: servicesData, isLoading: servicesLoading } = useGetServiceQuery('');
  const [createData] = useCreateOperationMutation();

  useEffect(() => {
    if (autor) {
      setNewUser((prev) => ({ ...prev, autor: `${autor.username} ${autor.usersurname}` }));
    }
  }, [autor]);

  const handleClickDivision = (item) => {
    setObjectPDF((prev) => ({ ...prev, division: item.attributes.title }));
    setDivisionID(item.id);
  };
  const handleClickSubdiv_one = (item) => {
    setObjectPDF((prev) => ({ ...prev, subdiv_one: item.attributes.title }));
    setSubdiv_oneID(item.id);
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

  // Вычисление суммы price на основе выбранной услуги
  const handleContractBlur = () => {
    const selectedService = servicesData?.data?.find(item => item.id === newUser.service);
    const math_oper = selectedService?.attributes?.math_oper;
    const value = parseFloat(selectedService?.attributes?.value) || 0;
    const contractValue = parseFloat(newUser.contract) || 0;
    let result = 0;
    switch (math_oper) {
      case '+': result = contractValue + value; break;
      case '-': result = contractValue - value; break;
      case '*': result = contractValue * value; break;
      case '/': result = value !== 0 ? contractValue / value : 0; break;
      case '%': result = (contractValue * value) / 100; break;
      default: result = 0;
    }
    setNewUser((prev) => ({ ...prev, price: result }));
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
      contract,
      docDate,
      docNumber,
      contragent: contragentTextField,
      periodFrom,
      periodTo,
      basedOn,
      division,
      subdiv_one,
      inn,
      service,
    } = newUser;
    const formErrors = {};

    if (!contract.toString().trim()) formErrors.contract = 'Незаполнена сумма';
    if (!docDate.trim()) formErrors.docDate = 'Незаполнена дата';
    if (!docNumber.toString().trim()) formErrors.docNumber = 'Незаполнен номер';
    if (!contragentTextField.toString().trim()) formErrors.contragent = 'Не выбран контрагент';
    if (!periodFrom.trim()) formErrors.periodFrom = 'Не укзан период';
    if (!periodTo.trim()) formErrors.periodTo = 'Не указан период';
    if (!basedOn.trim()) formErrors.basedOn = 'Напишите основание';
    if (!division.toString().trim()) formErrors.division = 'Не выбран';
    if (!subdiv_one.toString().trim()) formErrors.subdiv_one = 'Не выбран';
    if (!inn.trim()) formErrors.inn = 'Заполните ИНН/ПИН';
    if (!service.toString().trim()) formErrors.service = 'Не выбрана услуга';

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!isValidForm()) return;

    setIsLoading(true);
    try {
      const payload = {
        ...newUser,
        contract: parseFloat(newUser.contract),
        docDate: new Date(newUser.docDate).toISOString(),
        autor: autor?.id,
        contragent: contragent.idUser,
        division: divisionID || newUser.division,
        subdiv_one: subdiv_oneID || newUser.subdiv_one,
        service: newUser.service,
      };

      const response = await createData(payload);

      if (response?.error) {
        setSnackbarMessage(
          `Ошибка: ${response.error.data?.error?.message || 'Ошибка при создании документа'}`
        );
      } else {
        setSnackbarMessage('Документ успешно создан!');
        handleClose();
      }
      setSnackbarOpen(true);
    } catch (err) {
      setSnackbarMessage('Произошла ошибка. Попробуйте снова.');
      setSnackbarOpen(true);
      console.error('Error creating reception:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContragentSelect = (selectedContragent) => {
    setContragent(selectedContragent);
    setNewUser((prev) => ({ ...prev, contragent: selectedContragent.id }));
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
    setDivisionID(selectedContragent.dataUser?.division?.data?.id || '');
    setSubdiv_oneID(selectedContragent.dataUser?.subdiv_one?.data?.id || '');
    setOpenContragentModal(false);
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
        rector: `${rectorName[0]?.usersurname || ''} ${rectorName[0]?.username || ''}`.trim(),
        director: `${directorName[0]?.usersurname || ''} ${directorName[0]?.username || ''}`.trim(),
      });
    }
  }, [positions]);

  // Для label и вычислений суммы
  const selectedService = servicesData?.data?.find(item => item.id === newUser.service);
  const mathOper = selectedService?.attributes?.math_oper || '';
  const measurement = selectedService?.attributes?.measurement || 'ед. изм.';

  return (
    <>
      <Typography variant="h6" component="h2" textAlign="center" gutterBottom>
        Добавить новый приказ на перемещение
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
              name="docNumber"
              sx={{ width: '40%' }}
              label="№"
              value={newUser.docNumber ?? ''}
              onChange={handleChange}
              error={Boolean(errors.docNumber)}
              helperText={errors.docNumber}
              type="number"
            />
            <TextField
              name="docDate"
              label="Дата документа"
              sx={{ width: '70%' }}
              value={newUser.docDate ?? ''}
              onChange={handleChange}
              error={Boolean(errors.docDate)}
              helperText={errors.docDate}
              type="date"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              select
              name="service"
              label="Вид услуг"
              sx={{ width: '84%' }}
              value={newUser.service || ''}
              onChange={handleChange}
              error={Boolean(errors.service)}
              helperText={errors.service}
            >
              {servicesLoading ? (
                <MenuItem disabled>Загрузка...</MenuItem>
              ) :
                servicesData?.data?.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.attributes.title}
                  </MenuItem>
                ))
              }
            </TextField>
            <TextField
              name="contract"
              label="Сумма"
              sx={{ width: '100%' }}
              value={newUser.contract ?? ''}
              onChange={handleChange}
              onBlur={handleContractBlur}
              error={Boolean(errors.contract)}
              helperText={errors.contract}
              type="number"
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
                  <IconButton onClick={() => setOpenContragentModal(true)}>
                    <Iconify icon="eva:more-vertical-fill" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            InputLabelProps={{
              shrink: Boolean(contragent?.dataUser?.name),
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
              select
              name="division"
              label="Курс"
              variant="outlined"
              fullWidth
              value={newUser.division || ''}
              onChange={handleCourseChange}
              error={Boolean(errors.division)}
              helperText={errors.division}
            >
              {subdivision?.data && subdivision.data.length > 0 ? (
                subdivision.data.map((item) => (
                  <MenuItem onClick={() => handleClickDivision(item)} key={item.id} value={item.id}>
                    {item.attributes.title}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled value="">
                  Нет данных
                </MenuItem>
              )}
            </TextField>
            <TextField
              select
              name="subdiv_one"
              label="Факультет"
              variant="outlined"
              fullWidth
              value={newUser.subdiv_one || ''}
              onChange={handleFacultativeChange}
              error={Boolean(errors.subdiv_one)}
              helperText={errors.subdiv_one}
            >
              {facultative?.data && facultative.data.length > 0 ? (
                facultative.data.map((item) => (
                  <MenuItem onClick={() => handleClickSubdiv_one(item)} key={item.id} value={item.id}>
                    {item.attributes.title}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled value="">
                  Нет данных
                </MenuItem>
              )}
            </TextField>
          </Box>
        </Box>
        <Box sx={{ mt: 1 }} display="flex" justifyContent="center" gap={2.5}>
          <TextField
            sx={{ width: '50%' }}
            name="periodFrom"
            label="Период с"
            fullWidth
            value={newUser.periodFrom ?? ''}
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
            value={newUser.periodTo ?? ''}
            onChange={handleChange}
            error={Boolean(errors.periodTo)}
            helperText={errors.periodTo}
            type="date"
            InputLabelProps={{ shrink: true }}
          />
        </Box>
        <TextField
          sx={{ mt: 1, mb: 1 }}
          name="basedOn"
          label="На основании"
          fullWidth
          value={newUser.basedOn ?? ''}
          onChange={handleChange}
          error={Boolean(errors.basedOn)}
          helperText={errors.basedOn}
          type="string"
        />
        <TextField
          name="price"
          label={`Сумма ${mathOper} ${measurement} = сумма за ${measurement}`}
          sx={{ width: '100%' }}
          value={newUser.price ?? ''}
          onChange={handleChange}
          error={Boolean(errors.price)}
          helperText={errors.price}
          type="number"
          disabled
        />
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-start' }}>
            <TextField
              sx={{ width: '100%' }}
              name="autor"
              label="Автор"
              value={`${autor?.username ?? ''} ${autor?.usersurname ?? ''}`}
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
          filterOperation="заключен"
          filterOperation2="изменен"
          selectedFromModal={contragent?.idUser || ''}
          setContragent={handleContragentSelect}
          reconnect={openContragentModal}
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
