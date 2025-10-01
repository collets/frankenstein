import { ActionFunctionArgs, LoaderFunctionArgs, useLoaderData, Form, Link } from 'react-router-dom';
import { PokeApi } from '@scdevelop/data-access/pokeapi';
import { PokemonCard } from '@scdevelop/ui';
import type { PokemonType, PokemonSummary } from '@scdevelop/models';

export interface SessionInfo { userId: string | null; isGuest: boolean }
export interface PageInfo { limit: number; offset?: number }
export interface Filters { types?: string[]; generations?: number[]; sort?: 'name'|'number'|'type'|'generation'|'stats' }

interface Entry { speciesId: number; number: number; visibleName?: string; visibleTypes?: PokemonType[]; silhouette: boolean; artworkUrl: string }

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
  
  try {
    const page = await PokeApi.listSpeciesPage({ limit, offset });
    
    // Map to Entry format and apply client-side search filter
    const entries: Entry[] = page.entries
      .map((entry) => ({
        speciesId: entry.speciesId,
        number: entry.number,
        visibleName: entry.name,
        visibleTypes: entry.types.length > 0 ? entry.types : undefined,
        silhouette: false, // Dex status integration comes later
        artworkUrl: entry.artworkUrl,
      }))
      .filter((e) => (q ? e.visibleName?.includes(q) : true));
    
    return {
      session: { userId: null, isGuest: true },
      page: { limit, offset },
      filters: {},
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
  const hasNextPage = data.entries.length === data.page.limit;
  const hasPrevPage = (data.page.offset ?? 0) > 0;
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Pokedex</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Showing {data.page.offset ?? 0 + 1}–{(data.page.offset ?? 0) + data.entries.length}
        </p>
      </div>
      
      {/* Search */}
      <Form method="get" className="flex gap-2">
        <input
          name="q"
          placeholder="Search by name..."
          defaultValue=""
          className="flex-1 px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900"
        />
        <input type="hidden" name="limit" value={data.page.limit} />
        <input type="hidden" name="offset" value={data.page.offset ?? 0} />
        <button
          type="submit"
          className="px-4 py-2 bg-[--color-accent] text-white rounded-md hover:opacity-90"
        >
          Search
        </button>
      </Form>
      
      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {data.entries.map((entry) => (
          <Link key={entry.speciesId} to={`/pokemon/${entry.speciesId}`}>
            <PokemonCard
              pokemon={{
                speciesId: entry.speciesId,
                number: entry.number,
                name: entry.visibleName || '???',
                types: entry.visibleTypes || ['normal'],
                artworkUrl: entry.artworkUrl,
              }}
            />
          </Link>
        ))}
      </div>
      
      {/* Pagination */}
      <div className="flex gap-3 justify-center">
        {hasPrevPage && (
          <Link
            to={`/pokedex?limit=${data.page.limit}&offset=${Math.max(0, (data.page.offset ?? 0) - data.page.limit)}`}
            className="px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            Previous
          </Link>
        )}
        {hasNextPage && (
          <Link
            to={`/pokedex?limit=${data.page.limit}&offset=${(data.page.offset ?? 0) + data.page.limit}`}
            className="px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            Next
          </Link>
        )}
      </div>
    </div>
  );
}

