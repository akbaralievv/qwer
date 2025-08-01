import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

import {
  Box,
  Button,
  MenuItem,
  TextField,
  Typography,
  IconButton,
  DialogContent,
  DialogActions,
  InputAdornment,
} from '@mui/material';

import ModalUi from 'src/ui/ModalUi';
import { useGetUserQuery } from 'src/store/api/user/userApi';
import { useGetServiceQuery } from 'src/store/api/serviceApi';
import { useGetPositionQuery } from 'src/store/api/positionApi';
import { useGetSubdivOnesQuery } from 'src/store/api/subdivOnes';
import { useGetSubdivisionsQuery } from 'src/store/api/subdivsion';
import { useUpdateOperationMutation } from 'src/store/api/orderForAdmissions';

import Iconify from 'src/components/iconify';

import { ContragentView } from '../../contragent/view';

const initialUpdateState = {
  contract: '',
  docNumber: '',
  docDate: '',
  contragent: '',
  subdiv_one: '',
  division: '',
  basedOn: '',
  periodFrom: '',
  periodTo: '',
  price: '',
  oper_type: 1,
  service: '',
};

export default function UpdateOrderForAdmissions({
  setOpen,
  selectedUser,
  setSelectedUser,
  setSnackbarOpen,
  setSnackbarMessage,
}) {
  const { data: autor } = useGetUserQuery();
  const { data: facultative } = useGetSubdivOnesQuery('');
  const { data: subdivision } = useGetSubdivisionsQuery('');
  const { data: positions } = useGetPositionQuery('?populate=*');
  const { data: servicesData, isLoading: servicesLoading } = useGetServiceQuery('');
  const [updateData, { isLoading }] = useUpdateOperationMutation();

  const [update, setUpdate] = useState(initialUpdateState);
  const [errors, setErrors] = useState({});
  const [openContragentModal, setOpenContragentModal] = useState(false);
  const [contragent, setContragent] = useState({});
  // eslint-disable-next-line no-unused-vars
  const [position, setPosition] = useState({
    rector: '',
    director: '',
  });

  // При открытии модалки редактирования
  useEffect(() => {
    if (selectedUser) {
      setUpdate({
        contract: selectedUser.dataUser.contract ?? '',
        price: selectedUser.dataUser.price ?? '',
        docNumber: selectedUser.dataUser.docNumber ?? '',
        docDate: selectedUser.dataUser.docDate ?? '',
        contragent: selectedUser.dataUser?.contragent?.data?.id ?? '',
        division: selectedUser.dataUser?.division?.data?.id ?? selectedUser.dataUser?.division ?? '',
        subdiv_one: selectedUser.dataUser?.subdiv_one?.data?.id ?? selectedUser.dataUser?.subdiv_one ?? '',
        basedOn: selectedUser.dataUser.basedOn ?? '',
        periodFrom: selectedUser.dataUser.periodFrom ?? '',
        periodTo: selectedUser.dataUser.periodTo ?? '',
        service: selectedUser.dataUser.service?.data?.id ?? '', // теперь id услуги!
      });
      setContragent({
        dataUser: {
          name: selectedUser.dataUser.contragent.data.attributes.name,
          inn: selectedUser.dataUser.contragent.data.attributes.inn,
        },
        idUser: selectedUser.dataUser?.contragent?.data?.id,
      });
    }
    // eslint-disable-next-line
  }, [selectedUser]);

  useEffect(() => {
    setUpdate((prev) => ({
      ...prev,
      autor: autor?.id,
      contragent: contragent?.idUser,
    }));
    // eslint-disable-next-line
  }, [contragent]);

  // Для label и вычислений суммы
  const selectedService = servicesData?.data?.find(item => item.id === update.service);
  const mathOper = selectedService?.attributes?.math_oper || '';
  const measurement = selectedService?.attributes?.measurement || 'ед. изм.';
  const serviceValue = parseFloat(selectedService?.attributes?.value) || 0;

  // Пересчет суммы при изменении услуги или суммы
  useEffect(() => {
    handleBlurContract();
    // eslint-disable-next-line
  }, [update.contract, update.service, servicesData]);

  const handleDialogClose = () => {
    setUpdate(initialUpdateState);
    setErrors({});
    setOpen(false);
    setSelectedUser(null);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setUpdate((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlurContract = () => {
    const contractValue = parseFloat(update.contract) || 0;
    let result = 0;
    switch (mathOper) {
      case '+':
        result = contractValue + serviceValue;
        break;
      case '-':
        result = contractValue - serviceValue;
        break;
      case '*':
        result = contractValue * serviceValue;
        break;
      case '/':
        result = serviceValue !== 0 ? contractValue / serviceValue : 0;
        break;
      case '%':
        result = (contractValue * serviceValue) / 100;
        break;
      default:
        result = contractValue;
    }
    setUpdate((prev) => ({ ...prev, price: result }));
  };

  const handleCourseChange = (event) => {
    const selectedCourseId = event.target.value;
    const selectedCourse = subdivision?.data?.find((item) => item.id === selectedCourseId);

    setUpdate((prev) => ({
      ...prev,
      division: selectedCourse ? selectedCourse.id : '',
    }));
  };

  const handleFacultativeChange = (event) => {
    const selectedFacultativeId = event.target.value;
    const selectedFacultative = facultative?.data?.find((item) => item.id === selectedFacultativeId);

    setUpdate((prev) => ({
      ...prev,
      subdiv_one: selectedFacultative ? selectedFacultative.id : '',
    }));
  };

  const isValidForm = () => {
    const { contract, docDate, docNumber, service } = update;
    const formErrors = {};

    const amountStr = String(contract).trim();
    const docNumberStr = String(docNumber).trim();
    // eslint-disable-next-line no-restricted-globals
    if (amountStr === '' || isNaN(amountStr)) {
      formErrors.contract = 'Необходимо заполнить сумму';
    }
    if (!docDate.trim()) {
      formErrors.docDate = 'Необходимо заполнить дату документа';
    }
    if (!contragent) {
      formErrors.contragent = 'Необходимо выбрать контрагента';
    }
    if (!docNumberStr) {
      formErrors.docNumber = 'Необходимо заполнить номер документа';
    }
    if (!service) {
      formErrors.service = 'Необходимо выбрать услугу';
    }

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!isValidForm()) return;

    try {
      const updatedPayload = {
        contract: Number(update.contract),
        docDate: update.docDate,
        docNumber: update.docNumber,
        contragent: update.contragent,
        division: update.division,
        subdiv_one: update.subdiv_one,
        basedOn: update.basedOn,
        periodFrom: update.periodFrom,
        periodTo: update.periodTo,
        price: update.price,
        service: update.service, // id услуги
      };
      await updateData({ updated: updatedPayload, id: selectedUser.idUser }).unwrap();

      setSnackbarMessage('Приказ на прием успешно обновлен');
      setSnackbarOpen(true);
      handleDialogClose();
    } catch (error) {
      setSnackbarMessage('Ошибка при обновлении приказа');
      setSnackbarOpen(true);
      console.error('Ошибка при обновлении:', error);
    }
  };

  const handleContragentSelect = (selectedContragent) => {
    setContragent(selectedContragent);
    setUpdate((prev) => ({ ...prev, contragent: selectedContragent.id }));
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
        rector: `${rectorName[0]?.usersurname} ${rectorName[0]?.username}` || '',
        director: `${directorName[0]?.usersurname} ${directorName[0]?.username}` || '',
      });
    }
  }, [positions]);

  return (
    <>
      <Typography sx={{ textAlign: 'center', fontSize: '18px', mb: 2 }}>
        Изменить приказ на зачисление
      </Typography>
      <DialogContent>
        {selectedUser && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              alignItems: 'start',
              gap: 2,
            }}
          >
            <Box display="flex" width="100%" justifyContent="space-between" gap={0.8}>
              <TextField
                name="docNumber"
                sx={{ width: '40%' }}
                label="№"
                value={update.docNumber !== undefined && update.docNumber !== null ? update.docNumber : ''}
                onChange={handleChange}
                error={Boolean(errors.docNumber)}
                helperText={errors.docNumber}
                type="number"
              />
              <TextField
                onChange={handleChange}
                name="docDate"
                label="Дата документа"
                sx={{ width: '70%' }}
                value={update.docDate !== undefined && update.docDate !== null ? update.docDate : ''}
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
                value={update.service || ''}
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
                label="Количество"
                sx={{ width: '100%' }}
                value={update.contract !== undefined && update.contract !== null ? update.contract : ''}
                onChange={handleChange}
                onBlur={handleBlurContract}
                error={Boolean(errors.contract)}
                helperText={errors.contract}
                type="number"
              />
            </Box>
            <Box display="flex" justifyContent="space-between" gap={0.8} width="100%">
              <TextField
                sx={{ width: '100%' }}
                label="Контрагент"
                variant="outlined"
                value={contragent?.dataUser?.name ?? ''}
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
                value={contragent?.dataUser?.inn ?? ''}
                onChange={handleChange}
                error={Boolean(errors.inn)}
                helperText={errors.inn}
                type="number"
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                select
                name="division"
                label="Курс"
                sx={{ width: '50%' }}
                variant="outlined"
                fullWidth
                value={update.division || ''}
                onChange={handleCourseChange}
                error={Boolean(errors.division)}
                helperText={errors.division}
              >
                <MenuItem value="">Не выбрано</MenuItem>
                {subdivision?.data?.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.attributes.title}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                name="subdiv_one"
                label="Факультет"
                variant="outlined"
                sx={{ width: '70%' }}
                value={update.subdiv_one || ''}
                onChange={handleFacultativeChange}
                error={Boolean(errors.subdiv_one)}
                helperText={errors.subdiv_one}
              >
                <MenuItem value="">Не выбрано</MenuItem>
                {facultative?.data?.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.attributes.title}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box display="flex" justifyContent="space-between" gap={0.8} width="100%">
              <TextField
                onChange={handleChange}
                name="periodFrom"
                label="Период с"
                sx={{ width: '70%' }}
                value={update.periodFrom !== undefined && update.periodFrom !== null ? update.periodFrom : ''}
                error={Boolean(errors.periodFrom)}
                helperText={errors.periodFrom}
                type="date"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                onChange={handleChange}
                name="periodTo"
                label="Период до"
                sx={{ width: '70%' }}
                value={update.periodTo !== undefined && update.periodTo !== null ? update.periodTo : ''}
                error={Boolean(errors.periodTo)}
                helperText={errors.periodTo}
                type="date"
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <TextField
              onChange={handleChange}
              name="basedOn"
              label="На основании"
              sx={{ width: '100%' }}
              value={update.basedOn !== undefined && update.basedOn !== null ? update.basedOn : ''}
              error={Boolean(errors.basedOn)}
              helperText={errors.basedOn}
            />
            <TextField
              name="price"
              label={`Сумма ${mathOper} ${measurement} = сумма за ${measurement}`}
              sx={{ width: '100%' }}
              value={update.price !== undefined && update.price !== null ? update.price : ''}
              onChange={handleChange}
              error={Boolean(errors.price)}
              helperText={errors.price}
              type="number"
              disabled
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between', padding: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
          <TextField
            sx={{ width: '100%' }}
            name="autor"
            label="Автор"
            size="small"
            fullWidth
            value={`${autor?.username ?? ''} ${autor?.usersurname ?? ''}`}
            onChange={handleChange}
            error={Boolean(errors.autor)}
            helperText={errors.autor}
            type="string"
            InputLabelProps={{ shrink: true }}
          />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={handleDialogClose} color="error" sx={{ mr: 2 }} variant="outlined">
            Отменить
          </Button>
          <Button onClick={handleUpdate} color="primary" variant="contained" disabled={isLoading}>
            {isLoading ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </Box>
      </DialogActions>
      <ModalUi width="85%" height="98%" open={openContragentModal} setOpen={setOpenContragentModal}>
        <ContragentView
          open={openContragentModal}
          workClick="true"
          filterOperation='зарегистрирован'
          selectedFromModal={contragent?.idUser}
          setOpen={setOpenContragentModal}
          setContragent={handleContragentSelect}
        />
      </ModalUi>
    </>
  );
}

UpdateOrderForAdmissions.propTypes = {
  setOpen: PropTypes.func.isRequired,
  selectedUser: PropTypes.shape({
    idUser: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    dataUser: PropTypes.shape({
      docDate: PropTypes.string,
      contragent: PropTypes.object,
      division: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.object,
        PropTypes.array,
      ]),
      subdiv_one: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.object,
        PropTypes.array,
      ]),
      basedOn: PropTypes.string,
      periodFrom: PropTypes.string,
      periodTo: PropTypes.string,
      contract: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      docNumber: PropTypes.string,
      service: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object,
      ]),
    }),
  }),
  setSelectedUser: PropTypes.func.isRequired,
  setSnackbarOpen: PropTypes.func.isRequired,
  setSnackbarMessage: PropTypes.func.isRequired,
};
