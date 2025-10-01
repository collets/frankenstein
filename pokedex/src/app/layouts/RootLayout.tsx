import { Outlet } from 'react-router-dom';
import AppShell from './AppShell';

export default function RootLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

