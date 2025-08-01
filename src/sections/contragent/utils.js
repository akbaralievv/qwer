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

/**
 * Возвращает количество пустых строк для заполнения таблицы
 * @param {number} page - текущая страница
 * @param {number} rowsPerPage - количество строк на странице
 * @param {number} arrayLength - общее количество строк
 */
export function emptyRows(page, rowsPerPage, arrayLength) {
  return page ? Math.max(0, (1 + page) * rowsPerPage - arrayLength) : 0;
}

/**
 * Получение компаратора для сортировки
 * @param {string} order - порядок сортировки ('asc' или 'desc')
 * @param {string} orderBy - поле, по которому производится сортировка
 */
export function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

/**
 * Компаратор для сортировки в порядке убывания
 * @param {object} a - объект для сравнения
 * @param {object} b - объект для сравнения
 * @param {string} orderBy - поле, по которому производится сортировка
 */
function descendingComparator(a, b, orderBy) {
  const aValue = getValue(a, orderBy);
  const bValue = getValue(b, orderBy);

  if (bValue < aValue) {
    return -1;
  }
  if (bValue > aValue) {
    return 1;
  }
  return 0;
}

/**
 * Универсальная функция для сортировки массива объектов по полю
 * @param {string} field - поле, по которому производится сортировка
 * @param {Array} data - массив данных для сортировки
 */
export const sortByField = (field, data, order = 'asc') => {
  const copiedData = [...data]; // Копируем данные, чтобы избежать мутаций

  return copiedData.sort((a, b) => {
    const valueA = extractValue(a.attributes, field);
    const valueB = extractValue(b.attributes, field);

    // Если оба значения отсутствуют
    if (valueA === "NO TITLE" && valueB === "NO TITLE") return 0;

    // Если одно из значений отсутствует, помещаем его вниз
    if (valueA === "NO TITLE") return 1;
    if (valueB === "NO TITLE") return -1;

    // Сравниваем значения
    if (valueA === valueB) return 0;
    // eslint-disable-next-line no-nested-ternary
    return order === 'asc' ? (valueA > valueB ? 1 : -1) : (valueA < valueB ? 1 : -1);
  });
};




/**
 * Фильтрация и сортировка данных
 * @param {object} params - параметры для фильтрации
 * @param {Array} params.inputData - массив данных
 * @param {function} params.comparator - функция для сортировки
 * @param {string} params.filterName - значение для фильтрации
 * @param {string} params.filterField - поле, по которому производится фильтрация
 */
export function applyFilter({ inputData, comparator, filterName, filterField = 'name' }) {
  const preparedData = inputData.map((item) => ({
    ...item,
    attributes: {
      ...item.attributes,
      [filterField]: item.attributes[filterField] || '', // Замена null на ""
    },
  }));

  // Применяем сортировку
  const stabilizedThis = preparedData.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  // Применяем фильтрацию
  return stabilizedThis
    .map((el) => el[0])
    .filter((item) =>
      item.attributes[filterField]?.toString().toLowerCase().includes(filterName.toLowerCase())
    );
}

/**
 * Функция для получения значения поля объекта (с учетом вложенных объектов)
 * @param {object} obj - объект, содержащий данные
 * @param {string} field - поле, значение которого нужно получить
 */
function getValue(obj, field) {
  if (field === 'division' || field === 'subdiv_one') {
    return obj[field]?.data?.attributes?.title || ''; // Возвращаем вложенное значение или пустую строку
  }
  return obj.attributes[field] || ''; // Возвращаем значение обычного поля или пустую строку
}

/**
 * Извлечение значения для указанного поля
 * @param {object} obj - объект, содержащий данные
 * @param {string} field - имя поля
 */
function extractValue(obj, field) {
  if (field === 'division' || field === 'subdiv_one') {
    // Если поле `data` существует, возвращаем `title`, иначе "NO TITLE"
    return obj[field]?.data?.attributes?.title || "NO TITLE";
  }
  // Для остальных полей возвращаем значение или пустую строку
  return obj.attributes?.[field] || "";
}



