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
} from '@mui/material';

import {
  useTableSearch,
  useTableSelection,
  useTableCellSelection,
} from 'src/hooks/use-table-selections';

import ModalUi from 'src/ui/ModalUi';
import SearchInput from 'src/shared/SearchInput';
import PeriodPicker from 'src/shared/PeriodPicker';
import ActionButtons from 'src/shared/ActionButtons';
import FilterPopover from 'src/shared/FilterPopover';
import RefreshButton from 'src/shared/RefreshButton';
import { highlight } from 'src/shared/SharedFunctions';
import ColumnSettingsPopover from 'src/shared/ColumnSettigsPopover';
import { useGetOperationQuery, useRemoveOperationMutation } from 'src/store/api/orderForAdmissions';

import Iconify from 'src/components/iconify';

import ModalDelete from 'src/sections/moving/DeleteModal';
import { getDateString } from 'src/sections/payment/utils';
import UpdateOrderForAdmissions from 'src/sections/moving/Update';
import PDFViewerModal from 'src/sections/Reception/recedption/PDFViewer';

import Create from '../Create';
import ViewModal from '../ViewModal';
import { FILTER_FIELDS } from '../constants';
import ActionsPopover from '../ActionsPopover';

const COLUMN_KEY = 'deduction_column_settings';
const FILTER_KEY = 'deduction_period';

const ALL_COLUMNS = [
  { key: 'docNumber', label: '№', width: 70, always: true },
  { key: 'docDate', label: 'Дата', width: 120, always: true },
  { key: 'contragent', label: 'Контрагент', width: 180, always: true },
  // { key: 'subdiv_one', label: 'Факультет', width: 140 },
  // { key: 'division', label: 'Курс', width: 100 },
  { key: 'basedOn', label: 'На основании', width: 140 },
  { key: 'service', label: 'Вид услуг', width: 140 },
  { key: 'contract', label: 'Сумма', width: 110 },
  { key: 'price', label: 'Цена', width: 110 },
  { key: 'periodFrom', label: 'Начало', width: 120 },
  { key: 'periodTo', label: 'Конец', width: 120 },
  { key: 'autor', label: 'Автор', width: 120 },
];

const getInitialFilters = () => {
  const today = getDateString ? getDateString(new Date()) : new Date().toISOString().split('T')[0];
  const saved = localStorage.getItem(FILTER_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return {
        search: '',
        filterFields: [],
        periodFrom: parsed.periodFrom || today,
        periodTo: parsed.periodTo || today,
      };
    } catch {
      return {
        search: '',
        filterFields: [],
        periodFrom: today,
        periodTo: today,
      };
    }
  }
  return {
    search: '',
    filterFields: [],
    periodFrom: today,
    periodTo: today,
  };
};

