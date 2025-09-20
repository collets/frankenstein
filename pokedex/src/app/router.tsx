import { createBrowserRouter, json, defer } from 'react-router-dom';
import RootLayout from './layouts/RootLayout';
import { RootErrorBoundary } from './shared/error-boundary';
import Home, { loader as homeLoader } from './routes/Home';
import Pokedex, { loader as pokedexLoader, action as pokedexAction } from './routes/Pokedex';
import PokemonDetails, { loader as pokemonLoader, action as pokemonAction } from './routes/PokemonDetails';
import Squad, { loader as squadLoader, action as squadAction } from './routes/Squad';
import Box, { loader as boxLoader, action as boxAction } from './routes/Box';
import Generations, { loader as generationsLoader } from './routes/Generations';
import User, { loader as userLoader, action as userAction } from './routes/User';
import Settings, { loader as settingsLoader, action as settingsAction } from './routes/Settings';

export const routes = [
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RootErrorBoundary />,
    children: [
      { index: true, element: <Home />, loader: homeLoader },
      { path: 'pokedex', element: <Pokedex />, loader: pokedexLoader, action: pokedexAction },
      { path: 'pokemon/:id', element: <PokemonDetails />, loader: pokemonLoader, action: pokemonAction },
      { path: 'squad', element: <Squad />, loader: squadLoader, action: squadAction },
      { path: 'box', element: <Box />, loader: boxLoader, action: boxAction },
      { path: 'generations', element: <Generations />, loader: generationsLoader },
      { path: 'user', element: <User />, loader: userLoader, action: userAction },
      { path: 'settings', element: <Settings />, loader: settingsLoader, action: settingsAction },
    ],
  },
];

export const browserRouter = createBrowserRouter(routes);

