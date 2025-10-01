import { describe, it, expect } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { routes } from '../router';

describe('RootLayout', () => {
  it('highlights the active nav link based on route', async () => {
    const router = createMemoryRouter(routes, { initialEntries: ['/pokedex'] });
    render(<RouterProvider router={router} />);

    // Both sidebar and bottom nav render the same links, so findAllByRole
    const pokedexLinks = await screen.findAllByRole('link', { name: 'Pokedex' });
    const homeLinks = screen.getAllByRole('link', { name: 'Home' });

    // At least one Pokedex link should be marked as active
    expect(pokedexLinks.some(link => link.getAttribute('aria-current') === 'page')).toBe(true);
    // All Home links should not be active
    expect(homeLinks.every(link => link.getAttribute('aria-current') === null)).toBe(true);
  });
});

