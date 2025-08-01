export const FILTER_FIELDS = [
  { key: 'docDate', label: 'Дата', type: 'date' },
  { key: 'contragent', label: 'Контрагент', type: 'contragentModal', multiple: true },
  { key: 'subdiv_one', label: 'Факультет', type: 'select', multiple: true },
  { key: 'division', label: 'Курс', type: 'select', multiple: true },
  { key: 'basedOn', label: 'На основании', type: 'text' },
  { key: 'service', label: 'Вид услуг', type: 'select', multiple: true },
  { key: 'contract', label: 'Сумма', type: 'number' },
  { key: 'price', label: 'Цена', type: 'number' },
  { key: 'periodFrom', label: 'Начало', type: 'date' },
  { key: 'periodTo', label: 'Конец', type: 'date' },
  { key: 'autor', label: 'Автор', type: 'select', multiple: true },
];