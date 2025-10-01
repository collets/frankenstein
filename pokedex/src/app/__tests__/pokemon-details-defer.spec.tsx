import { describe, it, expect } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { routes } from '../router';

describe('PokemonDetails deferred evolution', () => {
  it('renders pokemon details with tabs including evolution', async () => {
    const router = createMemoryRouter(routes, { initialEntries: ['/pokemon/7'] });
    render(<RouterProvider router={router} />);
    
    // Wait for the page to load - squirtle is the pokemon name for ID 7 in MSW
    expect(await screen.findByText(/squirtle/i)).toBeTruthy();
    
    // Verify tabs are present
    expect(screen.getByRole('tab', { name: /about/i })).toBeTruthy();
    expect(screen.getByRole('tab', { name: /stats/i })).toBeTruthy();
    expect(screen.getByRole('tab', { name: /evolution/i })).toBeTruthy();
    
    // Verify About tab content is visible by default
    expect(screen.getByText(/description/i)).toBeTruthy();
    expect(screen.getByText(/gender rate/i)).toBeTruthy();
  });
});

