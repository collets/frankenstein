// Uncomment this line to use CSS modules
// import styles from './app.module.css';
import NxWelcome from './nx-welcome';
import { PokemonCardSkeleton, PokemonTypeBadge, BottomNav } from '@scdevelop/ui';

import { Route, Routes, Link } from 'react-router-dom';

export function App() {
  return (
    <div>
      <NxWelcome title="pokedex" />

      {/* START: routes */}
      {/* These routes and navigation have been generated for you */}
      {/* Feel free to move and update them to fit your needs */}
      <br />
      <hr />
      <br />
      <div role="navigation">
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/page-2">Page 2</Link>
          </li>
        </ul>
      </div>
      <Routes>
        <Route
          path="/"
          element={
            <div>
              This is the generated root route.{' '}
              <Link to="/page-2">Click here for page 2.</Link>
              <div className="mt-6 space-y-4">
                <div className="space-x-2">
                  <PokemonTypeBadge type="grass" label="Grass" />
                  <PokemonTypeBadge type="fire" label="Fire" />
                  <PokemonTypeBadge type="water" label="Water" />
                </div>
                <PokemonCardSkeleton primaryType="electric" />
              </div>
            </div>
          }
        />
        <Route
          path="/page-2"
          element={
            <div>
              <Link to="/">Click here to go back to root page.</Link>
            </div>
          }
        />
      </Routes>
      {/* END: routes */}
      <BottomNav
        items={[
          { key: 'home', label: 'Home', href: '/', isActive: true },
          { key: 'pokedex', label: 'Pokedex', href: '/pokedex' },
          { key: 'squad', label: 'Squad', href: '/squad' },
          { key: 'gens', label: 'Generations', href: '/generations' },
          { key: 'user', label: 'User', href: '/user' },
        ]}
      />
    </div>
  );
}

export default App;
