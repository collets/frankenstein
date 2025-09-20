import { describe, it, expect } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { routes } from '../router';

describe('Pokedex search', () => {
  it('filters entries by query param', async () => {
    const router = createMemoryRouter(routes, { initialEntries: ['/pokedex?limit=10&offset=0&q=pokemon-3'] });
    render(<RouterProvider router={router} />);

    const cards = await screen.findAllByText(/pokemon-3/);
    expect(cards.length).toBeGreaterThan(0);

    // Ensure non-matching doesn't show
    const nonMatches = screen.queryByText('pokemon-8');
    expect(nonMatches).toBeNull();
  });
});

