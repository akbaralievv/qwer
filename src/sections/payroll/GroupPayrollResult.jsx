/* eslint-disable no-nested-ternary */
import { useLocation } from 'react-router-dom';
import { TableVirtuoso } from 'react-virtuoso';
import React, { useRef, useMemo, useState, useEffect } from 'react';

import {
  Box, Card, Table, Paper, Alert, Button, Tooltip, TableRow, Checkbox,
  Snackbar, TableCell, TextField, Typography, IconButton,
  CardContent,
  TableContainer
} from '@mui/material';

import { useTableSearch, useTableSelection, useTableCellSelection } from 'src/hooks/use-table-selections';

import { convertToRuFormat } from 'src/utils/convernRuFormat';

import SearchInput from 'src/shared/SearchInput';
import RefreshButton from 'src/shared/RefreshButton';
import ActionButtons from 'src/shared/ActionButtons';
import FilterPopover from 'src/shared/FilterPopover';
import { highlight } from 'src/shared/SharedFunctions';
import ColumnSettingsPopover from 'src/shared/ColumnSettigsPopover';
import { useCreatePayrollGroupMutation, useDeletePayrollGroupMutation } from 'src/store/api/groupPayrollApi';

import Iconify from 'src/components/iconify';

import { FILTER_FIELDS } from './constants';

const ALL_COLUMNS = [
  { key: 'docDate', label: 'Дата', width: 120 },
  { key: 'periodFrom', label: 'Начало', width: 120 },
  { key: 'periodTo', label: 'Конец', width: 120 },
  { key: 'amount', label: 'Сумма', width: 150 },
  { key: 'contragent', label: 'Контрагент', width: 210 },
  { key: 'division', label: 'Курс', width: 100 },
  { key: 'subdiv_one', label: 'Факультет', width: 120 },
  { key: 'service', label: 'Услуга', width: 120 },
  { key: 'autor', label: 'Автор', width: 120 },
];

// Функция для отображаемого значения (как в payment/view)
function getCellDisplayValue(row, key) {
  if (key === 'contragent') return row.contragentObj?.attributes?.name || row.contragent?.name || '';
  if (key === 'division') return row.divisionObj?.attributes?.title || row.division?.title || '';
  if (key === 'subdiv_one') return row.subdiv_oneObj?.attributes?.title || row.subdiv_one?.title || '';
  if (key === 'service') return row.serviceObj?.attributes?.title || row.service?.title || '';
  if (key === 'autor') {
    if (row.autorObj)
      return `${row.autorObj.attributes?.username || ''} ${row.autorObj.attributes?.usersurname || ''}`;
    if (row.autor)
      return `${row.autor?.usersurname || ''} ${row.autor?.username || ''}`;
    return '';
  }
  if (['docDate', 'periodFrom', 'periodTo'].includes(key)) return convertToRuFormat(row[key]);
  return row[key] ?? '';
}

