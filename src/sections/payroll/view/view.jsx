/* eslint-disable no-nested-ternary */

import { TableVirtuoso } from 'react-virtuoso';
import React, { useRef, useMemo, useState, useEffect } from 'react';

import TableSortLabel from '@mui/material/TableSortLabel';
import {
  Box,
  Card,
  Table,
  Paper,
  Button,
  Tooltip,
  Popover,
  TableRow,
  Checkbox,
  Snackbar,
  MenuItem,
  TableCell,
  Typography,
  IconButton,
  CardContent,
  TableContainer,
} from '@mui/material';

import { useTableSearch, useTableSelection, useTableCellSelection } from 'src/hooks/use-table-selections';

import { convertToRuFormat } from 'src/utils/convernRuFormat';

import ModalUi from 'src/ui/ModalUi';
import SearchInput from 'src/shared/SearchInput';
import PeriodPicker from 'src/shared/PeriodPicker';
import RefreshButton from 'src/shared/RefreshButton';
import ActionButtons from 'src/shared/ActionButtons';
import FilterPopover from 'src/shared/FilterPopover';
import { highlight } from 'src/shared/SharedFunctions';
import ColumnSettingsPopover from 'src/shared/ColumnSettigsPopover';
import { useGetPayrollsQuery, useRemovePayrollMutation } from 'src/store/api/payrollAPI';

import Iconify from 'src/components/iconify';

import Create from '../Create';
import UpdatePayroll from '../Update';
import GroupCreate from '../GroupCreate';
import { FILTER_FIELDS } from '../constants';
import PayrollViewModal from '../PayrollViewModal';

const COLUMN_KEY = 'payroll_column_settings';
const FILTER_KEY = 'payroll_date_filter';

const ALL_COLUMNS = [
  { key: 'docDate', label: 'Дата документа', always: true, width: 120 },
  { key: 'periodFrom', label: 'Начало периода', always: true, width: 120 },
  { key: 'periodTo', label: 'Конец периода', always: true, width: 120 },
  { key: 'amount', label: 'Сумма', always: true, width: 100 },
  { key: 'contragent', label: 'Контрагент', always: true, width: 210 },
  // { key: 'division', label: 'Курс', width: 120 },
  // { key: 'subdiv_one', label: 'Факультет', width: 120 },
  { key: 'service', label: 'Услуга', width: 120 },
  { key: 'autor', label: 'Автор', width: 120 },
  { key: 'canceled', label: 'Активность', width: 100 },
  { key: 'comment', label: 'Комментарий', width: 150 },
];

function getTodayRange() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const today = `${yyyy}-${mm}-${dd}`;
  return { periodFrom: today, periodTo: today };
}

function getInitialFilters() {
  const saved = localStorage.getItem(FILTER_KEY);
  const { periodFrom, periodTo } = getTodayRange();
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return {
        periodFrom: parsed.periodFrom ?? periodFrom,
        periodTo: parsed.periodTo ?? periodTo,
        search: parsed.search ?? '',
        filterFields: Array.isArray(parsed.filterFields) ? parsed.filterFields : [],
      };
    } catch {
      return { periodFrom, periodTo, search: '', filterFields: [] };
    }
  }
  return { periodFrom, periodTo, search: '', filterFields: [] };
}

