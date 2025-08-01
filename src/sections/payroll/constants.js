export const FILTER_FIELDS = [
  { key: 'docDate', label: 'Дата документа', type: 'date' },
  { key: 'contragent', label: 'Контрагент', type: 'contragentModal', multiple: true },
  { key: 'division', label: 'Курс', type: 'select', multiple: true },
  { key: 'subdiv_one', label: 'Факультет', type: 'select', multiple: true },
  { key: 'service', label: 'Услуга', type: 'select', multiple: true },
  { key: 'autor', label: 'Автор', type: 'select', multiple: true },
  { key: 'periodFrom', label: 'Начало периода', type: 'date' },
  { key: 'periodTo', label: 'Конец периода', type: 'date' },
  { key: 'amount', label: 'Сумма', type: 'number', placeholder: 'Сумма' },
  { key: 'canceled', label: 'Активность', type: 'select', multiple: true, options: ['Да', 'Нет'] },
  { key: 'comment', label: 'Комментарий', type: 'text', placeholder: 'Комментарий' },
];