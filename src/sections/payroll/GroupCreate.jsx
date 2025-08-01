/* eslint-disable */
import * as React from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Box,
  Tab,
  Tabs,
  Stack,
  Button,
  TextField,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';

import {
  useReadPayrollGroupMutation,
  useCreateOperationForPayrollMutation,
} from 'src/store/api/groupPayrollApi';
import { useGetSubdivisionsQuery } from 'src/store/api/subdivsion';
import { useGetSubdivOnesQuery } from 'src/store/api/subdivOnes';
import { useGetServiceQuery } from 'src/store/api/serviceApi';

function CustomTabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function getToday() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export default function GroupCreate() {
  const [value, setValue] = React.useState(0);
  const [formData1, setFormData1] = React.useState({
    divisionID: 0,
    subdiv_oneID: 0,
    serviceID: 0,
    docDate: getToday(), // <-- сегодняшняя дата по умолчанию
    periodFrom: "",
    periodTo: "",
    autorID: 1,
  });

  const [formData2, setFormData2] = React.useState({
    divisionID: 0,
    subdiv_oneID: 0,
    serviceID: 0,
    period: "",
  });

  const { data: subdivisionsData } = useGetSubdivisionsQuery('');
  const { data: subdivOnesData } = useGetSubdivOnesQuery('');
  const { data: servicesData } = useGetServiceQuery('');

  const [createOperationForPayroll] = useCreateOperationForPayrollMutation();
  const [readPayrollGroup] = useReadPayrollGroupMutation();
  const navigate = useNavigate();

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleFormChange = (event, formSetter) => {
    const { name, value: newValue } = event.target;
    formSetter((prev) => {
      if (name === 'periodFrom' && newValue) {
        const date = new Date(newValue);
        // Получаем последний день месяца в локальном времени
        const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        const yyyy = lastDay.getFullYear();
        const mm = String(lastDay.getMonth() + 1).padStart(2, '0');
        const dd = String(lastDay.getDate()).padStart(2, '0');
        const lastDayStr = `${yyyy}-${mm}-${dd}`;
        return { ...prev, [name]: newValue, periodTo: lastDayStr };
      }
      return { ...prev, [name]: newValue };
    });
  };

  const handleSubmit = async (formData, apiCall) => {
    try {
      const response = await apiCall(formData).unwrap();
      navigate('/payrollGroupResult', { state: { resultData: response.data || [] } });
    } catch (error) {
      console.error("Error submitting data:", error);
    }
  };

  const renderSelectOptions = (data) => {
    return data?.map((item) => (
      <MenuItem key={item.id} value={item.id}>
        {item.attributes?.title || 'Неизвестно'}
      </MenuItem>
    ));
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange}>
          <Tab label="Начисление из приказов" />
          <Tab label="Отбор начисленных" />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <Typography variant="h6" gutterBottom>
          Начисление из приказов
        </Typography>
        <Stack spacing={2}>
          <FormControl fullWidth variant="outlined">
            <InputLabel shrink={Boolean(formData1.divisionID || formData1.divisionID === 0)} htmlFor="division-select">
              Курс
            </InputLabel>
            <Select
              id="division-select"
              name="divisionID"
              value={formData1.divisionID}
              onChange={(e) => handleFormChange(e, setFormData1)}
              displayEmpty
              label="Курс"
            >
              <MenuItem value={0}>Не выбрано</MenuItem>
              {renderSelectOptions(subdivisionsData?.data)}
            </Select>
          </FormControl>

          <FormControl fullWidth variant="outlined">
            <InputLabel shrink={Boolean(formData1.subdiv_oneID || formData1.subdiv_oneID === 0)} htmlFor="faculty-select">
              Факультет
            </InputLabel>
            <Select
              id="faculty-select"
              name="subdiv_oneID"
              value={formData1.subdiv_oneID}
              onChange={(e) => handleFormChange(e, setFormData1)}
              displayEmpty
              label="Факультет"
            >
              <MenuItem value={0}>Не выбрано</MenuItem>
              {renderSelectOptions(subdivOnesData?.data)}
            </Select>
          </FormControl>

          <FormControl fullWidth variant="outlined">
            <InputLabel shrink={Boolean(formData1.serviceID || formData1.serviceID === 0)} htmlFor="service-select">
              Услуга
            </InputLabel>
            <Select
              id="service-select"
              name="serviceID"
              value={formData1.serviceID}
              onChange={(e) => handleFormChange(e, setFormData1)}
              displayEmpty
              label="Услуга"
            >
              <MenuItem value={0}>Не выбрано</MenuItem>
              {servicesData?.data?.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.attributes?.title || 'Неизвестно'}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Дата документа"
            name="docDate"
            type="date"
            value={formData1.docDate}
            onChange={(e) => handleFormChange(e, setFormData1)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            label="Период с"
            name="periodFrom"
            type="date"
            value={formData1.periodFrom}
            onChange={(e) => handleFormChange(e, setFormData1)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            label="Период до"
            name="periodTo"
            type="date"
            value={formData1.periodTo}
            onChange={(e) => handleFormChange(e, setFormData1)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleSubmit(formData1, createOperationForPayroll)}
          >
            Сформировать
          </Button>
        </Stack>
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <Typography variant="h6" gutterBottom>
          Начисление из существующих документов
        </Typography>
        <Stack spacing={2}>
          <FormControl fullWidth variant="outlined">
            <InputLabel shrink={Boolean(formData2.divisionID || formData2.divisionID === 0)} htmlFor="division-select-2">
              Курс
            </InputLabel>
            <Select
              id="division-select-2"
              name="divisionID"
              value={formData2.divisionID}
              onChange={(e) => handleFormChange(e, setFormData2)}
              displayEmpty
              label="Курс"
            >
              <MenuItem value={0}>Не выбрано</MenuItem>
              {renderSelectOptions(subdivisionsData?.data)}
            </Select>
          </FormControl>

          <FormControl fullWidth variant="outlined">
            <InputLabel shrink={Boolean(formData2.subdiv_oneID || formData2.subdiv_oneID === 0)} htmlFor="faculty-select-2">
              Факультет
            </InputLabel>
            <Select
              id="faculty-select-2"
              name="subdiv_oneID"
              value={formData2.subdiv_oneID}
              onChange={(e) => handleFormChange(e, setFormData2)}
              displayEmpty
              label="Факультет"
            >
              <MenuItem value={0}>Не выбрано</MenuItem>
              {renderSelectOptions(subdivOnesData?.data)}
            </Select>
          </FormControl>

          <FormControl fullWidth variant="outlined">
            <InputLabel shrink={Boolean(formData2.serviceID || formData2.serviceID === 0)} htmlFor="service-select-2">
              Услуга
            </InputLabel>
            <Select
              id="service-select-2"
              name="serviceID"
              value={formData2.serviceID}
              onChange={(e) => handleFormChange(e, setFormData2)}
              displayEmpty
              label="Услуга"
            >
              <MenuItem value={0}>Не выбрано</MenuItem>
              {servicesData?.data?.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.attributes?.title || 'Неизвестно'}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Период"
            name="period"
            type="month"
            value={formData2.period}
            onChange={(e) => handleFormChange(e, setFormData2)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleSubmit(formData2, readPayrollGroup)}
          >
            Сформировать
          </Button>
        </Stack>
      </CustomTabPanel>
    </Box>
  );
}