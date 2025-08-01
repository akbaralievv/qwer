import SvgColor from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

const navConfig = [
  {
    title: 'Монитор',
    path: '',
    icon: icon('ic_analytics'),
  },
  {
    title: 'Справочники',
    path: '',
    children: [
      {
        title: 'Контрагенты',
        path: '/contragents',
        icon: icon('ic_cart'),
      },
      // {
      //   title: 'Факультеты',
      //   path: '/facultative',
      //   icon: icon('ic_user'),
      // },
      // {
      //   title: 'Курс',
      //   path: '/subdivisions',
      //   icon: icon('ic_user'),
      // },
      {
        title: 'Вид контрагента',
        path: '/contragentTypes',
        icon: icon('ic_user'),
      },
      {
        title: 'Адреса',
        path: '/objects',
        icon: icon('ic_user'),
      },
      {
        title: 'Участки',
        path: '/uchastki',
        icon: icon('ic_user'),
      },
      {
        title: 'Виды услуг',
        path: '/services',
        icon: icon('ic_cart'),
      },
      {
        title: 'Агрегаторы',
        path: '/agregators',
        icon: icon('ic_cart'),
      },
    ],
    icon: icon('ic_user'),
  },
  {
    title: 'Документ',
    path: '',
    children: [
      {
        title: 'Договор',
        path: '/dogovor',
        icon: icon('ic_user'),
      },
      {
        title: 'Доп.соглашение',
        path: '/dopdogovor',
        icon: icon('ic_cart'),
      },
      {
        title: 'Прекращение',
        path: '/prekrascheniye',
        icon: icon('ic_cart'),
      },
      {
        title: 'Начисление',
        path: '/payroll',
        icon: icon('ic_cart'),
      },
      {
        title: 'Платежи',
        path: '/payment',
        icon: icon('ic_cart'),
      },
    ],
    icon: icon('ic_document'),
  },
  {
    title: 'Отчет',
    path: '',
    children: [
      {
        title: 'Ведомость начисления',
        // path: '/report/accruals',
        path: '/payroll',
        icon: icon('ic_user'),
      },
      {
        title: 'Ведомость оплаты',
        // path: '/report/payment',
        path: '/payment',
        icon: icon('ic_cart'),
      },
      {
        title: 'Отчет по контрагентам',
        path: '/contragents',
        // path: '/report/counterparty',
        icon: icon('ic_cart'),
      },
    ],
    icon: icon('ic_report'),
  },
  {
    title: 'Настройки',
    path: '',
    children: [
      {
        title: 'Реквизиты',
        path: '/data/organization',
        icon: icon('ic_user'),
      },
      {
        title: 'Ответственные лица',
        path: '/position',
        icon: icon('ic_cart'),
      },
    ],
    icon: icon('ic_settings'),
  },
];

export default navConfig;
