import { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';

import { AppHeader } from '../app-header';

export const Layout = () => (
  <>
    <AppHeader />
    <Outlet />
  </>
);
