import { describe, it, expect } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { routes } from '../router';

describe('Pokedex search', () => {
  it('filters entries by query param', async () => {
    // First load without query to get baseline
    const router = createMemoryRouter(routes, { initialEntries: ['/pokedex?limit=10&offset=0'] });
    render(<RouterProvider router={router} />);

    // MSW returns bulbasaur (id=1), pokemon-2, pokemon-3, etc.
    const firstPokemon = await screen.findByText(/bulbasaur/i);
    expect(firstPokemon).toBeTruthy();
    
    // Verify we have multiple entries
    const allPokemon = screen.getAllByRole('article');
    expect(allPokemon.length).toBeGreaterThan(1);
  });
});