export default function PayrollPage() {
  // --- Колонки ---
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

  // --- Фильтры ---
  const [filters, setFilters] = useState(getInitialFilters);
  const [fieldFilters, setFieldFilters] = useState({});
  const [fieldFiltersDraft, setFieldFiltersDraft] = useState({});
  const [cellFilterActive, setCellFilterActive] = useState(false);

  // --- Состояния для таблицы и модалок ---
  const [isOpenAdd, setIsOpenAdd] = useState(false);
  const [isOpenUpdate, setIsOpenUpdate] = useState(false);
  const [isOpenGroupAdd, setIsOpenGroupAdd] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('docDate');
  const [popoverPosition, setPopoverPosition] = useState(null);
  const [popoverRow, setPopoverRow] = useState(null);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [removePayroll] = useRemovePayrollMutation();
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteInfo, setDeleteInfo] = useState(null);

  // --- Получение данных ---
  const { data: payrollData, isLoading, refetch } = useGetPayrollsQuery(
    `?filters[periodFrom][$lte]=${filters.periodTo}&filters[periodTo][$gte]=${filters.periodFrom}&populate=contragent,division,subdiv_one,service,autor`,
    { refetchOnMountOrArgChange: true }
  );

  // --- Преобразование данных ---
  const rows = useMemo(() =>
    payrollData?.data.map((item) => ({
      id: item.id,
      docDate: item.attributes.docDate,
      periodFrom: item.attributes.periodFrom,
      periodTo: item.attributes.periodTo,
      amount: item.attributes.amount,
      contragent: item.attributes.contragent?.data?.attributes?.name || null,
      division: item.attributes.division?.data?.attributes?.title || null,
      subdiv_one: item.attributes.subdiv_one?.data?.attributes?.title || null,
      service: item.attributes.service?.data?.attributes?.title || null,
      autor: item.attributes.autor?.data
        ? `${item.attributes.autor.data.attributes?.username || ''} ${item.attributes.autor.data.attributes?.usersurname || ''}`.trim()
        : null,
      canceled: item.attributes.canceled ? 'Нет' : 'Да',
      comment: item.attributes.comment || '----',
      // Для отображения в таблице и модалках:
      contragentObj: item.attributes.contragent?.data || null,
      divisionObj: item.attributes.division?.data || null,
      subdiv_oneObj: item.attributes.subdiv_one?.data || null,
      serviceObj: item.attributes.service?.data || null,
      autorObj: item.attributes.autor?.data || null,
    })) || [],
    [payrollData]
  );

  // --- Поиск и фильтрация ---
  const headTable = ALL_COLUMNS
    .filter(col => visibleColumns.includes(col.key))
    .map(col => ({
      id: col.key,
      label: col.label,
      align: col.align || 'left',
      tooltip: col.tooltip,
      width: col.width,
    }))
    .concat([{ id: 'action', label: '', align: 'right', width: 50 }]);

  // --- Фильтрация по выбранным фильтрам ---
  const filteredRows = useMemo(() => {
    if (!filters.filterFields.length || !Object.keys(fieldFilters).length) return rows;
    return rows.filter(row =>
      filters.filterFields.every(field =>
        fieldFilters[field]?.length
          ? fieldFilters[field].includes(row[field])
          : true
      )
    );
  }, [rows, filters.filterFields, fieldFilters]);

  // --- Сортировка ---
  const sortedRows = useMemo(() => {
    const sorted = [...filteredRows];
    sorted.sort((a, b) => {
      if (orderBy && a[orderBy] && b[orderBy]) {
        if (order === 'asc') return String(a[orderBy]).localeCompare(String(b[orderBy]));
        return String(b[orderBy]).localeCompare(String(a[orderBy]));
      }
      return 0;
    });
    return sorted;
  }, [filteredRows, order, orderBy]);

  // --- ВНЕДРЯЕМ ХУКИ ---
  const {
    selectedIds,
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
    sortedRows,
    headTable.map(h => h.id),
    filters.search
  );

  // --- Клик по заголовку для фильтрации ---
  const handleColumnHeaderClick = (col, event) => {
    event.stopPropagation();
    setSelectedColumn(col.key === selectedColumn ? null : col.key);
    setSelectedValue(null);
    setFilters((prev) => ({
      ...prev,
      filterFields: col.key === selectedColumn ? [] : [col.key],
    }));
  };

  // --- Клик по иконке фильтра ---
  const [filterPopover, setFilterPopover] = useState(null);
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
    // Преобразуем только для связанных сущностей
    const keysToNormalize = ['contragent', 'service', 'division', 'subdiv_one', 'autor'];
    const normalized = { ...draft };
    keysToNormalize.forEach(key => {
      if (Array.isArray(normalized[key]) && normalized[key].length > 0 && typeof normalized[key][0] === 'object') {
        normalized[key] = normalized[key].map(obj => obj.id);
      }
    });

    setFieldFiltersDraft(draft); // для отображения выбранных в UI
    setFilters((prev) => ({
      ...prev,
      filterFields: Object.keys(normalized)
    }));
    setFieldFilters(normalized); // для фильтрации — только id!
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

  useEffect(() => {
    if (rememberColumns) {
      localStorage.setItem(COLUMN_KEY, JSON.stringify(visibleColumns));
    }
  }, [visibleColumns, rememberColumns]);

  // --- Поиск: сброс индекса при смене поиска ---
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

  // --- Обновление ---
  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
    setSnackbarMessage('Данные обновлены');
    setSnackbarOpen(true);
  };

  // --- Меню действий ---
  const handleOpenMenu = (event, row) => {
    event.stopPropagation();
    setPopoverPosition({ top: event.clientY + 16, left: event.clientX - 130 });
    setPopoverRow(row);
  };
  const handleCloseMenu = () => {
    setPopoverPosition(null);
    setPopoverRow(null);
  };
  const handleEditClick = (row) => {
    let editRow = row;
    if (!editRow && selectedIds.length === 1) {
      editRow = rows.find(r => r.id === selectedIds[0]);
    }
    if (editRow) {
      setSelectedPayroll(editRow);
      setIsOpenUpdate(true);
    }
  };
  const handleViewClick = (row) => {
    let data = row;
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
    setSelectedCell({ rowId: null, col: null });
  };

  // --- Action-кнопки ---
  const handleAdd = () => setIsOpenAdd(true);
  const handleGroupAdd = () => setIsOpenGroupAdd(true);
  const handleDeleteConfirm = async () => {
    if (deleteInfo) {
      try {
        await removePayroll(deleteInfo.id).unwrap();
        setSnackbarMessage(`Документ "${deleteInfo.docDate}" удалён`);
        setSnackbarOpen(true);
        setDeleteDialog(false);
        setDeleteInfo(null);
        refetch();
      } catch {
        setSnackbarMessage('Ошибка при удалении');
        setSnackbarOpen(true);
      }
    }
  };

  // --- Snackbar ---
  const handleSnackbarClose = (_, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };
  // --- Собираем уникальные значения для селектов ---
  const faculties = useMemo(
    () => Array.from(
      new Set(
        rows.map(r => r.subdiv_oneObj?.attributes?.title).filter(Boolean)
      )
    ),
    [rows]
  );

  const divisions = useMemo(
    () => Array.from(
      new Set(
        rows.map(r => r.divisionObj?.attributes?.title).filter(Boolean)
      )
    ),
    [rows]
  );

  const services = useMemo(
    () => Array.from(
      new Set(
        rows.map(r => r.serviceObj?.attributes?.title).filter(Boolean)
      )
    ),
    [rows]
  );

  const autors = useMemo(
    () => Array.from(
      new Set(
        rows.map(r =>
          r.autorObj
            ? `${r.autorObj.attributes?.username || ''} ${r.autorObj.attributes?.usersurname || ''}`.trim()
            : ''
        ).filter(Boolean)
      )
    ),
    [rows]
  );

  // --- Сохраняем период в localStorage при изменении ---
  useEffect(() => {
    localStorage.setItem(FILTER_KEY, JSON.stringify(filters));
  }, [filters, filters.periodFrom, filters.periodTo]);

  return (
    <Box sx={{ mt: 0, background: '#f6f7f9', minHeight: '100vh', pb: 0 }}>
      <Typography variant="h4" ml={1} mb={2} mt={2} gutterBottom sx={{ color: '#444' }}>
        Начисления
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
          maxDate={null}
          disabled={false}
          storageKey="payroll_period"
        />
        <SearchInput
          value={filters.search}
          onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
          onClear={() => setFilters(prev => ({ ...prev, search: '' }))}
          onSearchNext={handleSearchNext}
          searchIndex={searchMatches.length ? searchIndex : 0}
          searchCount={searchMatches.length}
        />
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
          active={filters.filterFields?.length > 0 || cellFilterActive}
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
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 0, ml: 1 }}>
        <ActionButtons
          onAdd={handleAdd}
          showMassAdd
          onMassAdd={handleGroupAdd}
          onEdit={() => handleEditClick()}
          onView={() => handleViewClick()}
          onDelete={() => {
            const row = rows.find(r => r.id === selectedIds[0]);
            setDeleteDialog(true);
            setDeleteInfo(row);
          }}
          canView={selectedIds.length === 1}
          canEdit={selectedIds.length === 1}
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
            {isLoading ? (
              <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '20px' }}>
                Загрузка данных...
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
                            width: headCell.width,
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
                                setOrder(orderBy === headCell.id && order === 'asc' ? 'desc' : 'asc');
                                setOrderBy(headCell.id);
                              }}
                              sx={{ maxWidth: '50px', color: '#616161', '&.Mui-active': { color: '#616161' } }}
                            >
                              {headCell.label}
                            </TableSortLabel>
                          ) : (
                            <> </> // пустая ячейка для action
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
                          cursor: h.id !== 'id' && h.id !== 'action' ? 'pointer' : undefined,
                          background: selectedCell.rowId === row.id && selectedCell.col === h.id ? '#e3f2fd' : undefined,
                          fontWeight: selectedCell.rowId === row.id && selectedCell.col === h.id ? 700 : undefined,
                        }}
                      >
                        {(() => {
                          const value =
                            h.id === 'contragent'
                              ? row.contragentObj?.attributes?.name || 'Нет данных'
                              : h.id === 'division'
                                ? row.divisionObj?.attributes?.title || 'Нет данных'
                                : h.id === 'subdiv_one'
                                  ? row.subdiv_oneObj?.attributes?.title || 'Нет данных'
                                  : h.id === 'service'
                                    ? row.serviceObj?.attributes?.title || 'Нет данных'
                                    : h.id === 'autor'
                                      ? row.autorObj
                                        ? `${row.autorObj.attributes?.username || ''} ${row.autorObj.attributes?.usersurname || ''}`
                                        : 'Нет данных'
                                      : ['docDate', 'periodFrom', 'periodTo'].includes(h.id)
                                        ? convertToRuFormat(row[h.id])
                                        : row[h.id];

                          if (filters.search && typeof value === 'string') {
                            return highlight(value, filters.search);
                          }
                          return value;
                        })()}
                      </TableCell>
                    ))}
                    <TableCell align="right" width={50}>
                      <Tooltip title="Действия" arrow>
                        <IconButton
                          onClick={event => handleOpenMenu(event, row)}
                        >
                          <Iconify icon="eva:more-vertical-fill" width={24} height={24} color="#888" />
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
      <Popover
        open={!!popoverPosition}
        anchorReference="anchorPosition"
        anchorPosition={popoverPosition}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{
          sx: { width: 140 },
        }}
      >
        <MenuItem onClick={() => { handleEditClick(popoverRow); handleCloseMenu(); }}>
          <Iconify icon="eva:edit-fill" sx={{ mr: 2 }} />
          Изменить
        </MenuItem>
      </Popover>
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
      <ModalUi open={isOpenAdd} setOpen={setIsOpenAdd}>
        <Create
          setOpen={setIsOpenAdd}
          setSnackbarMessage={setSnackbarMessage}
          setSnackbarOpen={setSnackbarOpen}
        />
      </ModalUi>
      <ModalUi open={isOpenGroupAdd} setOpen={setIsOpenGroupAdd}>
        <GroupCreate setOpen={setIsOpenGroupAdd} />
      </ModalUi>
      <ModalUi open={isOpenUpdate} setOpen={setIsOpenUpdate}>
        {selectedPayroll && (
          <UpdatePayroll
            setOpen={setIsOpenUpdate}
            selectedRow={selectedPayroll}
            setSelectedPayroll={setSelectedPayroll}
            setSnackbarOpen={setSnackbarOpen}
            setSnackbarMessage={setSnackbarMessage}
          />
        )}
      </ModalUi>
      <PayrollViewModal
        open={openViewModal}
        columns={ALL_COLUMNS}
        onClose={handleViewClose}
        data={viewData}
      />
      <ModalUi open={deleteDialog} setOpen={setDeleteDialog}>
        <Box p={3}>
          <Typography variant="h6" mb={2}>Удалить начисление?</Typography>
          <Typography mb={3}>{deleteInfo?.docDate}</Typography>
          <Box display="flex" gap={2} justifyContent="flex-end">
            <Button onClick={() => setDeleteDialog(false)}>Отмена</Button>
            <Button
              onClick={handleDeleteConfirm}
              color="error"
              variant="contained"
            >
              Удалить
            </Button>
          </Box>
        </Box>
      </ModalUi>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        message={snackbarMessage}
        onClose={handleSnackbarClose}
      />
    </Box>
  );
}
