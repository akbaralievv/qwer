/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-nested-ternary */
import { Icon } from '@iconify/react';
import { TableVirtuoso } from 'react-virtuoso';
import React, { useRef, useMemo, useState, useEffect } from 'react';

import TableSortLabel from '@mui/material/TableSortLabel';
import {
  Box,
  Card,
  Table,
  Paper,
  Alert,
  Tooltip,
  TableRow,
  Checkbox,
  Snackbar,
  TableCell,
  Typography,
  IconButton,
  CardContent,
  TableContainer,
  CircularProgress,
} from '@mui/material';

import { useTableSearch, useTableSelection, useTableCellSelection } from 'src/hooks/use-table-selections';

import { convertToRuFormat } from 'src/utils/convernRuFormat';

import SyncPopover from 'src/shared/SyncPopover';
import SearchInput from 'src/shared/SearchInput';
import PeriodPicker from 'src/shared/PeriodPicker';
import RefreshButton from 'src/shared/RefreshButton';
import FilterPopover from 'src/shared/FilterPopover';
import ActionButtons from 'src/shared/ActionButtons';
import { highlight } from 'src/shared/SharedFunctions';
import { useGetPaymentQuery } from 'src/store/api/payment';
import ActionMenuPopover from 'src/shared/ActionMenuPopover';
import { useSyncPaymentMutation } from 'src/store/api/paymentSync';
import ColumnSettingsPopover from 'src/shared/ColumnSettigsPopover';
import { useGetContragentsQuery } from 'src/store/api/contragentAPI';

import ModalDelete from '../ModalDelete';
import { FILTER_FIELDS } from '../constants';
import PaymentViewModal from '../PaymentViewModal';
import PaymentEditAddModal from '../PaymentEditAddModal';
import { filterRows, stableSort, formatDateKg, getDateString, getTodayRange, getComparator } from '../utils';

const FILTER_KEY = 'payment_date_filter';
const COLUMN_KEY = 'payment_column_settings';

const ALL_COLUMNS = [
  { key: 'payment_id', label: 'ID', always: true, tooltip: 'ID Платежа', width: 80 },
  { key: 'paid_at', label: 'Дата оплаты', always: true, width: 100 },
  { key: 'amount', label: 'Сумма оплаты', always: true, width: 120 },
  { key: 'contragent', label: 'Контрагент', always: true, width: 210 },
  { key: 'contragent_ls', label: 'Лицевой счет', width: 100 },
  { key: 'inn', label: 'ИНН контрагента', width: 150 },
  { key: 'desc', label: 'Агрегатор', width: 170 },
  { key: 'payment_purpose', label: 'Назначение платежа', width: 140 },
  { key: 'source', label: 'Источник', width: 120 },
  { key: 'autor', label: 'Автор', width: 110 },
];

// --- Вспомогательная функция для диапазона дат с временем ---
function getDayRange(dateStr) {
  return {
    from: `${dateStr}T00:00:00.000Z`,
    to: `${dateStr}T23:59:59.999Z`,
  };
}

