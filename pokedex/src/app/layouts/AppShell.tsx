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
    <div className="flex min-h-screen">
      {/* Desktop sidebar - hidden on mobile */}
      <aside className="hidden md:block">
        <SidebarNav items={items} />
      </aside>
      
      {/* Main content area - with bottom padding on mobile for BottomNav */}
      <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
        {props.children}
      </main>
      
      {/* Mobile bottom navigation - hidden on desktop */}
      <div className="md:hidden">
        <BottomNav items={items} />
      </div>
    </div>
  );
}
