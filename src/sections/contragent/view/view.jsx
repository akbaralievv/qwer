/* eslint-disable no-shadow */
/* eslint-disable no-nested-ternary */
import PropTypes from 'prop-types';
import { TableVirtuoso } from 'react-virtuoso';
import React, { useState, useEffect } from 'react';

import TableSortLabel from '@mui/material/TableSortLabel';
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
  Typography,
  IconButton,
  CardContent,
  TableContainer,
} from '@mui/material';

import { useTableSearch, useTableSelection, useTableCellSelection } from 'src/hooks/use-table-selections';

import ModalUi from 'src/ui/ModalUi';
import Loading from 'src/ui/Loading';
import SearchInput from 'src/shared/SearchInput';
import RefreshButton from 'src/shared/RefreshButton';
import ActionButtons from 'src/shared/ActionButtons';
// eslint-disable-next-line import/no-cycle
import FilterPopover from 'src/shared/FilterPopover';
import { highlight } from 'src/shared/SharedFunctions';
import ColumnSettingsPopover from 'src/shared/ColumnSettigsPopover';
import { useGetContragentsQuery, useUpdateContragentMutation, useRemoveContragentMutation } from 'src/store/api/contragentAPI';

import Iconify from 'src/components/iconify';

import UpdateModalUi from '../UpdateModalUi';
import CreateUserUi from '../CreateModalUser';
import ContragentViewModal from '../ContragentViewModal';

const COLUMN_KEY = 'contragent_visible_columns';

const ALL_COLUMNS = [
  { key: 'id', label: 'ID', always: true, width: 80 },
  { key: 'ls', label: 'Л.счет', always: true, width: 120 },
  { key: 'name', label: 'ФИО', always: true, width: 220 },
  { key: 'inn', label: 'ИНН/ПИН', always: true, width: 140 },
  { key: 'subdiv_one', label: 'Факультет', width: 180 },
  { key: 'division', label: 'Курс', width: 100 },
  { key: 'resident', label: 'Резидент', width: 100 },
  { key: 'tel', label: 'Телефон', width: 140 },
  { key: 'address', label: 'Адрес', width: 200 },
  { key: 'status', label: 'Статус', width: 140 },
  { key: 'email', label: 'Email', width: 180 },
];

const FILTER_FIELDS = [
  { key: 'name', label: 'ФИО', type: 'text' },
  { key: 'inn', label: 'ИНН/ПИН', type: 'text' },
  { key: 'ls', label: 'Лицевой счет', type: 'number' },
  { key: 'status', label: 'Статус', type: 'select', multiple: true },
  { key: 'division', label: 'Курс', type: 'select', multiple: true },
  { key: 'subdiv_one', label: 'Факультет', type: 'select', multiple: true },
  { key: 'resident', label: 'Резидент', type: 'text' },
  { key: 'tel', label: 'Телефон', type: 'text' },
  { key: 'address', label: 'Адрес', type: 'text' },
  { key: 'email', label: 'Email', type: 'text' },
];

// Получение начальных колонок с учётом always и сохранённых
function getInitialColumns() {
  const saved = localStorage.getItem(COLUMN_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return ALL_COLUMNS.map(col =>
        // eslint-disable-next-line no-nested-ternary
        col.always ? col.key : (parsed.includes(col.key) ? col.key : null)
      ).filter(Boolean);
    } catch {
      return ALL_COLUMNS.map(col => col.key);
    }
  }
  return ALL_COLUMNS.map(col => col.key);
}

