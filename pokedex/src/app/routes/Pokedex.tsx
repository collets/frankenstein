import { ActionFunctionArgs, LoaderFunctionArgs, useLoaderData, Form } from 'react-router-dom';

export interface SessionInfo { userId: string | null; isGuest: boolean }
export interface PageInfo { limit: number; offset?: number }
export interface Filters { types?: string[]; generations?: number[]; sort?: 'name'|'number'|'type'|'generation'|'stats' }

interface Entry { speciesId: number; number: number; visibleName?: string; visibleTypes?: string[]; silhouette: boolean }

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
  const entries: Entry[] = Array.from({ length: limit }, (_, i) => {
    const id = offset + i + 1;
    const name = `pokemon-${id}`;
    return { speciesId: id, number: id, visibleName: name, visibleTypes: ['normal'], silhouette: false };
  }).filter(e => (q ? e.visibleName?.includes(q) : true));
  return {
    session: { userId: null, isGuest: true },
    page: { limit, offset },
    filters: {},
    entries,
  };
}

export async function action(_args: ActionFunctionArgs) {
  return null;
}

export default function Pokedex() {
  const data = useLoaderData() as PokedexData;
  return (
    <div>
      <h1>Pokedex</h1>
      <Form method="get">
        <input name="q" placeholder="Search" />
        <button type="submit">Search</button>
      </Form>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginTop: 12 }}>
        {data.entries.map((e) => (
          <div key={e.speciesId} style={{ border: '1px solid #eee', padding: 8 }}>
            <div>#{e.number}</div>
            <div>{e.visibleName}</div>
            <div>{e.visibleTypes?.join(', ')}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

