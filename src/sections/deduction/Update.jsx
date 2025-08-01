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
// eslint-disable-next-line
import { convertToRuFormat } from 'src/utils/convernRuFormat';
// eslint-disable-next-line
import { useGetPositionQuery } from 'src/store/api/positionApi';
import { useGetSubdivOnesQuery } from 'src/store/api/subdivOnes';
import { useGetSubdivisionsQuery } from 'src/store/api/subdivsion';
// import { useGetContragentsQuery } from 'src/store/api/contragentAPI';
import { useUpdateOperationMutation } from 'src/store/api/orderForAdmissions';

import Iconify from 'src/components/iconify';
// eslint-disable-next-line
import Services from 'src/sections/services/view/view';

import { ContragentView } from '../contragent/view';

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
  oper_type: 3,
};

export default function UpdateOrderForAdmissions({
  setOpen,
  selectedUser,
  setSelectedUser,
  setSnackbarOpen,
  snackbarOpen,
  setSnackbarMessage,
  snackbarMessage,
}) {
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
  const { data: autor } = useGetUserQuery();
  const { data: facultative } = useGetSubdivOnesQuery('');
  const { data: subdivision } = useGetSubdivisionsQuery('');
  const { data: positions } = useGetPositionQuery('?populate=*');
  const [updateData, { isLoading }] = useUpdateOperationMutation();
  // const { data: pdfData } = useGetContragentsQuery(
  //   `/${selectedUser?.dataUser?.contragent?.data?.id}?populate[0]=division&populate[1]=subdive_one`
  // );

  const [update, setUpdate] = useState(initialUpdateState);
  const [errors, setErrors] = useState({});
  const [openContragentModal, setOpenContragentModal] = useState(false);
  const [openServiceModal, setOpenServiceModal] = useState(false);
  const [contragent, setContragent] = useState({});
  // eslint-disable-next-line
  const [objectPDF, setObjectPDF] = useState({
    course: '',
    facultative: '',
  });
  // eslint-disable-next-line
  const [position, setPosition] = useState({
    rector: '',
    director: '',
  });

  useEffect(() => {
    if (selectedUser) {
      setUpdate({
        contract: selectedUser.dataUser.contract || '',
        price: selectedUser.dataUser.price || '',
        docNumber: selectedUser.dataUser.docNumber || '',
        docDate: selectedUser.dataUser.docDate || '',
        contragent: selectedUser.dataUser?.contragent?.data?.id || '',
        subdiv_one: selectedUser.dataUser?.subdiv_one?.data?.id || '',
        division: selectedUser.dataUser?.division?.data?.id || '',
        basedOn: selectedUser.dataUser.basedOn || '',
        periodFrom: selectedUser.dataUser.periodFrom || '',
        periodTo: selectedUser.dataUser.periodTo || '',
        service: selectedUser.dataUser.service.data?.attributes.title || '',
      });
      setContragent({
        dataUser: {
          name: selectedUser.dataUser.contragent.data.attributes.name,
          inn: selectedUser.dataUser.contragent.data.attributes.inn,
        },
        idUser: selectedUser.dataUser?.contragent?.data?.id,
      });

      setService({
        dataService: {
          ...(selectedUser.dataUser.service.data?.attributes || ''),
          ID: selectedUser.dataUser.service.data?.id || '',
        },
      });
    }
    // eslint-disable-next-line
  }, [selectedUser]);

  useEffect(() => {
    setUpdate({
      ...update,
      autor: autor?.id,
      contragent: contragent?.idUser,
    });
    // eslint-disable-next-line
  }, [contragent]);

  useEffect(() => {
    handleBlurContract()
    // eslint-disable-next-line
  }, [service])

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
    let result;
    switch (service?.dataService?.math_oper) {
      case '+':
        result = update.contract + service.dataService.value;
        break;
      case '-':
        result = update.contract - service.dataService.value;
        break;
      case '*':
        result = update.contract * service.dataService.value;
        break;
      case '/':
        result = update.contract / service.dataService.value;
        break;
      case '%':
        result = (update.contract * service.dataService.value) / 100;
        break;
      default:
        result = 0;
    }
    setUpdate((prev) => ({ ...prev, price: result }));
  };

  const handleCourseChange = (event) => {
    const selectedCourseId = event.target.value;
    const selectedCourse = subdivision.data.find((item) => item.id === selectedCourseId);

    setUpdate((prev) => ({
      ...prev,
      division: selectedCourse ? selectedCourse.id : '',
    }));
  };

  const handleFacultativeChange = (event) => {
    const selectedFacultativeId = event.target.value;
    const selectedFacultative = facultative.data.find((item) => item.id === selectedFacultativeId);

    setUpdate((prev) => ({
      ...prev,
      subdiv_one: selectedFacultative ? selectedFacultative.id : '',
    }));
  };

  const isValidForm = () => {
    const { contract, docDate, docNumber } = update;
    const formErrors = {};

    const amountStr = String(contract).trim();
    const docNumberStr = String(docNumber).trim();
    // eslint-disable-next-line
    if (!amountStr || isNaN(amountStr) || Number(amountStr) <= 0) {
      formErrors.contract = 'Необходимо заполнить корректную сумму';
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
        service: service.ID,
      };
      await updateData({ updated: updatedPayload, id: selectedUser.idUser }).unwrap();

      setSnackbarMessage('Приказ на прием успешно обновлен');
      setSnackbarOpen(true);
      handleDialogClose();
    } catch (error) {
      setSnackbarMessage('Ошибка при обновлении приказа', error);
      setSnackbarOpen(true);
      console.error('Ошибка при обновлении:', error);
    }
  };

  const handleContragentSelect = (selectedContragent) => {
    setContragent(selectedContragent);
    setUpdate((prev) => ({ ...prev, contragent: selectedContragent.id }));
    setOpenContragentModal(false);
  };

  const handleServiceSelect = (selected) => {
    setUpdate((prev) => ({ ...prev, service: selected.dataService?.title }));
    setService(selected);
    setOpenServiceModal(false);
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
        Изменить приказ отчисление
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
                value={update.docNumber}
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
                value={update.docDate}
                error={Boolean(errors.docDate)}
                helperText={errors.docDate}
                type="date"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                sx={{ width: '84%' }}
                label="Вид услуг"
                variant="outlined"
                value={update.service || ''}
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
                  shrink: Boolean(update?.service),
                }}
                readOnly
              />
              <TextField
                onChange={handleChange}
                onBlur={handleBlurContract}
                name="contract"
                label="Сумма"
                sx={{ width: '100%' }}
                value={!update.contract < -1 ? selectedUser?.dataUser?.contract : update.contract}
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
                value={contragent?.dataUser?.name}
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
                value={update.division}
                onChange={handleCourseChange}
                error={Boolean(errors.division)}
                helperText={errors.division}
              >
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
                value={update.subdiv_one}
                onChange={handleFacultativeChange}
                error={Boolean(errors.subdiv_one)}
                helperText={errors.subdiv_one}
              >
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
                value={update.periodFrom}
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
                value={update.periodTo}
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
              value={update.basedOn}
              error={Boolean(errors.basedOn)}
              helperText={errors.basedOn}
            />
            <TextField
              name="price"
              label={`Сумма ${service?.dataService?.math_oper} ${
                service.dataService.measurement ? service.dataService.measurement : 'ед. изм.'
              } = сумма за ${
                service.dataService.measurement ? service.dataService.measurement : 'ед. изм.'
              }`}
              sx={{ width: '100%' }}
              value={update.price}
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
            value={`${autor?.username} ${autor?.usersurname}`}
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
          filterOperation='зачислен'
          filterOperation2='перемещен'
          selectedFromModal={contragent?.idUser}
          setOpen={setOpenContragentModal}
          setContragent={handleContragentSelect}
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
UpdateOrderForAdmissions.propTypes = {
  setOpen: PropTypes.func.isRequired,
  selectedUser: PropTypes.shape({
    idUser: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    dataUser: PropTypes.shape({
      amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      docDate: PropTypes.string.isRequired,
      contragent: PropTypes.object.isRequired,
      division: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      subdiv_one: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      basedOn: PropTypes.string,
      periodFrom: PropTypes.string,
      periodTo: PropTypes.string,
      contract: PropTypes.number,
      price: PropTypes.number,
      docNumber: PropTypes.string,
      service: PropTypes.string,
    }).isRequired,
  }),
  setSelectedUser: PropTypes.func.isRequired,
  setSnackbarOpen: PropTypes.func.isRequired,
  snackbarOpen: PropTypes.bool,
  setSnackbarMessage: PropTypes.func.isRequired,
  snackbarMessage: PropTypes.string,
};
