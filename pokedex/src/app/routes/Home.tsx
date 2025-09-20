import { LoaderFunctionArgs, useLoaderData } from 'react-router-dom';

export interface SessionInfo { userId: string | null; isGuest: boolean }
export interface PokemonSummary { speciesId: number; number: number; name: string; types: string[]; artworkUrl: string }
export interface SquadSlot extends PokemonSummary { slot: 1|2|3|4|5|6 }

export interface HomeData {
  session: SessionInfo;
  squad: SquadSlot[];
  hero: PokemonSummary;
}

export async function loader(_args: LoaderFunctionArgs): Promise<HomeData> {
  // In-memory placeholder data
  const session: SessionInfo = { userId: null, isGuest: true };
  const hero: PokemonSummary = {
    speciesId: 25,
    number: 25,
    name: 'pikachu',
    types: ['electric'],
    artworkUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
  };
  const squad: SquadSlot[] = [
    { slot: 1, ...hero },
  ];
  return { session, squad, hero };
}

export default function Home() {
  const data = useLoaderData() as HomeData;
  return (
    <div>
      <h1>Home</h1>
      <p>Guest: {String(data.session.isGuest)}</p>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <img src={data.hero.artworkUrl} alt={data.hero.name} width={96} height={96} />
        <div>
          <div style={{ fontSize: 20, fontWeight: 600 }}>{data.hero.name}</div>
          <div>Types: {data.hero.types.join(', ')}</div>
        </div>
      </div>
    </div>
  );
}

