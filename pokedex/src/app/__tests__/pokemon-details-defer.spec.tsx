import { describe, it, expect } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { routes } from '../router';

describe('PokemonDetails deferred evolution', () => {
  it('renders fallback then resolved evolution', async () => {
    const router = createMemoryRouter(routes, { initialEntries: ['/pokemon/7'] });
    render(<RouterProvider router={router} />);
    expect(await screen.findByText('Loading evolution…')).toBeTruthy();
    const evolution = await screen.findByText(/chain/);
    expect(evolution).toBeTruthy();
  });
});