export default function PaymentPage() {
  const { startOfDay, endOfDay } = getTodayRange();

  // --- Настройки колонок ---
  const getInitialColumns = () => {
    const saved = localStorage.getItem(COLUMN_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return ALL_COLUMNS.map(col =>
          col.always ? col.key : (parsed.includes(col.key) ? col.key : null)
        ).filter(Boolean);
      } catch {
        return ALL_COLUMNS.map(col => col.key);
      }
    }
    return ALL_COLUMNS.map(col => col.key);
  };

  const [visibleColumns, setVisibleColumns] = useState(getInitialColumns);
  const [columnPopover, setColumnPopover] = useState(null);
  const [rememberColumns, setRememberColumns] = useState(!!localStorage.getItem(COLUMN_KEY));
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [refreshing, setRefreshing] = useState(false);

  // --- Фильтры ---
  const getInitialFilters = () => {
    const saved = localStorage.getItem(FILTER_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          periodFrom: parsed.periodFrom ?? startOfDay,
          periodTo: parsed.periodTo ?? endOfDay,
          search: parsed.search ?? '',
          filterFields: Array.isArray(parsed.filterFields) ? parsed.filterFields : [],
          syncFrom: parsed.syncFrom ?? startOfDay,
          syncTo: parsed.syncTo ?? endOfDay,
        };
      } catch {
        return { periodFrom: startOfDay, periodTo: endOfDay, search: '', filterFields: [], syncFrom: startOfDay, syncTo: endOfDay };
      }
    }
    return { periodFrom: startOfDay, periodTo: endOfDay, search: '', filterFields: [], syncFrom: startOfDay, syncTo: endOfDay };
  };

  const [filters, setFilters] = useState(getInitialFilters);
  const [fieldFilters, setFieldFilters] = useState({});
  const [cellFilterActive, setCellFilterActive] = useState(false);

  // --- Состояния для фильтра ---
  const [fieldFiltersDraft, setFieldFiltersDraft] = useState(fieldFilters);

  // --- Выделение ячеек/колонок ---
  const {
    selectedCell,
    setSelectedCell,
    selectedColumn,
    setSelectedColumn,
    selectedValue,
    setSelectedValue,
    handleCellClick,
    resetCellSelection,
  } = useTableCellSelection();

  // --- Сброс выделения ячейки при смене фильтра/периода/поиска ---
  useEffect(() => {
    setSelectedValue(null);
  }, [filters.periodFrom, filters.periodTo, filters.filterFields, setSelectedValue]);

  useEffect(() => {
    if (rememberColumns) {
      localStorage.setItem(COLUMN_KEY, JSON.stringify(visibleColumns));
    }
  }, [visibleColumns, rememberColumns]);

  // --- Корректный диапазон дат для paid_at ---
  let paidAtFrom = filters.periodFrom;
  let paidAtTo = filters.periodTo;
  if (filters.periodFrom === filters.periodTo) {
    const range = getDayRange(filters.periodFrom);
    paidAtFrom = range.from;
    paidAtTo = range.to;
  }

  // --- Данные с бэка ---
  const { data: paymentData, isLoading, refetch } = useGetPaymentQuery(
    `?filters[paid_at][$gte]=${paidAtFrom}&filters[paid_at][$lte]=${paidAtTo}&populate=contragent,autor&pagination[limit]=-1&sort[0]=paid_at:desc`,
    { refetchOnMountOrArgChange: true }
  );

  const [syncPayment, { isLoading: isSycing }] = useSyncPaymentMutation();

  // Преобразование данных из бэка в формат rows
  const rows = paymentData?.data.map((item) => ({
    id: item.id,
    payment_id: item.attributes.payment_id,
    source: item.attributes.source,
    amount: item.attributes.amount,
    desc: item.attributes.desc,
    payment_purpose: item.attributes.payment_purpose,
    // Новый ИНН контрагента
    inn: item.attributes.contragent?.data?.attributes?.inn || '',
    paid_at: item.attributes.paid_at,
    contragent: item.attributes.contragent?.data?.attributes?.name || 'Нет данных',
    contragent_ls: item.attributes.contragent?.data?.attributes?.ls || 'Нет данных',
    autor: item.attributes.autor?.data?.attributes
      ? item.attributes.autor.data.attributes.usersurname
        ? `${item.attributes.autor.data.attributes.usersurname[0]}. ${item.attributes.autor.data.attributes.username}`
        : item.attributes.autor.data.attributes.username || 'нет данных'
      : '------',
  })) || [];

  // Мемоизация фильтров
  const contragents = useMemo(
    () => Array.from(new Set(rows.map(r => r.contragent).filter(Boolean))),
    [rows]
  );
  const aggregators = useMemo(
    () => Array.from(new Set(rows.map(r => r.desc).filter(Boolean))),
    [rows]
  );
  const purposes = useMemo(
    () => Array.from(new Set(rows.map(r => r.payment_purpose).filter(Boolean))),
    [rows]
  );
  const sources = useMemo(
    () => Array.from(new Set(rows.map(r => r.source).filter(Boolean))),
    [rows]
  );
  const inns = useMemo(
    () => Array.from(new Set(rows.map(r => r.inn).filter(Boolean))),
    [rows]
  );

  // --- Поиск ---
  const handleSearchChange = (e) => {
    setFilters((prev) => ({ ...prev, search: e.target.value }));
  };

  // --- Период и синхронизация ---
  const [filterPopover, setFilterPopover] = useState(null);
  const [syncPopover, setSyncPopover] = useState(null);

  const handleSyncChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // --- Меню действий ---
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [actionMenuPosition, setActionMenuPosition] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  // --- Модальные окна ---
  const [openViewModal, setOpenViewModal] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteInfo, setDeleteInfo] = useState(null);

  // --- CRUD ---
  const openEditModal = (row) => {
    let data = row;
    console.log('first', row, selectedIds, selectedRow);

    if (!data && selectedRow) {
      data = selectedRow;
    }
    if (!data && selectedIds.length === 1) {
      data = rows.find(r => r.id === selectedIds[0]);
    }
    if (!data) return;

    const found = contragentOptions.find(opt => opt.label === data.contragent);

    // Нормализуем дату
    let { paid_at } = data;
    if (paid_at && paid_at.includes('T')) {
      paid_at = paid_at.split('T')[0];
    }

    setEditAddMode('edit');
    setFormData({
      ...data,
      paid_at,
      contragent: found ? found.value : '',
      contragentName: data.contragent || '',
      inn: data.inn || found?.inn || '',
    });
    setOpenEditAddModal(true);
  };

  // --- Просмотр ---
  const handleViewClick = (row) => {
    let data = row;
    if (!data && selectedRow) {
      data = selectedRow;
    }
    if (!data && selectedIds.length === 1) {
      data = rows.find(r => r.id === selectedIds[0]);
    }
    if (data) {
      setViewData(data);
      setOpenViewModal(true);
    }
  };
  const handleViewClose = () => {
    setOpenViewModal(false);
    setViewData(null);
    resetCellSelection();
  };

  // --- Синхронизация ---
  const handleSync = async () => {
    try {
      await syncPayment({
        date_from: filters.syncFrom,
        date_to: filters.syncTo,
      }).unwrap();
      setSnackbar({
        open: true,
        message: `Синхронизация завершена за период ${formatDateKg(filters.syncFrom)} — ${formatDateKg(filters.syncTo)}`,
        severity: 'success',
      });
      setSyncPopover(null);
    } catch (e) {
      setSnackbar({
        open: true,
        message: 'Ошибка синхронизации',
        severity: 'error',
      });
      setSyncPopover(null);
    }
  };

  // --- Удаление ---
  const handleDeleteRow = () => {
    setDeleteDialog(true);
    setDeleteInfo(selectedRow);
  };
  const handleDeleteConfirm = () => {
    setSnackbar({ open: true, message: `Документ "${deleteInfo?.payment_id}" удалён`, severity: 'success' });
    setDeleteDialog(false);
    setDeleteInfo(null);
    setSelectedRow(null);
  };
  const handleDeleteCancel = () => {
    setDeleteDialog(false);
    setDeleteInfo(null);
  };

  // --- Колонки (настройки) ---
  const handleColumnPopover = (event) => setColumnPopover(event.currentTarget);
  const handleColumnPopoverClose = () => setColumnPopover(null);
  const handleColumnChange = (key) => {
    setVisibleColumns((prev) => {
      if (ALL_COLUMNS.find(c => c.key === key && c.always)) return prev;
      return prev.includes(key)
        ? prev.filter(k => k !== key)
        : [...prev, key];
    });
  };

  // --- Выделение и фильтрация по колонке и значению ---
  const handleColumnHeaderClick = (col, event) => {
    event.stopPropagation();
    setSelectedColumn(col.key === selectedColumn ? null : col.key);
    setSelectedValue(null);
    setFilters((prev) => ({
      ...prev,
      filterFields: col.key === selectedColumn ? [] : [col.key],
    }));
  };

  // --- Таблица ---
  const headTable = ALL_COLUMNS
    .filter(col => visibleColumns.includes(col.key))
    .map(col => ({
      id: col.key,
      label: col.label,
      align: col.align || 'left',
      tooltip: col.tooltip,
      width: col.width, // <-- добавь это
    }))
    .concat([{ id: 'action', label: '', align: 'right', width: 50 }]);

  // --- Поиск по всем данным ---
  const searchedRows = rows;
  const filteredRows = filterRows(searchedRows, filters, fieldFilters);

  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('paid_at');
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // --- Выделение строк ---
  const {
    selectedIds,
    isAllSelected,
    handleSelectAll,
    handleSelectRow,
  } = useTableSelection(filteredRows);

  // --- Поиск по таблице ---
  const {
    searchMatches,
    searchIndex,
    setSearchIndex,
    handleSearchNext,
  } = useTableSearch(
    stableSort(filteredRows, getComparator(order, orderBy)),
    headTable.map(h => h.id),
    filters.search
  );

  // --- Обновление с индикатором ---
  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
    setSnackbar({ open: true, message: 'Данные обновлены', severity: 'info' });
  };

  // --- Клик по иконке фильтра ---
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

  // --- Применить фильтры ---
  const handleApplyFilters = (draft) => {
    setFieldFiltersDraft(draft);
    setFilters((prev) => ({
      ...prev,
      filterFields: Object.keys(draft)
    }));
    setFieldFilters(draft);
    setCellFilterActive(false);
    setFilterPopover(null);
  };

  // --- Отключить фильтры ---
  const handleResetFilters = () => {
    setFieldFiltersDraft({});
    setFilters((prev) => ({ ...prev, filterFields: [] }));
    setFieldFilters({});
    setCellFilterActive(false);
    setFilterPopover(null);
  };

  // --- Состояния для универсальной модалки ---
  const [openEditAddModal, setOpenEditAddModal] = useState(false);
  const [editAddMode, setEditAddMode] = useState('add'); // 'add' | 'edit'
  const [formData, setFormData] = useState({
    payment_id: '',
    source: '',
    amount: '',
    desc: '',
    payment_purpose: '',
    aggregator_inn: '',
    paid_at: getDateString(new Date()),
    contragent: '',
    contragentName: '', // <-- добавить!
    autor: '',
  });

  const handleOpenAdd = () => {
    setEditAddMode('add');
    setFormData({
      payment_id: '',
      source: '',
      amount: '',
      desc: '',
      payment_purpose: '',
      aggregator_inn: '',
      paid_at: getDateString(new Date()),
      contragent: '',
      autor: '',
    });
    setOpenEditAddModal(true);
  };

  const handleCloseEditAdd = () => setOpenEditAddModal(false);

  const handleFormChange = (e, value) => {
    if (e && e.target) {
      // Для обычных полей
      setFormData(prev => ({
        ...prev,
        [e.target.name]: e.target.value,
        ...(e.target.name === 'contragent'
          ? {
            contragentName: contragentOptions.find(opt => opt.value === e.target.value)?.label || ''
          }
          : {}),
      }));
    } else if (value) {
      // Для выбора из Autocomplete
      setFormData(prev => ({
        ...prev,
        contragent: value.value,
        contragentName: value.label,
        inn: value.inn,
      }));
    }
  };

  const handleFormSave = () => {
    setSnackbar({ open: true, message: editAddMode === 'add' ? 'Документ успешно добавлен' : 'Документ успешно изменён', severity: 'success' });
    setOpenEditAddModal(false);
  };

  const { data: contragentsData, isLoading: isContragentsLoading } = useGetContragentsQuery('?pagination[limit]=-1');
  const contragentOptions = useMemo(() =>
    contragentsData?.data?.map(item => ({
      label: item.attributes.name,
      value: item.id,
      inn: item.attributes.inn,
    })) || [],
    [contragentsData]
  );

  // Найти индексы совпадений по поиску
  const sortedRows = stableSort(filteredRows, getComparator(order, orderBy));

  // Сбросить индекс при смене поиска
  useEffect(() => {
    setSearchIndex(0);
  }, [filters.search]);

  // Обработчик перехода к следующему совпадению

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

  return (
    <Box sx={{ mt: 0, background: '#f6f7f9', minHeight: '100vh', pb: 2 }}>
      <Typography variant="h4" ml={1} mb={2} mt={2} gutterBottom sx={{ color: '#444' }}>
        Платежи
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
        <PeriodPicker
          value={{ periodFrom: filters.periodFrom, periodTo: filters.periodTo }}
          onChange={({ periodFrom, periodTo }) =>
            setFilters(prev => ({ ...prev, periodFrom, periodTo }))
          }
          minDate={null}
          maxDate={getDateString(new Date())}
          disabled={false}
          storageKey={FILTER_KEY}
        />
        <SearchInput
          value={filters.search}
          onChange={handleSearchChange}
          onClear={() => setFilters((prev) => ({ ...prev, search: '' }))}
          onSearchNext={handleSearchNext}
          searchIndex={searchMatches.length ? searchIndex : 0}
          searchCount={searchMatches.length}
        />
        {/* Обновить */}
        <RefreshButton onClick={handleRefresh} loading={refreshing} />
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
            <Icon icon="ic:round-filter-list" width={22} height={22} color="#616161" />
          </IconButton>
        </Tooltip>
        <FilterPopover
          open={Boolean(filterPopover)}
          anchorEl={filterPopover}
          onClose={() => setFilterPopover(null)}
          fields={FILTER_FIELDS.map(f => {
            if (f.key === 'contragent') return { ...f, options: contragents };
            if (f.key === 'desc') return { ...f, options: aggregators };
            if (f.key === 'source') return { ...f, options: sources };
            if (f.key === 'payment_purpose') return { ...f, options: purposes };
            if (f.key === 'inn') return { ...f, options: inns };
            return f;
          })}
          values={fieldFiltersDraft}
          onChange={setFieldFiltersDraft}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
          active={filters.filterFields.length > 0 || cellFilterActive}
        />
        {/* Синхронизация */}
        <Tooltip title="Синхронизировать" arrow>
          <IconButton
            onClick={e => setSyncPopover(e.currentTarget)}
            sx={{
              background: '#ededed',
              color: '#1976d2',
              borderRadius: 2,
              height: 44,
              width: 44,
              '&:hover': { background: '#e3f2fd', color: '#0d47a1' }
            }}
          >
            {/* Иконка синхронизации */}
            <Icon icon="ic:round-sync" width={22} height={22} color="#1976d2" />
          </IconButton>
        </Tooltip>
        {/* Настройки колонок */}
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
            {/* Иконка шестерёнки */}
            <Icon icon="ic:round-settings" width={22} height={22} color="#616161" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Popover: синхронизация */}
      <SyncPopover
        open={Boolean(syncPopover)}
        anchorEl={syncPopover}
        onClose={() => setSyncPopover(null)}
        syncFrom={filters.syncFrom}
        syncTo={filters.syncTo}
        onChange={handleSyncChange}
        onSync={handleSync}
        isSyncing={isSycing}
        maxDate={getDateString(new Date())}
      />

      {/* Popover: настройки колонок */}
      <ColumnSettingsPopover
        open={Boolean(columnPopover)}
        anchorEl={columnPopover}
        onClose={handleColumnPopoverClose}
        columns={ALL_COLUMNS}
        visibleColumns={visibleColumns}
        onColumnChange={handleColumnChange}
        rememberColumns={rememberColumns}
        onRememberColumnsChange={setRememberColumns} // <-- вот так!
      />

      {/* Action-кнопки */}
      <Box sx={{ display: 'flex', gap: 2, mb: 0, ml: 1 }}>
        <ActionButtons
          onAdd={handleOpenAdd}
          onView={() => handleViewClick()}
          onEdit={() => openEditModal()}
          onDelete={() => {
            const row = rows.find(r => r.id === selectedIds[0]);
            setSelectedRow(row);
            setDeleteDialog(true);
            setDeleteInfo(row);
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
                <CircularProgress size={32} />
              </div>
            ) : (
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
                      <Tooltip key={headCell.id} title={headCell.tooltip || ''} arrow>
                        <TableCell
                          align={headCell.align || 'left'}
                          sortDirection={orderBy === headCell.id ? order : false}
                          sx={{
                            background: '#f4f5f7',
                            color: '#444',
                            fontWeight: 600,
                            fontSize: 15,
                            width: headCell.width, // <-- добавь это
                            minWidth: headCell.width,
                            maxWidth: headCell.width,
                            border: selectedColumn === headCell.id ? '2px solid #1976d2' : undefined,
                            cursor: headCell.id !== 'action' ? 'pointer' : undefined,
                            transition: 'border 0.2s'
                          }}
                          onClick={headCell.id !== 'action'
                            ? (e) => handleColumnHeaderClick(headCell, e)
                            : undefined}
                        >
                          {headCell.id !== 'action' ? (
                            <TableSortLabel
                              active={orderBy === headCell.id}
                              direction={orderBy === headCell.id ? order : 'asc'}
                              onClick={e => {
                                e.stopPropagation();
                                handleRequestSort(headCell.id);
                              }}
                              sx={{ maxWidth: '50px', color: '#616161', '&.Mui-active': { color: '#616161' } }}
                            >
                              {headCell.label}
                            </TableSortLabel>
                          ) : (
                            <> </>
                          )}
                        </TableCell>
                      </Tooltip>
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
                        onClick={e => e.stopPropagation()}
                      />
                    </TableCell>
                    {headTable.filter(h => h.id !== 'action').map((h) => (
                      <TableCell
                        key={h.id}
                        onDoubleClick={() => handleViewClick(row)}
                        onClick={e => { if (e.detail === 2) handleViewClick(row); else handleCellClick(row, h.id, e) }}
                        sx={{
                          cursor: h.id !== 'payment_id' && h.id !== 'action' ? 'pointer' : undefined,
                          background: selectedCell.rowId === row.id && selectedCell.col === h.id ? '#e3f2fd' : undefined,
                          fontWeight: selectedCell.rowId === row.id && selectedCell.col === h.id ? 700 : undefined,
                        }}
                      >
                        {filters.search && row[h.id]
                          ? highlight(
                            h.id === 'paid_at'
                              ? convertToRuFormat(row[h.id])
                              : row[h.id],
                            filters.search
                          )
                          : h.id === 'paid_at'
                            ? convertToRuFormat(row[h.id])
                            : row[h.id]}
                      </TableCell>
                    ))}
                    <TableCell align="right" width={50}>
                      <Tooltip title="Действия" arrow>
                        <IconButton
                          onClick={event => {
                            event.stopPropagation();
                            setActionMenuAnchor(event.currentTarget);
                            setActionMenuPosition({ top: event.clientY + 12, left: event.clientX + 10 });
                            setSelectedRow(row);
                          }}
                        >
                          <Icon icon="ic:round-more-vert" width={24} height={24} color="#888" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </>
                )}
                components={{
                  Table: (props) => (
                    <Table {...props} stickyHeader />
                  ),
                }}
                style={{ height: '100%' }}
              />
            )}
          </TableContainer>
          {/* Итоги в правом нижнем углу */}
          {!isLoading && <Box sx={{
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
          </Box>}
        </CardContent>
      </Card>

      {/* Popover для меню действий */}
      <ActionMenuPopover
        open={!!actionMenuAnchor}
        anchorEl={actionMenuAnchor}
        anchorPosition={actionMenuPosition}
        onClose={() => {
          setActionMenuAnchor(null);
          setActionMenuPosition(null);
        }}
        onView={handleViewClick}
        onEdit={openEditModal}
        onDelete={handleDeleteRow}
        selectedRow={selectedRow}
      />

      {/* Диалог подтверждения удаления */}
      <ModalDelete
        open={deleteDialog}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        deleteInfo={deleteInfo}
      />

      {/* Модальное окно для просмотра */}
      <PaymentViewModal
        open={openViewModal}
        onClose={handleViewClose}
        columns={ALL_COLUMNS}
        data={viewData}
      />

      {/* Модальное окно для добавления и редактирования */}
      <PaymentEditAddModal
        open={openEditAddModal}
        mode={editAddMode}
        formData={formData}
        onChange={handleFormChange}
        onSave={handleFormSave}
        onClose={handleCloseEditAdd}
        contragentOptions={contragentOptions}
        isContragentsLoading={isContragentsLoading}
      />

      {/* Snackbar уведомления */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

