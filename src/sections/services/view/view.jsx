/* eslint-disable no-nested-ternary */
import { TableVirtuoso } from 'react-virtuoso';
import React, { useRef, useMemo, useState, useEffect } from 'react';

import {
  Box,
  Card,
  Table,
  Paper,
  Button,
  Tooltip,
  Popover,
  Snackbar,
  Checkbox,
  TableRow,
  TableCell,
  TextField,
  Typography,
  IconButton,
  CardContent,
  TableContainer,
  TableSortLabel,
} from '@mui/material';

import { useTableSearch, useTableSelection, useTableCellSelection } from 'src/hooks/use-table-selections';

import ModalUi from 'src/ui/ModalUi';
import Loading from 'src/ui/Loading';
import SearchInput from 'src/shared/SearchInput';
import RefreshButton from 'src/shared/RefreshButton';
import ActionButtons from 'src/shared/ActionButtons';
import FilterPopover from 'src/shared/FilterPopover';
import { highlight } from 'src/shared/SharedFunctions';
import ColumnSettingsPopover from 'src/shared/ColumnSettigsPopover';
import { useGetServiceQuery, useUpdateServiceMutation, useRemoveServiceMutation } from 'src/store/api/serviceApi';

import Iconify from 'src/components/iconify';

import Create from '../Create';
import Update from '../Update';

const COLUMN_KEY = 'services_visible_columns';

const ALL_COLUMNS = [
  { key: 'id', label: 'ID', always: true, width: 80 },
  { key: 'date', label: 'Дата', always: true, width: 120 },
  { key: 'title', label: 'Название', always: true, width: 250 },
  { key: 'value', label: 'Значение', always: true, width: 120 },
  { key: 'code', label: 'Код платежа', always: true, width: 150 },
  { key: 'math_oper', label: 'Знак', always: true, width: 80 },
  { key: 'measurement', label: 'Ед. измерения', always: true, width: 150 },
];

const FILTER_FIELDS = [
  { key: 'date', label: 'Дата', type: 'date' },
  { key: 'title', label: 'Название', type: 'text' },
  { key: 'value', label: 'Значение', type: 'number' },
  { key: 'code', label: 'Код платежа', type: 'numbere' },
  { key: 'math_oper', label: 'Знак', type: 'select', multiple: true },
  { key: 'measurement', label: 'Ед. измерения', type: 'select', multiple: true },
];

function getInitialColumns() {
  return ALL_COLUMNS.map(col => col.key);
}

