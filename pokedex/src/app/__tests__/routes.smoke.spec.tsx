import { describe, it, expect } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { routes } from '../router';

describe('routes', () => {
  it('renders home route', async () => {
    const router = createMemoryRouter(routes, { initialEntries: ['/'] });
    render(<RouterProvider router={router} />);
    const headings = await screen.findAllByText('Home');
    expect(headings.length).toBeGreaterThan(0);
  });
});

