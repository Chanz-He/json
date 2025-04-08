import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; 
import Json from './Json/Json';

interface IRouteConfig {
  path: string;
  element?: JSX.Element;
  name?: string;
  children?: IRouteConfig[];
}

const routes: IRouteConfig[] = [
  {
    path: '/',
    children: [
      {
        path: '/',
        element: <Json />,
        name: 'Json',
      },
    ],
  },
];
const renderRoutes = (routes: IRouteConfig[]): React.ReactNode => {
  return routes.map((route) => (
    <Route key={route.path} path={`${route.path}`} element={route.element}>
      {route.children && renderRoutes(route.children)}
    </Route>
  ));
};

const AppRoutes = () => {
  return (
    <Routes>
      {renderRoutes(routes)}
    </Routes>
  );
};

export default AppRoutes;