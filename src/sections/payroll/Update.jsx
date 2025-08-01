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
import { useGetSubdivOnesQuery } from 'src/store/api/subdivOnes';
import { useGetSubdivisionsQuery } from 'src/store/api/subdivsion';
import { useUpdatePayrollMutation } from 'src/store/api/payrollAPI';

import Iconify from 'src/components/iconify';

import Services from 'src/sections/services/view/view';

import { ContragentView } from '../contragent/view';

const initialUpdateState = {
  docDate: '',
  periodFrom: '',
  periodTo: '',
  amount: '',
  contragent: '',
  division: '',
  subdiv_one: '',
  service: '',
  autor: '',
  comment: '',
};

export default function UpdatePayroll({
  setOpen,
  selectedRow,
  setSnackbarOpen,
  setSnackbarMessage,
}) {
  const [update, setUpdate] = useState(initialUpdateState);
  const [errors, setErrors] = useState({});
  const [updatePayroll, { isLoading }] = useUpdatePayrollMutation();
  const [openContragentModal, setOpenContragentModal] = useState(false);
  const [openServiceModal, setOpenServiceModal] = useState(false);
  const [contragent, setContragent] = useState({});
  const [service, setService] = useState({});
  const { data: divisionList } = useGetSubdivisionsQuery('')
  const { data: subdiv_oneList } = useGetSubdivOnesQuery('')
  const { data: currentUser } = useGetUserQuery('')

  useEffect(() => {
    if (selectedRow) {
      // Найти id курса по названию
      let divisionId = '';
      if (selectedRow.division && divisionList?.data) {
        const found = divisionList.data.find(
          item => item.attributes.title === selectedRow.division
        );
        if (found) divisionId = found.id;
      }

      // Найти id факультета по названию
      let subdivOneId = '';
      if (selectedRow.subdiv_one && subdiv_oneList?.data) {
        const found = subdiv_oneList.data.find(
          item => item.attributes.title === selectedRow.subdiv_one
        );
        if (found) subdivOneId = found.id;
      }

      setUpdate({
        docDate: selectedRow.docDate || '',
        periodFrom: selectedRow.periodFrom || '',
        periodTo: selectedRow.periodTo || '',
        amount: selectedRow.amount || '',
        contragent: selectedRow.contragent || '',
        division: divisionId,
        subdiv_one: subdivOneId,
        service: selectedRow.service || '',
        autor: `${selectedRow?.autorObj?.attributes?.username || ''} ${selectedRow?.autorObj?.attributes?.usersurname || ''}`.trim(),
        comment: selectedRow.comment || '',
      });
      setContragent(selectedRow.contragentObj
        ? { idUser: selectedRow.contragentObj.id, dataUser: selectedRow.contragentObj.attributes }
        : {});
      setService(selectedRow.serviceObj
        ? { ID: selectedRow.serviceObj.id, dataService: selectedRow.serviceObj.attributes }
        : {});
    }
  }, [selectedRow, divisionList, subdiv_oneList]);

  const handleDialogClose = () => {
    setUpdate(initialUpdateState);
    setErrors({});
    setOpen(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setUpdate((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const isValidForm = () => {
    const { docDate, periodFrom, periodTo, amount } = update;
    const formErrors = {};

    if (!docDate.trim()) formErrors.docDate = 'Необходимо указать дату документа';
    if (!periodFrom.trim()) formErrors.periodFrom = 'Необходимо указать начало периода';
    if (!periodTo.trim()) formErrors.periodTo = 'Необходимо указать конец периода';
    if (!amount || Number.isNaN(amount) || Number(amount) <= 0) {
      formErrors.amount = 'Необходимо указать корректную сумму';
    }

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!isValidForm()) return;

    try {
      const updatedPayload = {
        docDate: update.docDate,
        periodFrom: update.periodFrom,
        periodTo: update.periodTo,
        amount: Number(update.amount),
        contragent: contragent.idUser,
        division: update.division,
        subdiv_one: update.subdiv_one,
        service: service.ID,
        autor: currentUser.id,
        comment: update.comment,
      };

      await updatePayroll({ updated: updatedPayload, id: selectedRow.id }).unwrap();

      setSnackbarMessage('Запись успешно обновлена');
      setSnackbarOpen(true);
      handleDialogClose();
    } catch (error) {
      setSnackbarMessage('Ошибка при обновлении записи');
      setSnackbarOpen(true);
      console.error('Ошибка при обновлении:', error);
    }
  };

  const handleContragentSelect = (selectedContragent) => {
    setContragent(selectedContragent);
    setUpdate((prev) => ({ ...prev, contragent: selectedContragent.idUser }));
    setOpenContragentModal(false);
  };

  const handleServiceSelect = (selectedService) => {
    setService(selectedService);
    setUpdate((prev) => ({ ...prev, service: selectedService.ID }));
    setOpenServiceModal(false);
  };

  return (
    <>
      <Typography variant="h6" component="h2" textAlign="center" gutterBottom>
        Изменить запись
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
              value={update.docDate}
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
              value={update.periodFrom}
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
              value={update.periodTo}
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
              sx={{ width: '84%' }}
              select
              name="division"
              label="Курс"
              variant="outlined"
              fullWidth
              value={update.division || ""}
              onChange={handleChange}
              error={Boolean(errors.division)}
              helperText={errors.division}
            >
              {divisionList?.data.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.attributes.title}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              sx={{ width: '84%' }}
              select
              name="subdiv_one"
              label="Факультет"
              variant="outlined"
              fullWidth
              value={update.subdiv_one}
              onChange={handleChange}
              error={Boolean(errors.subdiv_one)}
              helperText={errors.subdiv_one}
            >
              {subdiv_oneList?.data.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.attributes.title}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </Box>
        <Box sx={{ mt: 1 }} display="flex" justifyContent="center" gap={2.5}>
          <TextField
            sx={{ width: '84%' }}
            label="Вид услуг"
            variant="outlined"
            value={service?.dataService?.title || ''}
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
              shrink: Boolean(service?.dataService?.title),
            }}
            readOnly
          />
          <TextField
            name="amount"
            label="Количество"
            sx={{ width: '100%' }}
            value={update.amount}
            onChange={handleChange}
            error={Boolean(errors.amount)}
            helperText={errors.amount}
            type="number"
          />
        </Box>
        <TextField
          name="comment"
          label="Комментарии"
          sx={{ width: '100%' }}
          value={update.comment}
          onChange={handleChange}
          type='text'
        />
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-start' }}>
            <TextField
              sx={{ width: '100%' }}
              name="autor"
              label="Автор"
              value={update.autor}
              onChange={handleChange}
              error={Boolean(errors.autor)}
              helperText={errors.autor}
              type="string"
              InputLabelProps={{ shrink: true }}
            />
          </Box>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" color="error" sx={{ mr: 2 }} onClick={handleDialogClose}>
              Отмена
            </Button>
            <Button variant="contained" onClick={handleUpdate} disabled={isLoading}>
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

UpdatePayroll.propTypes = {
  setOpen: PropTypes.func.isRequired,
  selectedRow: PropTypes.object.isRequired,
  setSnackbarOpen: PropTypes.func.isRequired,
  setSnackbarMessage: PropTypes.func.isRequired,
};
