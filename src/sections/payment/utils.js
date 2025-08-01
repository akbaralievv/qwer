export const visuallyHidden = {
  border: 0,
  margin: -1,
  padding: 0,
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  position: 'absolute',
  whiteSpace: 'nowrap',
  clip: 'rect(0 0 0 0)',
};

export function emptyRows(page, rowsPerPage, arrayLength) {
  return page ? Math.max(0, (1 + page) * rowsPerPage - arrayLength) : 0;
}

export function descendingComparator(a, b, orderBy) {
  if (!a || !b) return 0;
  if (orderBy === 'amount') {
    return Number(a[orderBy]) - Number(b[orderBy]);
  }
  if (orderBy === 'paid_at') {
    return new Date(a[orderBy]) - new Date(b[orderBy]);
  }
  if (a[orderBy] < b[orderBy]) {
    return -1;
  }
  if (a[orderBy] > b[orderBy]) {
    return 1;
  }
  return 0;
}

export function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(b, a, orderBy)
    : (a, b) => descendingComparator(a, b, orderBy);
}

export function stableSort(array, comparator) {
  const stabilizedThis = array.filter(Boolean).map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

export function applyFilter({ inputData, comparator, filterName }) {
  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (filterName) {
    inputData = inputData.filter(
      (user) => user.attributes.name.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
    );
  }

  return inputData;
}

export function formatDateKg(dateStr) {
  if (!dateStr) return '';
  const date = new Date(`${dateStr  }T00:00:00+06:00`);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

export function getDateString(date) {
  const kgDate = new Date(date.getTime() + 6 * 60 * 60 * 1000);
  return kgDate.toISOString().slice(0, 10);
}

export function getTodayRange() {
  const now = new Date();
  const today = getDateString(now);
  return {
    startOfDay: today,
    endOfDay: today,
  };
}

export function filterRows(rows, filters, fieldFilters) {
  if (!filters.filterFields || filters.filterFields.length === 0) return rows;
  return rows.filter(row =>
    filters.filterFields.every(key => {
      if (key === 'amount') {
        const filterValue = fieldFilters[key];
        if (filterValue === undefined || filterValue === '') return true;
        return Number(row[key]) === Number(filterValue);
      }
      if (key === 'inn') {
        const filterValue = fieldFilters[key];
        if (!filterValue) return true;
        return String(row[key]).includes(String(filterValue));
      }
      if (key === 'aggregator_inn') {
        return String(row[key]) === String(fieldFilters[key]?.[0]);
      }
      if (key === 'payment_id') {
        return String(row[key]).toLowerCase().includes(String(fieldFilters[key]?.[0]).toLowerCase());
      }
      if (key === 'paid_at') {
        let filterValue = fieldFilters[key];
        if (!filterValue) return true;
        // Если фильтр из ячейки — это массив, берем первый элемент
        if (Array.isArray(filterValue)) filterValue = filterValue[0];
        // Сравниваем только дату (yyyy-mm-dd)
        const rowDate = row[key] ? row[key].slice(0, 10) : '';
        const filterDate = filterValue ? filterValue.slice(0, 10) : '';
        return rowDate === filterDate;
      }
      // Для остальных — обычное сравнение (массив)
      return Array.isArray(fieldFilters[key]) && fieldFilters[key].length > 0
        ? fieldFilters[key].includes(row[key])
        : true;
    })
  );
}