export default function Services() {
  const [isOpenCreate, setIsOpenCreate] = useState(false);
  const [isOpenUpdate, setIsOpenUpdate] = useState(false);
  const [isOpenView, setIsOpenView] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('id');
  const [filters, setFilters] = useState({ search: '', filterFields: [] });
  const [visibleColumns, setVisibleColumns] = useState(getInitialColumns);
  const [rememberColumns] = useState(true);
  const [columnPopover, setColumnPopover] = useState(null);
  const [filterPopover, setFilterPopover] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [popoverPosition, setPopoverPosition] = useState(null);
  const [popoverRow, setPopoverRow] = useState(null);
  const [cellFilterActive, setCellFilterActive] = useState(false);
  const [fieldFilters, setFieldFilters] = useState({});
  const [fieldFiltersDraft, setFieldFiltersDraft] = useState({});
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteInfo, setDeleteInfo] = useState(null);
  const [viewData, setViewData] = useState(null);

  const [updateData] = useUpdateServiceMutation();
  const [removeService] = useRemoveServiceMutation();
  const { data, isLoading, refetch } = useGetServiceQuery(
    `?sort[0]=${orderBy}:${order}`
  );

  const allRows = useMemo(() => (data?.data || []).map(row => ({
    ...row.attributes,
    id: row.id,
    date: row.attributes.date?.slice(0, 10) || '',
  })), [data]);

  // --- Фильтрация и поиск ---
  const filteredRows = useMemo(() => {
    let rows = allRows;
    Object.entries(fieldFilters).forEach(([key, value]) => {
      if (value && value.length) {
        if (key === 'date') {
          rows = rows.filter(row =>
            value.some(v => row[key]?.slice(0, 10) === v)
          );
        } else {
          rows = rows.filter(row =>
            value.some(v => String(row[key] || '').toLowerCase().includes(String(v).toLowerCase()))
          );
        }
      }
    });
    rows = [...rows].sort((a, b) => {
      const aValue = a[orderBy] || '';
      const bValue = b[orderBy] || '';
      if (order === 'asc') return String(aValue).localeCompare(String(bValue));
      return String(bValue).localeCompare(String(aValue));
    });
    return rows;
  }, [allRows, fieldFilters, order, orderBy]);

  // --- Хуки выделения и поиска ---
  const {
    selectedIds,
    setSelectedIds,
    isAllSelected,
    handleSelectAll,
    handleSelectRow,
  } = useTableSelection(filteredRows);

  const {
    selectedCell,
    setSelectedCell,
    selectedColumn,
    setSelectedColumn,
    selectedValue,
    setSelectedValue,
    handleCellClick,
  } = useTableCellSelection();

  const {
    searchMatches,
    searchIndex,
    setSearchIndex,
    handleSearchNext,
  } = useTableSearch(
    filteredRows,
    visibleColumns,
    filters.search
  );

  // --- Сброс выделения при смене фильтра/поиска ---
  useEffect(() => {
    setSelectedIds([]);
  }, [filters, setSelectedIds, visibleColumns]);

  // --- Сброс индекса поиска при смене поиска ---
  useEffect(() => {
    setSearchIndex(0);
  }, [filters.search, setSearchIndex]);

  // --- Скролл к найденному ---
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

  // --- CRUD ---
  const handleOpenEdit = () => {
    let row = filteredRows.find(r => r.id === selectedIds[0]);
    if (!row) row = allRows.find(r => r.id === selectedIds[0]);
    if (row) {
      setSelectedUser({ dataUser: row, idUser: row.id });
      setIsOpenUpdate(true);
    }
  };

  const handleOpenView = () => {
    let row = filteredRows.find(r => r.id === selectedIds[0]);
    if (!row) row = allRows.find(r => r.id === selectedIds[0]);
    if (row) {
      setViewData(row);
      setIsOpenView(true);
    }
  };

  const handleOpenAdd = () => setIsOpenCreate(true);

  // --- Popover для действий ---
  const handleRowMenu = (event, row) => {
    event.stopPropagation();
    setPopoverPosition({ top: event.clientY + 10, left: event.clientX - 120 });
    setPopoverRow(row);
  };

  const handleCloseRowMenu = () => {
    setPopoverPosition(null);
    setPopoverRow(null);
  };

  // --- Удаление ---
  const handleDeleteConfirm = async () => {
    if (deleteInfo) {
      try {
        await removeService(deleteInfo.id).unwrap();
        setSnackbar({ open: true, message: `Услуга "${deleteInfo.title}" удалена`, severity: 'success' });
        refetch();
      } catch {
        setSnackbar({ open: true, message: 'Ошибка при удалении', severity: 'error' });
      }
      setDeleteDialog(false);
      setDeleteInfo(null);
      setSelectedIds([]);
    }
  };
  const handleDeleteCancel = () => {
    setDeleteDialog(false);
    setDeleteInfo(null);
  };

  // --- Фильтр по ячейке ---
  const handleFilterIconClick = (e) => {
    if (selectedColumn && selectedValue !== null && !cellFilterActive) {
      setFilters((prev) => ({
        ...prev,
        filterFields: [{ key: selectedColumn, value: selectedValue }]
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
    const normalized = {};
    Object.entries(draft).forEach(([key, val]) => {
      normalized[key] = Array.isArray(val) ? val : [val];
    });
    setFieldFiltersDraft(normalized);
    setFilters((prev) => ({
      ...prev,
      filterFields: Object.keys(normalized),
    }));
    setFieldFilters(normalized);
    setCellFilterActive(false);
    setFilterPopover(null);
  };

  const handleResetFilters = () => {
    setFieldFiltersDraft({});
    setFilters((prev) => ({ ...prev, filterFields: [] }));
    setFieldFilters({});
    setCellFilterActive(false);
    setFilterPopover(null);
  };

  // --- Сохранение видимых колонок ---
  useEffect(() => {
    if (rememberColumns) {
      localStorage.setItem(COLUMN_KEY, JSON.stringify(visibleColumns));
    }
  }, [visibleColumns, rememberColumns]);

  return (
    <Box sx={{ mt: 0, background: '#f6f7f9', minHeight: '100vh', pb: 0 }}>
      <Typography variant="h4" ml={1} mb={2} mt={2} gutterBottom sx={{ color: '#444' }}>
        Виды услуг
      </Typography>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mb: 2,
          ml: 1,
          flexWrap: 'wrap',
        }}
      >
        <SearchInput
          value={typeof filters.search === 'string' ? filters.search : ''}
          onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
          onClear={() => setFilters(f => ({ ...f, search: '' }))}
          onSearchNext={handleSearchNext}
          searchIndex={searchMatches.length ? searchIndex : 0}
          searchCount={searchMatches.length}
          placeholder="Поиск"
        />
        <RefreshButton onClick={refetch} loading={isLoading} />
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
            if (f.key === 'math_oper') {
              const options = [...new Set(allRows.map(r => r.math_oper).filter(Boolean))];
              return {
                ...f,
                type: 'select',
                options, // теперь это массив строк
              };
            }
            if (f.key === 'measurement') {
              const options = [...new Set(allRows.map(r => r.measurement).filter(Boolean))];
              return {
                ...f,
                type: 'select',
                options, // теперь это массив строк
              };
            }
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
            onClick={e => setColumnPopover(e.currentTarget)}
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
          onClose={() => setColumnPopover(null)}
          columns={ALL_COLUMNS}
          visibleColumns={visibleColumns}
          onColumnChange={setVisibleColumns}
          rememberColumns={rememberColumns}
          onRememberColumnsChange={() => { }}
        />
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 0, ml: 1 }}>
        <ActionButtons
          onAdd={handleOpenAdd}
          onView={handleOpenView}
          onEdit={handleOpenEdit}
          onDelete={() => {
            const id = selectedIds[0];
            const row = allRows.find(r => String(r.id) === String(id));
            setDeleteInfo(row);
            setDeleteDialog(true);
          }}
          canView={selectedIds.length === 1}
          canEdit={selectedIds.length === 1}
          canDelete={selectedIds.length > 0}
        />
      </Box>

      <Card sx={{ background: '#fafbfc', borderRadius: 3, boxShadow: '0 2px 8px #e0e0e0' }}>
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
            {isLoading ? (
              <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '20px' }}>
                <Loading />
              </div>
            ) : (
              <TableVirtuoso
                ref={virtuosoRef}
                data={filteredRows}
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
                    {ALL_COLUMNS.filter(col => visibleColumns.includes(col.key)).map(col => (
                      <Tooltip key={col.key} title={col.tooltip || ''} arrow>
                        <TableCell
                          align={col.align || 'left'}
                          sortDirection={orderBy === col.key ? order : false}
                          sx={{
                            background: '#f4f5f7',
                            color: '#444',
                            fontWeight: 600,
                            fontSize: 15,
                            width: col.width,
                            minWidth: col.width,
                            maxWidth: col.width,
                            cursor: col.key !== 'action' ? 'pointer' : undefined,
                            transition: 'border 0.2s'
                          }}
                          onClick={col.key !== 'action' ? () => {
                            setOrderBy(col.key);
                            setOrder(orderBy === col.key && order === 'asc' ? 'desc' : 'asc');
                          } : undefined}
                        >
                          <TableSortLabel
                            active={orderBy === col.key}
                            direction={orderBy === col.key ? order : 'asc'}
                            sx={{ color: '#616161', '&.Mui-active': { color: '#616161' } }}
                          >
                            {col.label}
                          </TableSortLabel>
                        </TableCell>
                      </Tooltip>
                    ))}
                    <TableCell sx={{ width: 60, background: '#f4f5f7' }} />
                  </TableRow>
                )}
                itemContent={(index, row) => (
                  <>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedIds.includes(row.id)}
                        onChange={() => handleSelectRow(row.id)}
                        color="primary"
                        onClick={e => e.stopPropagation()}
                      />
                    </TableCell>
                    {ALL_COLUMNS.filter(col => visibleColumns.includes(col.key)).map(col => (
                      <TableCell
                        key={col.key}
                        onClick={e => {
                          if (e.detail === 2) {
                            setViewData(row);
                            setIsOpenView(true);
                          } else {
                            handleCellClick(row, col.key, e);
                          }
                        }}
                        sx={{
                          cursor: col.key !== 'id' ? 'pointer' : undefined,
                          background: selectedCell.rowId === row.id && selectedCell.col === col.key ? '#e3f2fd' : undefined,
                          fontWeight: selectedCell.rowId === row.id && selectedCell.col === col.key ? 700 : undefined,
                        }}
                      >
                        {filters.search && row[col.key]
                          ? highlight(row[col.key], filters.search)
                          : row[col.key]}
                      </TableCell>
                    ))}
                    <TableCell align="center" sx={{ padding: 0 }}>
                      <IconButton
                        onClick={e => handleRowMenu(e, row)}
                      >
                        <Iconify icon="eva:more-vertical-fill" />
                      </IconButton>
                    </TableCell>
                  </>
                )}
                components={{
                  Table: (props) => <Table {...props} stickyHeader />,
                  TableRow,
                  TableCell,
                }}
                style={{ height: '100%' }}
              />
            )}
          </TableContainer>
          {!isLoading && <Box sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            mt: 1,
            pr: 2
          }}>
            <Typography sx={{ fontWeight: 700, fontSize: 16 }}>
              Всего: {filteredRows.length}
            </Typography>
          </Box>}
        </CardContent>
      </Card>
      <Popover
        open={!!popoverPosition}
        anchorReference="anchorPosition"
        anchorPosition={popoverPosition}
        onClose={handleCloseRowMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{ sx: { width: 160 } }}
      >
        <Button
          fullWidth
          onClick={() => {
            handleCloseRowMenu();
            setViewData(popoverRow);
            setIsOpenView(true);
          }}
          startIcon={<Iconify icon="eva:eye-outline" />}
        >
          Посмотреть
        </Button>
        <Button
          fullWidth
          onClick={() => {
            handleCloseRowMenu();
            setSelectedUser({ dataUser: popoverRow, idUser: popoverRow?.id });
            setIsOpenUpdate(true);
          }}
          startIcon={<Iconify icon="eva:edit-fill" />}
        >
          Изменить
        </Button>
        <Button
          fullWidth
          color="error"
          onClick={() => {
            handleCloseRowMenu();
            setDeleteInfo(popoverRow);
            setDeleteDialog(true);
          }}
          startIcon={<Iconify icon="eva:trash-2-outline" />}
        >
          Удалить
        </Button>
      </Popover>
      <ModalUi open={isOpenUpdate} setOpen={setIsOpenUpdate}>
        <Update
          selectedUser={selectedUser}
          setOpen={setIsOpenUpdate}
          setSelectedUser={setSelectedUser}
          updateData={updateData}
          setSnackbarOpen={open => setSnackbar(s => ({ ...s, open }))}
          snackbarOpen={snackbar.open}
          setSnackbarMessage={msg => setSnackbar(s => ({ ...s, message: msg }))}
          snackbarMessage={snackbar.message}
        />
      </ModalUi>
      <ModalUi open={isOpenCreate} setOpen={setIsOpenCreate}>
        <Create
          open={isOpenCreate}
          setOpen={setIsOpenCreate}
          setSnackbarOpen={open => setSnackbar(s => ({ ...s, open }))}
          setSnackbarMessage={msg => setSnackbar(s => ({ ...s, message: msg }))}
          snackbarOpen={snackbar.open}
          snackbarMessage={snackbar.message}
        />
      </ModalUi>
      {/* Модалка просмотра услуги */}
      <ModalUi open={isOpenView} setOpen={setIsOpenView}>
        <Box p={3} minWidth={350} maxWidth={500}>
          <Typography variant="h6" mb={2} align="center" fontWeight={700}>
            Просмотр услуги
          </Typography>
          <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2} mb={2}>
            {ALL_COLUMNS.map(col => (
              <TextField
                key={col.key}
                label={col.label}
                name={col.key}
                value={viewData?.[col.key] || ''}
                fullWidth
                disabled
              />
            ))}
          </Box>
          <Box display="flex" gap={2} mt={2} justifyContent="flex-end">
            <Button onClick={() => setIsOpenView(false)} sx={{ background: '#e57373', color: '#fff', '&:hover': { background: '#b71c1c' } }}>
              Закрыть
            </Button>
          </Box>
        </Box>
      </ModalUi>
      <ModalUi open={deleteDialog} setOpen={setDeleteDialog}>
        <Box p={3}>
          <Typography variant="h6" mb={2}>Удалить услугу?</Typography>
          <Typography mb={3}>{deleteInfo?.title}</Typography>
          <Box display="flex" gap={2} justifyContent="flex-end">
            <Button onClick={handleDeleteCancel}>Отмена</Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained">
              Удалить
            </Button>
          </Box>
        </Box>
      </ModalUi>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        message={snackbar.message}
      />
    </Box>
  );
}