export default function ContragentPage({ filterOperation, filterOperation2, setContragent, selectedFromModal, reconnect }) {
  const [isOpenCreate, setIsOpenCreate] = useState(false);
  const [isOpenUpdate, setIsOpenUpdate] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('ls');
  const [filters, setFilters] = useState({ search: '', filterFields: [] });
  const [visibleColumns, setVisibleColumns] = useState(getInitialColumns);
  const [rememberColumns, setRememberColumns] = useState(!!localStorage.getItem(COLUMN_KEY));
  const [columnPopover, setColumnPopover] = useState(null);
  const [filterPopover, setFilterPopover] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [popoverPosition, setPopoverPosition] = useState(null);
  const [popoverRow, setPopoverRow] = useState(null);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [cellFilterActive, setCellFilterActive] = useState(false);
  const [fieldFilters, setFieldFilters] = useState({});
  const [fieldFiltersDraft, setFieldFiltersDraft] = useState({});

  const [updateData] = useUpdateContragentMutation();
  const { data, isLoading, refetch } = useGetContragentsQuery(
    `?populate[1]=division&populate[2]=subdiv_one${filterOperation
      ? `&filters[status][$eq]=${filterOperation}`
      : ''
    }${filterOperation2
      ? `&filters[status][$eq]=${filterOperation2}`
      : ''
    }&pagination[limit]=-1`,
    { refetchOnMountOrArgChange: true }
  );

  const allRows = React.useMemo(() => (data?.data || []).map(row => ({
    ...row.attributes,
    id: row.id,
    division: row.attributes.division?.data?.attributes?.title || '',
    subdiv_one: row.attributes.subdiv_one?.data?.attributes?.title || '',
  })), [data]);

  // --- Фильтрация и поиск ---
  const filteredRows = React.useMemo(() => {
    let rows = allRows;
    Object.entries(fieldFilters).forEach(([key, value]) => {
      if (value && value.length) {
        rows = rows.filter(row =>
          value.some(v => String(row[key] || '').toLowerCase().includes(String(v).toLowerCase()))
        );
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

  // --- ВНЕДРЯЕМ ХУКИ ---
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
  const virtuosoRef = React.useRef(null);
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

  const [openViewModal, setOpenViewModal] = useState(false);
  const [viewData, setViewData] = useState(null);

  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteInfo, setDeleteInfo] = useState(null);
  const [removeContragent] = useRemoveContragentMutation();

  // --- Обработчики ---

  const handleSort = (col) => {
    if (orderBy === col) setOrder(order === 'asc' ? 'desc' : 'asc');
    else {
      setOrderBy(col);
      setOrder('asc');
    }
  };

  // --- КОРРЕКТНЫЙ ОБРАБОТЧИК ДЛЯ КОЛОНОК ---
  const handleColumnChange = (key) => {
    setVisibleColumns((prev) => {
      if (ALL_COLUMNS.find(c => c.key === key && c.always)) return prev;
      return prev.includes(key)
        ? prev.filter(k => k !== key)
        : [...prev, key];
    });
  };

  const handleOpenEdit = () => {
    // ищем сначала в filteredRows, если не нашли — ищем во всех
    let row = filteredRows.find(r => r.id === selectedIds[0]);
    if (!row) row = allRows.find(r => r.id === selectedIds[0]);
    if (row) {
      setSelectedUser({ dataUser: row, idUser: row.id });
      setIsOpenUpdate(true);
    }
  };

  const handleOpenView = (row) => {
    let data = row;
    if (!data && selectedIds) {
      data = filteredRows.find(r => r.id === selectedIds[0]);
      if (!data) data = allRows.find(r => r.id === selectedIds[0]);
    }
    if (data) {
      setViewData(data);
      setOpenViewModal(true);
    }
  };

  const handleOpenAdd = () => setIsOpenCreate(true);

  const handleOpenDelete = () => {
    const id = selectedIds[0];
    const row = allRows.find(r => String(r.id) === String(id));
    setDeleteInfo(row);
    setDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteInfo) {
      try {
        await removeContragent(deleteInfo.id).unwrap();
        setSnackbar({ open: true, message: `Контрагент "${deleteInfo.name}" удалён`, severity: 'success' });
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

  const handleRowMenu = (event, row) => {
    event.stopPropagation();
    setPopoverPosition({ top: event.clientY + 10, left: event.clientX - 120 });
    setPopoverRow(row);
  };

  const handleCloseRowMenu = () => {
    setPopoverPosition(null);
    setPopoverRow(null);
  };

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
    // Все значения приводим к массиву (универсально)
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
    <Box sx={{ mt: 0, background: '#f6f7f9', minHeight: '100vh', pb: 0 }}>
      <Typography variant="h4" ml={1} mb={2} mt={2} gutterBottom sx={{ color: '#444' }}>
        Контрагенты
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
            if (f.key === 'status') return { ...f, type: 'select', options: ['зарегистрирован', 'зачислен', 'перемещен', 'отчислен'] };
            if (f.key === 'division') return { ...f, type: 'select', options: [...new Set(allRows.map(r => r.division).filter(Boolean))] };
            if (f.key === 'subdiv_one') return { ...f, type: 'select', options: [...new Set(allRows.map(r => r.subdiv_one).filter(Boolean))] };
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
          onColumnChange={handleColumnChange}
          rememberColumns={rememberColumns}
          onRememberColumnsChange={setRememberColumns}
        />
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 0, ml: 1 }}>
        <ActionButtons
          onAdd={handleOpenAdd}
          onView={() => handleOpenView()}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
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
                    {ALL_COLUMNS.filter(col => visibleColumns.includes(col.key) && col.key !== 'action').map(col => (
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
                          onClick={col.key !== 'action' ? () => handleSort(col.key) : undefined}
                        >
                          <TableSortLabel
                            active={orderBy === col.key}
                            direction={orderBy === col.key ? order : 'asc'}
                            onClick={e => {
                              e.stopPropagation();
                              handleSort(col.key);
                            }}
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
                    {ALL_COLUMNS.filter(col => visibleColumns.includes(col.key) && col.key !== 'action').map(col => (
                      <TableCell
                        key={col.key}
                        onClick={e => {
                          if (e.detail === 2 && setContragent) {
                            setContragent({
                              dataUser: row,
                              idUser: row.id,
                            });
                          } else if (e.detail === 2 && !setContragent) {
                            handleOpenView(row);
                          } else {
                            handleCellClick(row, col.key, e);
                          }
                        }}
                        sx={{
                          cursor: col.key !== 'id' && col.key !== 'action' ? 'pointer' : undefined,
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
        PaperProps={{ sx: { width: 140 } }}
      >
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
          onClick={() => {
            handleCloseRowMenu();
            setPdfModalOpen(true);
          }}
          startIcon={<Iconify icon="eva:file-text-outline" />}
        >
          PDF
        </Button>
      </Popover>

      <ModalUi radius="10" open={pdfModalOpen} setOpen={setPdfModalOpen} width="30%" height="20%">
        <Typography variant="h6" align="center" gutterBottom>
          Скачать PDF файл контрагента
        </Typography>
        <Box mt={7} display="flex" justifyContent="center" gap={10} alignItems="center">
          <Button
            variant="contained"
            onClick={() => {
              setPdfModalOpen(false);
            }}
          >
            Скачать PDF
          </Button>
          <Button
            variant="outlined"
            fullWidth
            sx={{ width: '30%' }}
            onClick={() => setPdfModalOpen(false)}
          >
            Закрыть
          </Button>
        </Box>
      </ModalUi>
      <ModalUi open={isOpenUpdate} setOpen={setIsOpenUpdate}>
        <UpdateModalUi
          selectedUser={selectedUser}
          setOpen={setIsOpenUpdate}
          setSelectedUser={setSelectedUser}
          updateData={updateData}
        />
      </ModalUi>
      <ModalUi open={isOpenCreate} setOpen={setIsOpenCreate}>
        <CreateUserUi
          open={isOpenCreate}
          setOpen={setIsOpenCreate}
          setSnackbarOpen={open => setSnackbar(s => ({ ...s, open }))}
          setSnackbarMessage={msg => setSnackbar(s => ({ ...s, message: msg }))}
          snackbarOpen={snackbar.open}
          snackbarMessage={snackbar.message}
        />
      </ModalUi>
      <ContragentViewModal
        open={openViewModal}
        onClose={() => {
          setSelectedCell({ rowId: null, col: null });
          setOpenViewModal(false)
        }}
        data={viewData}
      />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        message={snackbar.message}
      />
      <ModalUi open={deleteDialog} setOpen={setDeleteDialog}>
        <Box p={3}>
          <Typography variant="h6" mb={2}>
            Удалить контрагента?
          </Typography>
          <Typography mb={3}>
            {deleteInfo?.name}
          </Typography>
          <Box display="flex" gap={2} justifyContent="flex-end">
            <Button onClick={handleDeleteCancel}>Отмена</Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained">
              Удалить
            </Button>
          </Box>
        </Box>
      </ModalUi>
    </Box>
  );
}

ContragentPage.propTypes = {
  filterOperation: PropTypes.string,
  filterOperation2: PropTypes.string,
  setContragent: PropTypes.func,
  reconnect: PropTypes.bool,
  selectedFromModal: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.array, // добавь это!
  ]),
};
