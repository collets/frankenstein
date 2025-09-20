import { describe, it, expect } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { routes } from '../router';

describe('Settings defaults', () => {
  it('shows default theme and accent', async () => {
    const router = createMemoryRouter(routes, { initialEntries: ['/settings'] });
    render(<RouterProvider router={router} />);
    const select = await screen.findByRole('combobox', { name: /theme/i });
    const selected = (select as HTMLSelectElement).selectedOptions[0];
    expect(selected.value).toBe('system');
    const accentInput = screen.getByRole('textbox', { name: /accent/i }) as HTMLInputElement;
    expect(accentInput.value).toBe('indigo');
  });
});

