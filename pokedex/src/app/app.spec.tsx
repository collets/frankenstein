import { render } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { routes } from './router';

describe('App shell', () => {
  it('renders without crashing', () => {
    const router = createMemoryRouter(routes, { initialEntries: ['/'] });
    const { baseElement } = render(<RouterProvider router={router} />);
    expect(baseElement).toBeTruthy();
  });
});
