/* eslint-disable no-nested-ternary */
/* eslint-disable react/prop-types */
import React from 'react';
import { Icon } from '@iconify/react';

import {
  Box, Chip, Button, Popover, Checkbox, FormGroup, TextField, Typography, IconButton, Autocomplete, FormControlLabel
} from '@mui/material';

import ModalUi from 'src/ui/ModalUi';

// eslint-disable-next-line import/no-cycle
import ContragentSelectModal from './ContragentSelectModal';

export default function FilterPopover({
  open,
  anchorEl,
  onClose,
  fields,
  values,
  onChange,
  onApply,
  onReset,
  active,
  sx = {},
  ...props
}) {
  const [openContragentModal, setOpenContragentModal] = React.useState(false);

  // Массив выбранных контрагентов
  const contragentValue = values.contragent || [];

  // Добавить/убрать контрагента (multiSelect)
  const handleContragentSelect = (contragent) => {
    const name = contragent.dataUser?.name;
    const already = contragentValue.includes(name);
    let newList;
    if (already) {
      newList = contragentValue.filter(n => n !== name);
    } else {
      newList = [...contragentValue, name];
    }
    onChange({ ...values, contragent: newList });
    setOpenContragentModal(false);
  };

  const handleContragentDelete = (name) => {
    onChange({
      ...values,
      contragent: contragentValue.filter(n => n !== name),
    });
  };

  const handleApply = () => {
    const filtered = Object.fromEntries(
      Object.entries(values).filter(([_, v]) => v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0))
    );
    onApply(filtered);
    onClose();
  };

  const handleReset = () => {
    onReset();
    onClose();
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
    >
      <Box p={2} minWidth={260}>
        <Typography fontWeight={600} mb={1} fontSize={16}>Фильтровать по:</Typography>
        <FormGroup>
          {fields.map(field => (
            <Box key={field.key} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={values[field.key] !== undefined}
                    onChange={e => {
                      const { checked } = e.target;
                      if (checked) {
                        onChange({ ...values, [field.key]: field.type === 'select' ? [] : '' });
                      } else {
                        const newValues = { ...values };
                        delete newValues[field.key];
                        onChange(newValues);
                      }
                    }}
                    color="primary"
                  />
                }
                label={field.label}
                sx={{ minWidth: 160, mr: 1 }}
              />
              {values[field.key] !== undefined && (
                field.type === 'contragentModal' ? (
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    width: 200,
                    minHeight: 40,
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                    pl: 1,
                    pr: 0.5,
                    bgcolor: '#fafafa'
                  }}>
                    <Box sx={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {contragentValue.length === 0 && (
                        <Typography sx={{ color: '#aaa', fontSize: 15, mt: 0.5 }}>Выбрать...</Typography>
                      )}
                      {contragentValue.map(name => (
                        <Chip
                          key={name}
                          label={name}
                          size="small"
                          onDelete={() => handleContragentDelete(name)}
                          sx={{ maxWidth: 160 }}
                        />
                      ))}
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => setOpenContragentModal(true)}
                    >
                      <Icon icon="ic:round-more-vert" width={22} height={22} color="#888" />
                    </IconButton>
                    <ModalUi width="85%" height="98%" open={openContragentModal} setOpen={setOpenContragentModal}>
                      <ContragentSelectModal
                        open={openContragentModal}
                        setOpen={setOpenContragentModal}
                        onSelect={handleContragentSelect}
                        selected={contragentValue.map(c => c.id)}
                      />
                    </ModalUi>
                  </Box>
                ) : field.type === 'select' ? (
                  <Autocomplete
                    multiple={field.multiple}
                    size="small"
                    options={field.options || []}
                    value={values[field.key] || []}
                    onChange={(_, value) => onChange({ ...values, [field.key]: value })}
                    sx={{ width: 180, ml: 1 }}
                    renderInput={(params) => (
                      <TextField {...params} placeholder="Выбрать..." />
                    )}
                  />
                ) : field.type === 'date' ? (
                  <TextField
                    size="small"
                    type="date"
                    value={values[field.key] || ''}
                    onChange={e => onChange({ ...values, [field.key]: e.target.value })}
                    sx={{ width: 150, ml: 1 }}
                    InputLabelProps={{ shrink: true }}
                  />
                ) : (
                  <TextField
                    size="small"
                    type={field.key === 'inn' ? 'text' : (field.type || 'text')}
                    placeholder={field.placeholder || ''}
                    value={values[field.key] || ''}
                    onChange={e => {
                      let val = e.target.value;
                      // Только цифры для ИНН
                      if (field.key === 'inn') {
                        val = val.replace(/\D/g, '');
                      }
                      onChange({ ...values, [field.key]: field.type === 'number' || field.key === 'inn' ? val : val });
                    }}
                    sx={{ width: 140, ml: 1 }}
                    inputProps={field.key === 'inn' ? { inputMode: 'numeric', pattern: '[0-9]*' } : {}}
                  />
                )
              )}
            </Box>
          ))}
        </FormGroup>
        <Box mt={1} textAlign="right">
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            onClick={handleReset}
            sx={{ mr: 1 }}
          >
            Отключить фильтры
          </Button>
          <Button
            size="small"
            variant="contained"
            color="primary"
            onClick={handleApply}
          >
            Применить
          </Button>
        </Box>
      </Box>
    </Popover>
  );
}