export default function Deduction() {
  // --- Колонки (настройки) ---
  const getInitialColumns = () => {
    const saved = localStorage.getItem(COLUMN_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return ALL_COLUMNS.map((col) =>
          col.always ? col.key : parsed.includes(col.key) ? col.key : null
        ).filter(Boolean);
      } catch {
        return ALL_COLUMNS.map((col) => col.key);
      }
    }
    return ALL_COLUMNS.map((col) => col.key);
  };
  const [visibleColumns, setVisibleColumns] = useState(getInitialColumns);
  const [columnPopover, setColumnPopover] = useState(null);
  const [rememberColumns, setRememberColumns] = useState(!!localStorage.getItem(COLUMN_KEY));

  // --- Фильтры и поиск ---
  const [filters, setFilters] = useState(getInitialFilters);
  const [fieldFilters, setFieldFilters] = useState({});
  const [fieldFiltersDraft, setFieldFiltersDraft] = useState({});
  const [filterPopover, setFilterPopover] = useState(null);
  const [cellFilterActive, setCellFilterActive] = useState(false);

  // --- Сортировка ---
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('docDate');

  // --- CRUD и модалки ---
  const [openViewModal, setOpenViewModal] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteRows, setDeleteRows] = useState([]);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfModalData, setPdfModalData] = useState(null);
  // --- Snackbar ---
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // --- Данные ---
  const { data, isLoading, refetch } = useGetOperationQuery(
    `?filters[oper_type][id][$eq]=3` +
      `&filters[docDate][$gte]=${filters.periodFrom}` +
      `&filters[docDate][$lte]=${filters.periodTo}` +
      `&populate[0]=contragent&populate[1]=autor&populate[2]=division&populate[3]=subdiv_one&populate[4]=service` +
      `&sort[6]=${orderBy}:${order}&pagination[limit]=-1`
  );
  const [removeOperation] = useRemoveOperationMutation();

  // --- Преобразование данных ---
  const rows = useMemo(
    () =>
      (data?.data || []).map((row) => ({
        id: row.id,
        docNumber: row.attributes.docNumber,
        docDate: row.attributes.docDate,
        contragent: row.attributes.contragent?.data?.attributes?.name || 'Не указано',
        subdiv_one: row.attributes.subdiv_one?.data?.attributes?.title || '',
        division: row.attributes.division?.data?.attributes?.title || '',
        basedOn: row.attributes.basedOn || '',
        service: row.attributes.service?.data?.attributes?.title || '',
        contract: row.attributes.contract,
        price: row.attributes.price,
        periodFrom: row.attributes.periodFrom,
        periodTo: row.attributes.periodTo,
        autor: row.attributes.autor?.data?.attributes?.username || '',
      })),
    [data]
  );

  // --- Собираем уникальные значения для селектов ---
  const faculties = useMemo(
    () => Array.from(new Set(rows.map((r) => r.subdiv_one).filter(Boolean))),
    [rows]
  );
  const divisions = useMemo(
    () => Array.from(new Set(rows.map((r) => r.division).filter(Boolean))),
    [rows]
  );
  const services = useMemo(
    () => Array.from(new Set(rows.map((r) => r.service).filter(Boolean))),
    [rows]
  );
  const autors = useMemo(
    () => Array.from(new Set(rows.map((r) => r.autor).filter(Boolean))),
    [rows]
  );

  // --- Поиск и фильтрация ---
  const headTable = ALL_COLUMNS.filter((col) => visibleColumns.includes(col.key)).concat([
    { key: 'action', label: '', align: 'right', width: 50 },
  ]);
  const searchedRows = rows;

  // --- Фильтрация по фильтрам ---
  const filteredRows = useMemo(() => {
    if (!filters.filterFields.length || !Object.keys(fieldFilters).length) return searchedRows;
    return searchedRows.filter((row) =>
      filters.filterFields.every((field) =>
        fieldFilters[field]?.length ? fieldFilters[field].includes(row[field]) : true
      )
    );
  }, [searchedRows, filters.filterFields, fieldFilters]);

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

  // --- Хуки выделения и поиска ---
  const { selectedIds, isAllSelected, handleSelectAll, handleSelectRow } =
    useTableSelection(sortedRows);

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

  // --- Поиск по таблице ---
  const { searchMatches, searchIndex, setSearchIndex, handleSearchNext } = useTableSearch(
    sortedRows,
    headTable.map((h) => h.key),
    filters.search
  );

  // --- Колонки (popover) ---
  const handleColumnPopover = (event) => setColumnPopover(event.currentTarget);
  const handleColumnPopoverClose = () => setColumnPopover(null);
  const handleColumnChange = (key) => {
    setVisibleColumns((prev) => {
      if (ALL_COLUMNS.find((c) => c.key === key && c.always)) return prev;
      return prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
    });
  };

  useEffect(() => {
    if (rememberColumns) {
      localStorage.setItem(COLUMN_KEY, JSON.stringify(visibleColumns));
    }
  }, [visibleColumns, rememberColumns]);

  // --- Сортировка по колонке ---
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
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
      filterFields: Object.keys(draft),
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

  // --- Обновление ---
  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
    setSnackbar({ open: true, message: 'Данные обновлены', severity: 'info' });
  };

  // --- Поиск: сброс индекса при смене поиска ---
  useEffect(() => {
    setSearchIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search]);

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
  const handleOpenAdd = () => {
    setOpenAddModal(true);
  };
  const handleOpenEdit = (dataEdit) => {
    if (dataEdit?.idUser) {
      setEditData(dataEdit);
      setOpenEditModal(true);
    } else {
      const selected = sortedRows.find((r) => selectedIds.includes(r.id));
      if (selected) {
        const original = data?.data?.find((r) => r.id === selected.id);
        if (original) {
          setEditData({ idUser: original.id, dataUser: original.attributes });
          setOpenEditModal(true);
        }
      }
    }
  };
  const handleOpenDelete = () => {
    let ids = selectedIds;
    if (!ids.length && selectedCell.rowId) ids = [selectedCell.rowId];
    if (!ids.length && menuRow?.id) ids = [menuRow.id];
    if (!ids.length) {
      setSnackbar({
        open: true,
        message: 'Выберите строки или ячейку для удаления',
        severity: 'warning',
      });
      return;
    }
    // Найди строки по id для отображения в модалке
    const rowsToDelete = sortedRows.filter((r) => ids.includes(r.id));
    setDeleteRows(rowsToDelete);
    setDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await Promise.all(deleteRows.map((row) => removeOperation(row.id).unwrap()));
      setSnackbar({ open: true, message: 'Удалено успешно', severity: 'success' });
      setDeleteDialog(false);
      setDeleteRows([]);
      await refetch();
    } catch (e) {
      setSnackbar({ open: true, message: 'Ошибка при удалении', severity: 'error' });
      setDeleteDialog(false);
      setDeleteRows([]);
    }
  };

  const handleViewClick = (row) => {
    setViewData(row);
    setOpenViewModal(true);
  };
  const handleViewClose = () => {
    setOpenViewModal(false);
    setViewData(null);
    resetCellSelection();
  };

  // --- Меню действий ---
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [menuAnchorPosition, setMenuAnchorPosition] = useState(null);
  const [menuRow, setMenuRow] = useState(null);

  const handleMenuOpen = (event, row) => {
    event.stopPropagation();
    setMenuAnchorEl(null); // если хочешь только по координатам
    setMenuAnchorPosition({ top: event.clientY + 12, left: event.clientX + 10 });
    setMenuRow(row);
  };
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuAnchorPosition(null);
    setMenuRow(null);
  };
  const handleOpenPdfModal = (pdfData) => {
    setPdfModalData(pdfData);
    setPdfModalOpen(true);
  };
  const handleClosePdfModal = () => {
    setPdfModalOpen(false);
    setPdfModalData(null);
  };

  // Найти исходный объект из data.data по id menuRow
  const originalRow = useMemo(() => {
    if (!menuRow || !data?.data) return null;
    return data.data.find((r) => r.id === menuRow.id) || null;
  }, [menuRow, data]);

  return (
    <Box sx={{ mt: 0, background: '#f6f7f9', minHeight: '100vh', pb: 0 }}>
      <Typography variant="h4" ml={1} mb={2} mt={2} gutterBottom sx={{ color: '#444' }}>
        Прекращенные договора
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, ml: 1, flexWrap: 'wrap' }}>
        <PeriodPicker
          value={{ periodFrom: filters.periodFrom, periodTo: filters.periodTo }}
          onChange={({ periodFrom, periodTo }) =>
            setFilters((prev) => ({ ...prev, periodFrom, periodTo }))
          }
          minDate={null}
          maxDate={getDateString ? getDateString(new Date()) : undefined}
          disabled={false}
          storageKey={FILTER_KEY}
        />
        <SearchInput
          value={filters.search}
          onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
          onClear={() => setFilters((prev) => ({ ...prev, search: '' }))}
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
              background:
                filters.filterFields.length > 0 || cellFilterActive ? '#fffde7' : '#ededed',
              border:
                filters.filterFields.length > 0 || cellFilterActive
                  ? '1.5px solid #fbc02d'
                  : 'none',
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
          fields={FILTER_FIELDS.map((f) => {
            if (f.key === 'subdiv_one') return { ...f, options: faculties };
            if (f.key === 'division') return { ...f, options: divisions };
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
              '&:hover': { background: '#e0e0e0', color: '#222' },
            }}
          >
            <Icon icon="ic:round-settings" width={22} height={22} color="#616161" />
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
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 0, ml: 1 }}>
        <ActionButtons
          onAdd={handleOpenAdd}
          onView={() => handleViewClick(sortedRows?.find((r) => selectedIds.includes(r.id)))}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
          canView={selectedIds.length === 1}
          canEdit={selectedIds.length === 1}
          canDelete={selectedIds.length > 0}
          pageType="deduction"
          onViewPdf={handleOpenPdfModal}
          row={data?.data?.find((r) => selectedIds.includes(r.id))?.attributes}
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
              background: '#fafbfc',
            }}
          >
            {isLoading ? (
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  padding: '20px',
                }}
              >
                Загрузка...
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
                      <Tooltip key={headCell.key} title={headCell.label} arrow>
                        <TableCell
                          align={headCell.align || 'left'}
                          sortDirection={orderBy === headCell.key ? order : false}
                          sx={{
                            background: '#f4f5f7',
                            color: '#444',
                            fontWeight: 600,
                            fontSize: 15,
                            width: headCell.width,
                            minWidth: headCell.width,
                            maxWidth: headCell.width,
                            border:
                              selectedColumn === headCell.key ? '2px solid #1976d2' : undefined,
                            cursor: headCell.key !== 'action' ? 'pointer' : undefined,
                            transition: 'border 0.2s',
                          }}
                          onClick={
                            headCell.key !== 'action'
                              ? (e) => {
                                  e.stopPropagation();
                                  handleRequestSort(headCell.key);
                                }
                              : undefined
                          }
                        >
                          <TableSortLabel
                            active={orderBy === headCell.key}
                            direction={orderBy === headCell.key ? order : 'asc'}
                            sx={{ color: '#616161', '&.Mui-active': { color: '#616161' } }}
                          >
                            {headCell.label}
                          </TableSortLabel>
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
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                    {headTable
                      .filter((h) => h.key !== 'action')
                      .map((h) => (
                        <TableCell
                          key={h.key}
                          onClick={(e) => {
                            if (e.detail === 2) handleViewClick(row);
                            handleCellClick(row, h.key, e);
                          }}
                          sx={{
                            cursor:
                              h.key !== 'docNumber' && h.key !== 'action' ? 'pointer' : undefined,
                            background:
                              selectedCell.rowId === row.id && selectedCell.col === h.key
                                ? '#e3f2fd'
                                : undefined,
                            fontWeight:
                              selectedCell.rowId === row.id && selectedCell.col === h.key
                                ? 700
                                : undefined,
                          }}
                        >
                          {filters.search && row[h.key]
                            ? highlight(row[h.key], filters.search)
                            : row[h.key]}
                        </TableCell>
                      ))}
                    {/* Колонка с тремя точками */}
                    <TableCell align="right">
                      <IconButton onClick={(e) => handleMenuOpen(e, row)}>
                        <Iconify icon="eva:more-vertical-fill" />
                      </IconButton>
                    </TableCell>
                  </>
                )}
                components={{
                  Table: (props) => <Table {...props} stickyHeader />,
                }}
                style={{ height: '100%' }}
              />
            )}
          </TableContainer>
          {!isLoading && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: 4,
                mt: 2,
                pr: 2,
              }}
            >
              <Typography sx={{ fontWeight: 700, fontSize: 16 }}>
                Итоговая сумма:&nbsp;
                {sortedRows
                  .reduce((sum, row) => sum + (Number(row.contract) || 0), 0)
                  .toLocaleString('ru-RU')}{' '}
                сом
              </Typography>
              <Typography sx={{ fontWeight: 700, fontSize: 16 }}>
                Итоговое количество: &nbsp;
                {sortedRows.length}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
      <ViewModal
        open={openViewModal}
        onClose={() => handleViewClose()}
        columns={ALL_COLUMNS}
        data={viewData}
      />
      <ModalUi open={openEditModal} setOpen={setOpenEditModal}>
        <UpdateOrderForAdmissions
          selectedUser={editData}
          setOpen={setOpenEditModal}
          setSelectedUser={setEditData}
          setSnackbarOpen={(open) => setSnackbar((s) => ({ ...s, open }))}
          setSnackbarMessage={(msg) => setSnackbar((s) => ({ ...s, message: msg }))}
        />
      </ModalUi>
      <ModalUi open={openAddModal} setOpen={setOpenAddModal}>
        <Create
          snackbarOpen={snackbar.open}
          setOpen={setOpenAddModal}
          setSnackbarOpen={(open) => setSnackbar((s) => ({ ...s, open }))}
          setSnackbarMessage={(msg) => setSnackbar((s) => ({ ...s, message: msg }))}
          onClose={() => setOpenAddModal(false)}
        />
      </ModalUi>
      <ModalDelete
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        deleteRows={deleteRows}
      />
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

      {/* Popover для действий */}
      {menuRow && originalRow && (
        <ActionsPopover
          editData={originalRow}
          open={!!menuAnchorEl || !!menuAnchorPosition}
          anchorEl={menuAnchorEl}
          anchorPosition={menuAnchorPosition}
          onClose={handleMenuClose}
          row={originalRow.attributes}
          onEdit={handleOpenEdit}
          onOpenPdf={handleOpenPdfModal}
        />
      )}
      {pdfModalData && (
        <PDFViewerModal
          open={pdfModalOpen}
          onClose={handleClosePdfModal}
          row={pdfModalData.row}
          formData={pdfModalData.formData}
          positions={pdfModalData.positions}
        />
      )}
    </Box>
  );
}