export default function GroupPayrollResult() {
  const { state } = useLocation();
  const initialData = state?.resultData || [];

  // --- Состояния ---
  const [data, setData] = useState(initialData);
  const [filters, setFilters] = useState({ search: '', periodFrom: '', periodTo: '', filterFields: [] });
  const [fieldFilters, setFieldFilters] = useState({});
  const [fieldFiltersDraft, setFieldFiltersDraft] = useState({});
  const [filterPopover, setFilterPopover] = useState(null);
  const [columnPopover, setColumnPopover] = useState(null);
  const [visibleColumns, setVisibleColumns] = useState(ALL_COLUMNS.map(col => col.key));
  const [rememberColumns, setRememberColumns] = useState(false);
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('docDate');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [createPayrollGroup] = useCreatePayrollGroupMutation();
  const [deletePayrollGroup] = useDeletePayrollGroupMutation();

  // --- Колонки и ключи ---
  const headTable = ALL_COLUMNS.filter(col => visibleColumns.includes(col.key)).concat([
    { key: 'action', label: '', align: 'right', width: 50 },
  ]);
  const visibleHeadKeys = headTable.filter(h => h.key !== 'action').map(h => h.key);

  // --- Фильтрация ---
  const filteredRows = useMemo(() => {
    if (!filters.filterFields.length || !Object.keys(fieldFilters).length) return data;
    return data.filter(row =>
      filters.filterFields.every(field =>
        fieldFilters[field]?.length
          ? fieldFilters[field].includes(getCellDisplayValue(row, field))
          : true
      )
    );
  }, [data, filters.filterFields, fieldFilters]);

  // --- Сортировка ---
  const sortedRows = useMemo(() => {
    const sorted = [...filteredRows];
    sorted.sort((a, b) => {
      if (orderBy && getCellDisplayValue(a, orderBy) && getCellDisplayValue(b, orderBy)) {
        if (order === 'asc') return String(getCellDisplayValue(a, orderBy)).localeCompare(String(getCellDisplayValue(b, orderBy)));
        return String(getCellDisplayValue(b, orderBy)).localeCompare(String(getCellDisplayValue(a, orderBy)));
      }
      return 0;
    });
    return sorted;
  }, [filteredRows, order, orderBy]);

  // --- Поиск и подсветка по отображаемым значениям ---
  const {
    searchMatches,
    searchIndex,
    setSearchIndex,
    handleSearchNext,
  } = useTableSearch(
    sortedRows,
    visibleHeadKeys,
    filters.search,
    getCellDisplayValue
  );

  useEffect(() => {
    setSearchIndex(0);
  }, [filters.search, sortedRows.length, setSearchIndex]);

  // --- Выделение ---
  const {
    selectedIds,
    setSelectedIds,
    isAllSelected,
    handleSelectAll,
    handleSelectRow,
  } = useTableSelection(sortedRows);

  // --- Выделение ячейки ---
  const {
    selectedCell,
    setSelectedCell,
    selectedColumn,
    setSelectedColumn,
    selectedValue,
    setSelectedValue,
    handleCellClick: baseHandleCellClick,
  } = useTableCellSelection();

  const handleCellClick = (row, col, event) => {
    baseHandleCellClick(row, col, event);
    setSelectedValue(getCellDisplayValue(row, col));
  };

  const [cellFilterActive, setCellFilterActive] = useState(false);

  // --- Фильтры ---
  const handleFilterIconClick = (e) => {
    if (selectedColumn && selectedValue !== null && !cellFilterActive) {
      setFilters((prev) => ({
        ...prev,
        filterFields: [selectedColumn],
      }));
      setFieldFilters({ [selectedColumn]: [selectedValue] });
      setFieldFiltersDraft({ [selectedColumn]: [selectedValue] });
      setCellFilterActive(true);
      return;
    }
    if (cellFilterActive) {
      setFilters((prev) => ({
        ...prev,
        filterFields: [],
      }));
      setFieldFilters({});
      setFieldFiltersDraft({});
      setSelectedColumn(null);
      setSelectedValue(null);
      setSelectedCell({ rowId: null, col: null });
      setCellFilterActive(false);
      return;
    }
    setFilterPopover(e.currentTarget);
  };

  const handleApplyFilters = (draft) => {
    setFieldFiltersDraft(draft);
    setFilters(prev => ({
      ...prev,
      filterFields: Object.keys(draft)
    }));
    setFieldFilters(draft);
    setCellFilterActive(false);
    setFilterPopover(null);
  };
  const handleResetFilters = () => {
    setFieldFiltersDraft({});
    setFilters(prev => ({ ...prev, filterFields: [] }));
    setFieldFilters({});
    setCellFilterActive(false);
    setFilterPopover(null);
  };

  // --- Колонки ---
  const handleColumnPopover = (event) => setColumnPopover(event.currentTarget);
  const handleColumnPopoverClose = () => setColumnPopover(null);
  const handleColumnChange = (key) => {
    setVisibleColumns(prev =>
      prev.includes(key)
        ? prev.filter(k => k !== key)
        : [...prev, key]
    );
  };

  // --- Сохранение и удаление ---
  const handleSave = async () => {
    try {
      const payload = { data };
      await createPayrollGroup(payload).unwrap();
      setSnackbarSeverity('success');
      setSnackbarMessage('Данные успешно сохранены!');
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarSeverity('error');
      setSnackbarMessage('Ошибка при сохранении данных.');
      setSnackbarOpen(true);
    }
  };

  const handleDelete = async () => {
    try {
      const rowsToDelete = data.filter((row) => selectedIds.includes(row.id));
      const payload = { data: rowsToDelete };
      const response = await deletePayrollGroup(payload).unwrap();
      setSnackbarSeverity('success');
      setSnackbarMessage(response.message);
      setSnackbarOpen(true);
      const successfullyDeletedIds = rowsToDelete.map((item) => String(item.id));
      setData((prevData) => prevData.filter((row) => !successfullyDeletedIds.includes(String(row.id))));
      setSelectedIds([]);
    } catch (error) {
      setSnackbarSeverity('error');
      setSnackbarMessage('Ошибка при удалении данных.');
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  // --- Фокусировка на найденной строке поиска ---
  const virtuosoRef = useRef(null);
  useEffect(() => {
    if (
      virtuosoRef.current &&
      searchMatches.length &&
      typeof searchMatches[searchIndex] === 'number'
    ) {
      virtuosoRef.current.scrollToIndex({
        index: searchMatches[searchIndex],
        align: 'center',
        behavior: 'smooth',
      });
    }
  }, [searchIndex, searchMatches]);

  const divisions = useMemo(
    () => Array.from(new Set(data.map(r =>
      r.divisionObj?.attributes?.title || r.division?.title || r.division || ''
    ).filter(Boolean))),
    [data]
  );

  const faculties = useMemo(
    () => Array.from(new Set(data.map(r =>
      r.subdiv_oneObj?.attributes?.title || r.subdiv_one?.title || r.subdiv_one || ''
    ).filter(Boolean))),
    [data]
  );

  const services = useMemo(
    () => Array.from(new Set(data.map(r =>
      r.serviceObj?.attributes?.title || r.service?.title || r.service || ''
    ).filter(Boolean))),
    [data]
  );

  const autors = useMemo(
    () => Array.from(new Set(data.map(r =>
      r.autorObj
        ? `${r.autorObj.attributes?.username || ''} ${r.autorObj.attributes?.usersurname || ''}`.trim()
        : `${r.autor?.usersurname || ''} ${r.autor?.username || ''}`
    ).filter(v => v && v.trim()))),
    [data]
  );

  if (!data.length) {
    return (
      <Box textAlign="center" mt={4}>
        <Typography variant="h6">Нет данных для отображения</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 0, background: '#f6f7f9', minHeight: '100vh', pb: 0 }}>
      <Typography variant="h4" ml={1} mb={2} mt={2} gutterBottom sx={{ color: '#444' }}>
        Результаты группового начисления
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, ml: 1, flexWrap: 'wrap' }}>
        <SearchInput
          value={filters.search}
          onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
          onClear={() => setFilters(prev => ({ ...prev, search: '' }))}
          onSearchNext={handleSearchNext}
          searchIndex={searchMatches.length ? searchIndex : 0}
          searchCount={searchMatches.length}
        />
        <RefreshButton onClick={() => { }} loading={false} />
        <Tooltip
          title={
            selectedColumn && selectedValue !== null && !cellFilterActive
              ? 'Применить фильтр по ячейке'
              : cellFilterActive
                ? 'Сбросить фильтр'
                : 'Открыть фильтры'
          }
          arrow
        >
          <IconButton
            onClick={handleFilterIconClick}
            sx={{
              background: filters.filterFields.length > 0 || cellFilterActive ? '#fffde7' : '#ededed',
              border: filters.filterFields.length > 0 || cellFilterActive ? '1.5px solid #fbc02d' : 'none',
              color: '#616161',
              borderRadius: 2,
              height: 44,
              width: 44,
            }}
          >
            <Iconify icon="ic:round-filter-list" width={22} height={22} color="#616161" />
          </IconButton>
        </Tooltip>
        <FilterPopover
          open={Boolean(filterPopover)}
          anchorEl={filterPopover}
          onClose={() => setFilterPopover(null)}
          fields={FILTER_FIELDS.map(f => {
            if (f.key === 'division') return { ...f, options: divisions };
            if (f.key === 'subdiv_one') return { ...f, options: faculties };
            if (f.key === 'service') return { ...f, options: services };
            if (f.key === 'autor') return { ...f, options: autors };
            return f;
          })}
          values={fieldFiltersDraft}
          onChange={setFieldFiltersDraft}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
          active={filters.filterFields.length > 0 || cellFilterActive}
        />
        <Tooltip title="Настройки колонок" arrow>
          <IconButton
            onClick={handleColumnPopover}
            sx={{
              background: '#ededed',
              color: '#616161',
              borderRadius: 2,
              height: 44,
              width: 44,
              '&:hover': { background: '#e0e0e0', color: '#222' }
            }}
          >
            <Iconify icon="ic:round-settings" width={22} height={22} color="#616161" />
          </IconButton>
        </Tooltip>
        <ColumnSettingsPopover
          open={Boolean(columnPopover)}
          anchorEl={columnPopover}
          onClose={handleColumnPopoverClose}
          columns={ALL_COLUMNS}
          visibleColumns={visibleColumns}
          onColumnChange={handleColumnChange}
          rememberColumns={rememberColumns}
          onRememberColumnsChange={setRememberColumns}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          sx={{
            height: 44,
            fontWeight: 600,
            textTransform: 'none',
            boxShadow: 'none',
            ml: 1
          }}
        >
          Сохранить
        </Button>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 0, ml: 1 }}>
        <ActionButtons
          onAdd={null}
          onView={null}
          onEdit={null}
          onDelete={handleDelete}
          canView={false}
          canEdit={false}
          canDelete={selectedIds.length > 0}
        />
      </Box>
      <Card sx={{ background: '#fafbfc', borderRadius: 3, boxShadow: '0 2px 8px #e0e0e0', mt: 0 }}>
        <CardContent>
          <TableContainer
            component={Paper}
            sx={{
              minHeight: 300,
              maxHeight: 'calc(100vh - 280px)',
              height: 'calc(100vh - 280px)',
              background: '#fafbfc'
            }}
          >
            <TableVirtuoso
              ref={virtuosoRef}
              data={sortedRows}
              fixedHeaderContent={() => (
                <TableRow>
                  <TableCell padding="checkbox" sx={{ background: '#f4f5f7' }}>
                    <Checkbox
                      checked={isAllSelected}
                      indeterminate={selectedIds.length > 0 && !isAllSelected}
                      onChange={handleSelectAll}
                      color="primary"
                    />
                  </TableCell>
                  {headTable.map((headCell) => (
                    <TableCell
                      key={headCell.key}
                      align={headCell.align || 'left'}
                      sx={{
                        background: '#f4f5f7',
                        color: '#444',
                        fontWeight: 600,
                        fontSize: 15,
                        width: headCell.width,
                        minWidth: headCell.width,
                        maxWidth: headCell.width,
                        border: selectedColumn === headCell.key ? '2px solid #1976d2' : undefined,
                        cursor: headCell.key !== 'action' ? 'pointer' : undefined,
                        transition: 'border 0.2s'
                      }}
                      onClick={
                        headCell.key !== 'action'
                          ? (e) => {
                            e.stopPropagation();
                            setOrderBy(headCell.key);
                            setOrder(orderBy === headCell.key && order === 'asc' ? 'desc' : 'asc');
                          }
                          : undefined
                      }
                    >
                      {headCell.label}
                    </TableCell>
                  ))}
                </TableRow>
              )}
              itemContent={(index, row) => (
                <>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedIds.includes(row.id)}
                      onChange={() => handleSelectRow(row.id)}
                      color="primary"
                    />
                  </TableCell>
                  {headTable.filter(h => h.key !== 'action').map((h) => (
                    <TableCell
                      key={h.key}
                      onClick={(e) => {
                        if (h.key !== 'amount') handleCellClick(row, h.key, e);
                      }}
                      sx={{
                        cursor: h.key !== 'action' && h.key !== 'amount' ? 'pointer' : undefined,
                        background:
                          selectedCell.rowId === row.id && selectedCell.col === h.key ? '#e3f2fd' : undefined,
                        fontWeight:
                          selectedCell.rowId === row.id && selectedCell.col === h.key ? 700 : undefined,
                      }}
                    >
                      {h.key === 'amount'
                        ? (
                          <TextField
                            value={row.amount}
                            onChange={e => setData(prevData =>
                              prevData.map(r =>
                                r.id === row.id ? { ...r, amount: e.target.value } : r
                              )
                            )}
                            size="small"
                            variant="outlined"
                            type="number"
                            onClick={e => e.stopPropagation()}
                            autoFocus={selectedCell.rowId === row.id && selectedCell.col === h.key}
                          />
                        )
                        : (() => {
                          const value = getCellDisplayValue(row, h.key);
                          if (
                            filters.search &&
                            typeof value === 'string' &&
                            value.toLowerCase().includes(filters.search.toLowerCase())
                          ) {
                            return highlight(value, filters.search);
                          }
                          return value;
                        })()
                      }
                    </TableCell>
                  ))}
                  <TableCell align="right" />
                </>
              )}
              components={{
                Table: (props) => (
                  <Table {...props} stickyHeader />
                ),
              }}
              style={{ height: '100%' }}
            />
          </TableContainer>
          <Box sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: 4,
            mt: 2,
            pr: 2
          }}>
            <Typography sx={{ fontWeight: 700, fontSize: 16 }}>
              Итоговая сумма:&nbsp;
              {sortedRows.reduce((sum, row) => sum + (Number(row.amount) || 0), 0).toLocaleString('ru-RU')} сом
            </Typography>
            <Typography sx={{ fontWeight: 700, fontSize: 16 }}>
              Итоговое количество: &nbsp;
              {sortedRows.length}
            </Typography>
          </Box>
        </CardContent>
      </Card>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage.split('\n').map((line, index) => (
            <span key={index}>
              {line}
              <br />
            </span>
          ))}
        </Alert>
      </Snackbar>
    </Box>
  );
}