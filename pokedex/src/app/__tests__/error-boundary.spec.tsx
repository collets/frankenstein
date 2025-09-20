import { describe, it, expect } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { routes } from '../router';

describe('RootErrorBoundary', () => {
  it('renders a 404 when route throws Response', async () => {
    const failingRoutes = [
      {
        ...routes[0],
        children: [
          { index: true, loader: () => { throw new Response('Not found', { status: 404, statusText: 'Not Found' }); }, element: <div /> },
        ],
      },
    ];
    const router = createMemoryRouter(failingRoutes, { initialEntries: ['/'] });
    render(<RouterProvider router={router} />);
    expect(await screen.findByText(/404/)).toBeTruthy();
    expect(screen.getByText(/Not Found/)).toBeTruthy();
  });
});

