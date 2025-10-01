import { PropsWithChildren, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { SidebarNav, BottomNav } from '@scdevelop/ui';

interface NavItemConfig {
  key: string;
  label: string;
  href: string;
}

const NAV_ITEMS: NavItemConfig[] = [
  { key: 'home', label: 'Home', href: '/' },
  { key: 'pokedex', label: 'Pokedex', href: '/pokedex' },
  { key: 'squad', label: 'Squad', href: '/squad' },
  { key: 'box', label: 'Box', href: '/box' },
  { key: 'generations', label: 'Generations', href: '/generations' },
  { key: 'user', label: 'User', href: '/user' },
  { key: 'settings', label: 'Settings', href: '/settings' },
];

function useActiveNavItems(pathname: string) {
  return useMemo(() => {
    return NAV_ITEMS.map((i) => {
      const isExact = i.href === '/'
        ? pathname === '/'
        : pathname === i.href || pathname.startsWith(i.href + '/');
      return { ...i, isActive: isExact };
    });
  }, [pathname]);
}

export default function AppShell(props: PropsWithChildren<{}>) {
  const location = useLocation();
  const items = useActiveNavItems(location.pathname);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: 240, padding: 16, borderRight: '1px solid #eee' }}>
        <SidebarNav items={items} />
      </aside>
      <main style={{ flex: 1, padding: 16 }}>
        {props.children}
      </main>
      {/* Keep BottomNav rendered but hidden for now to avoid duplicate links in tests */}
      <div hidden>
        <BottomNav items={items} />
      </div>
    </div>
  );
}
