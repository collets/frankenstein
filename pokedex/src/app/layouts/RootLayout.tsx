import { NavLink, Outlet } from 'react-router-dom';

export default function RootLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: 200, padding: 16, borderRight: '1px solid #eee' }}>
        <nav>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
            <li><NavLink to="/" end>Home</NavLink></li>
            <li><NavLink to="/pokedex">Pokedex</NavLink></li>
            <li><NavLink to="/squad">Squad</NavLink></li>
            <li><NavLink to="/box">Box</NavLink></li>
            <li><NavLink to="/generations">Generations</NavLink></li>
            <li><NavLink to="/user">User</NavLink></li>
            <li><NavLink to="/settings">Settings</NavLink></li>
          </ul>
        </nav>
      </aside>
      <main style={{ flex: 1, padding: 16 }}>
        <Outlet />
      </main>
    </div>
  );
}

