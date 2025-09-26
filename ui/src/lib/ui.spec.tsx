import { render, screen } from '@testing-library/react';
import { PokemonCard, PokemonCardSkeleton, PokemonTypeBadge } from './ui';
import type { PokemonSummary } from '@scdevelop/models';

describe('UI components', () => {
  it('renders PokemonTypeBadge with label', () => {
    render(<PokemonTypeBadge type="grass" label="Grass" />);
    expect(!!screen.getByLabelText('Grass')).toBe(true);
  });

  it('renders PokemonCard skeleton', () => {
    const { container } = render(<PokemonCardSkeleton primaryType="fire" />);
    expect(container.querySelector('[aria-busy]')).toBeTruthy();
  });

  it('renders PokemonCard with summary', () => {
    const summary: PokemonSummary = {
      speciesId: 1,
      number: 1,
      name: 'Bulbasaur',
      types: ['grass', 'poison'],
      artworkUrl: 'https://example.com/bulbasaur.png',
    };
    render(<PokemonCard pokemon={summary} />);
    expect(!!screen.getByRole('article', { name: /bulbasaur card/i })).toBe(true);
    expect(!!screen.getByText('#001')).toBe(true);
  });
});
