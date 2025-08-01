import { lazy, Suspense } from 'react';
import { Outlet, Navigate, useRoutes } from 'react-router-dom';

import DashboardLayout from 'src/layouts/dashboard';

export const IndexPage = lazy(() => import('src/pages/app'));
export const BlogPage = lazy(() => import('src/pages/blog'));
export const ContragentPage = lazy(() => import('src/pages/user'));
export const ReceptionPage = lazy(() => import('src/pages/Reception'));
export const MovingPage = lazy(() => import('src/pages/moving'));
export const DeductionPage = lazy(() => import('src/pages/deduction'));
export const PayrollPage = lazy(() => import('src/pages/payroll'));
export const PayrollGroupResult = lazy(() => import('src/pages/payrollgroupresult'));
export const PaymentPage = lazy(() => import('src/pages/payment'));
export const PositionPage = lazy(() => import('src/pages/position'));
export const DataOrganizationPage = lazy(() => import('src/pages/dataorganization'));

export const SubdivisionsPage = lazy(() => import('src/pages/subdivisions'));
export const ServicesPage = lazy(() => import('src/pages/services'));

export const FacultativePage = lazy(() => import('src/pages/Facultative'));
export const AgregatorsPage = lazy(() => import('src/pages/agregators'));

export const LoginPage = lazy(() => import('src/pages/login'));
export const ProductsPage = lazy(() => import('src/pages/products'));
export const Page404 = lazy(() => import('src/pages/page-not-found'));

export default function Router({ isAuth }) {

  const routes = useRoutes([
    {
      element: isAuth ? (
        <DashboardLayout>
          <Suspense fallback={<div>Загрузка данных...</div>}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      ) : (
        <Navigate to="/login" replace />
      ),
      children: [
        { element: <IndexPage />, index: true },
        { path: 'subdivisions', element: <SubdivisionsPage /> },
        { path: 'contragents', element: <ContragentPage /> },
        { path: 'facultative', element: <FacultativePage /> },
        { path: 'services', element: <ServicesPage /> },
        { path: 'agregators', element: <AgregatorsPage /> },
        { path: 'data/organization', element: <DataOrganizationPage /> },
        { path: 'document', element: <ContragentPage /> },
        { path: 'dogovor', element: <ReceptionPage /> },
        { path: 'prekrascheniye', element: <DeductionPage /> },
        { path: 'plan', element: <ContragentPage /> },
        { path: 'payment', element: <PaymentPage /> },
        { path: 'payroll', element: <PayrollPage /> },
        { path: 'payrollGroupResult', element: <PayrollGroupResult /> },
        { path: 'position', element: <PositionPage /> },
        { path: 'dopdogovor', element: <MovingPage /> },
        { path: 'report', element: <ContragentPage /> },
        { path: 'report/accruals', element: <ContragentPage /> },
        { path: 'report/payment', element: <ContragentPage /> },
        { path: 'report/counterparty', element: <ContragentPage /> },
        { path: 'report/teacher', element: <ContragentPage /> },
        { path: 'report/lost/profits', element: <ContragentPage /> },
      ],
    },
    {
      path: 'login',
      element: <LoginPage />,
    },
    {
      path: '404',
      element: <Page404 />,
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />,
    },
  ]);

  return routes;
}
