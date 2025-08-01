export const FILTER_FIELDS = [
  { key: 'payment_id', label: 'ID', type: 'text', placeholder: 'ID' },
  { key: 'contragent', label: 'Контрагент', type: 'contragentModal', multiple: true },
  { key: 'desc', label: 'Агрегатор', type: 'select', multiple: true },
  { key: 'source', label: 'Источник', type: 'select', multiple: true },
  { key: 'payment_purpose', label: 'Назначение платежа', type: 'select', multiple: true },
  { key: 'amount', label: 'Сумма оплаты', type: 'number', placeholder: 'Сумма' },
  { key: 'inn', label: 'ИНН', type: 'text', placeholder: 'ИНН' },
  { key: 'paid_at', label: 'Дата оплаты', type: 'date' },
];