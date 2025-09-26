import { describe, it, expect } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { routes } from '../router';

describe('RootLayout', () => {
  it('highlights the active nav link based on route', async () => {
    const router = createMemoryRouter(routes, { initialEntries: ['/pokedex'] });
    render(<RouterProvider router={router} />);

    const pokedexLink = await screen.findByRole('link', { name: 'Pokedex' });
    const homeLink = screen.getByRole('link', { name: 'Home' });

    expect(pokedexLink.getAttribute('aria-current')).toBe('page');
    expect(homeLink.getAttribute('aria-current')).toBeNull();
  });
});

