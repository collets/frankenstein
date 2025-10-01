import { ActionFunctionArgs, LoaderFunctionArgs, useLoaderData, Form, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { PokeApi } from '@scdevelop/data-access/pokeapi';
import { PokemonCard, PokemonContextMenu, FilterDropdown, type FilterOption } from '@scdevelop/ui';
import type { PokemonType, PokemonSummary } from '@scdevelop/models';
import { useMemo } from 'react';

export interface SessionInfo { userId: string | null; isGuest: boolean }
export interface PageInfo { limit: number; offset?: number }
export interface Filters { types?: PokemonType[]; sort?: 'name'|'number' }

interface Entry { speciesId: number; number: number; visibleName?: string; visibleTypes?: PokemonType[]; silhouette: boolean; artworkUrl: string }

const POKEMON_TYPES: PokemonType[] = [
  'normal', 'fire', 'water', 'grass', 'electric', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
];

export interface PokedexData {
  session: SessionInfo;
  page: PageInfo;
  filters: Filters;
  entries: Entry[];
}

export async function loader({ request }: LoaderFunctionArgs): Promise<PokedexData> {
  const url = new URL(request.url);
  const limit = Number(url.searchParams.get('limit') ?? '24');
  const offset = Number(url.searchParams.get('offset') ?? '0');
  const q = (url.searchParams.get('q') ?? '').toLowerCase();
  const typesParam = url.searchParams.get('types');
  const sortParam = url.searchParams.get('sort') as 'name' | 'number' | null;
  
  const selectedTypes = typesParam ? typesParam.split(',').filter(Boolean) as PokemonType[] : undefined;
  
  try {
    const page = await PokeApi.listSpeciesPage({ limit, offset });
    
    // Map to Entry format
    let entries: Entry[] = page.entries.map((entry) => ({
      speciesId: entry.speciesId,
      number: entry.number,
      visibleName: entry.name,
      visibleTypes: entry.types.length > 0 ? entry.types : undefined,
      silhouette: false, // Dex status integration comes later
      artworkUrl: entry.artworkUrl,
    }));
    
    // Apply client-side filters
    if (q) {
      entries = entries.filter((e) => e.visibleName?.includes(q));
    }
    
    // Filter by types
    if (selectedTypes && selectedTypes.length > 0) {
      entries = entries.filter((e) => 
        e.visibleTypes?.some((t) => selectedTypes.includes(t))
      );
    }
    
    // Sort
    if (sortParam === 'name') {
      entries.sort((a, b) => (a.visibleName || '').localeCompare(b.visibleName || ''));
    } else if (sortParam === 'number') {
      entries.sort((a, b) => a.number - b.number);
    }
    
    return {
      session: { userId: null, isGuest: true },
      page: { limit, offset },
      filters: { types: selectedTypes, sort: sortParam || undefined },
      entries,
    };
  } catch (error) {
    console.error('Failed to load pokedex:', error);
    throw new Response('Failed to load pokedex data', { status: 502 });
  }
}

export async function action(_args: ActionFunctionArgs) {
  return null;
}

export default function Pokedex() {
  const data = useLoaderData() as PokedexData;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const hasNextPage = data.entries.length === data.page.limit;
  const hasPrevPage = (data.page.offset ?? 0) > 0;
  
  // Type filter options
  const typeOptions: FilterOption[] = useMemo(() => 
    POKEMON_TYPES.map((type) => ({
      value: type,
      label: type.charAt(0).toUpperCase() + type.slice(1),
      checked: data.filters.types?.includes(type) || false,
    })),
    [data.filters.types]
  );
  
  // Sort options
  const sortOptions: FilterOption[] = useMemo(() => [
    { value: 'number', label: 'Number', checked: data.filters.sort === 'number' },
    { value: 'name', label: 'Name', checked: data.filters.sort === 'name' },
  ], [data.filters.sort]);
  
  const handleTypeToggle = (type: string) => {
    const currentTypes = data.filters.types || [];
    const newTypes = currentTypes.includes(type as PokemonType)
      ? currentTypes.filter((t) => t !== type)
      : [...currentTypes, type as PokemonType];
    
    const params = new URLSearchParams(searchParams);
    if (newTypes.length > 0) {
      params.set('types', newTypes.join(','));
    } else {
      params.delete('types');
    }
    params.delete('offset'); // Reset pagination
    navigate(`?${params.toString()}`);
  };
  
  const handleSortToggle = (sort: string) => {
    const params = new URLSearchParams(searchParams);
    if (data.filters.sort === sort) {
      params.delete('sort');
    } else {
      params.set('sort', sort);
    }
    params.delete('offset'); // Reset pagination
    navigate(`?${params.toString()}`);
  };
  
  const handleClearTypeFilters = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('types');
    params.delete('offset'); // Reset pagination
    navigate(`?${params.toString()}`);
  };
  
  const handleClearSortFilters = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('sort');
    navigate(`?${params.toString()}`);
  };
  
  const buildPaginationUrl = (newOffset: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('offset', String(newOffset));
    params.set('limit', String(data.page.limit));
    return `?${params.toString()}`;
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Pokedex</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Showing {((data.page.offset ?? 0) + 1)}–{(data.page.offset ?? 0) + data.entries.length} Pokemon
        </p>
      </div>
      
      {/* Search and Filters */}
      <div className="space-y-3">
        <Form method="get" className="flex gap-2">
          <input
            name="q"
            placeholder="Search by name..."
            defaultValue={searchParams.get('q') || ''}
            className="flex-1 px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900"
          />
          {/* Preserve other params */}
          {Array.from(searchParams.entries()).filter(([key]) => key !== 'q').map(([key, value]) => (
            <input key={key} type="hidden" name={key} value={value} />
          ))}
          <button
            type="submit"
            className="px-4 py-2 bg-[--color-accent] text-white rounded-md hover:opacity-90 transition-opacity"
          >
            Search
          </button>
        </Form>
        
        <div className="flex flex-wrap gap-2">
          <FilterDropdown
            label="Type"
            icon={<span>🏷️</span>}
            options={typeOptions}
            onToggle={handleTypeToggle}
            onClear={handleClearTypeFilters}
          />
          <FilterDropdown
            label="Sort"
            icon={<span>⬆️</span>}
            options={sortOptions}
            onToggle={handleSortToggle}
            onClear={handleClearSortFilters}
          />
        </div>
      </div>
      
      {/* Grid with Context Menu */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 auto-rows-fr">
        {data.entries.map((entry) => {
          const pokemon: PokemonSummary = {
            speciesId: entry.speciesId,
            number: entry.number,
            name: entry.visibleName || '???',
            types: entry.visibleTypes || ['normal'],
            artworkUrl: entry.artworkUrl,
          };
          
          return (
            <PokemonContextMenu
              key={entry.speciesId}
              items={[
                {
                  label: 'View Details',
                  onClick: () => navigate(`/pokemon/${entry.speciesId}`),
                  icon: <span>👁️</span>,
                },
                {
                  label: 'Catch Pokemon',
                  onClick: () => {
                    // TODO: Implement catch functionality
                    console.log('Catch pokemon', entry.speciesId);
                  },
                  icon: <span>⚾</span>,
                },
                {
                  label: 'Add to Squad',
                  onClick: () => {
                    // TODO: Implement add to squad functionality
                    console.log('Add to squad', entry.speciesId);
                  },
                  icon: <span>⭐</span>,
                },
              ]}
            >
              <Link to={`/pokemon/${entry.speciesId}`} className="block h-full">
                <PokemonCard pokemon={pokemon} />
              </Link>
            </PokemonContextMenu>
          );
        })}
      </div>
      
      {/* Empty state */}
      {data.entries.length === 0 && (
        <div className="text-center py-12">
          <p className="text-neutral-500 dark:text-neutral-400">No Pokemon found matching your filters.</p>
        </div>
      )}
      
      {/* Pagination */}
      <div className="flex gap-3 justify-center items-center">
        {hasPrevPage && (
          <Link
            to={buildPaginationUrl(Math.max(0, (data.page.offset ?? 0) - data.page.limit))}
            className="px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            Previous
          </Link>
        )}
        <span className="text-sm text-neutral-600 dark:text-neutral-400">
          Page {Math.floor((data.page.offset ?? 0) / data.page.limit) + 1}
        </span>
        {hasNextPage && (
          <Link
            to={buildPaginationUrl((data.page.offset ?? 0) + data.page.limit)}
            className="px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            Next
          </Link>
        )}
      </div>
    </div>
  );
}

