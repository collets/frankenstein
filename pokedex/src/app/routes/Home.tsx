import { LoaderFunctionArgs, useLoaderData } from 'react-router-dom';
import { PokemonCard, PokemonTypeBadge } from '@scdevelop/ui';
import type { PokemonType } from '@scdevelop/models';

export interface SessionInfo { userId: string | null; isGuest: boolean }
export interface PokemonSummary { speciesId: number; number: number; name: string; types: PokemonType[]; artworkUrl: string }
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Home</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {data.session.isGuest ? 'Playing as guest' : `Welcome, ${data.session.userId}`}
        </p>
      </div>
      
      {/* Hero Pokemon */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Your Hero</h2>
        <div className="max-w-sm">
          <PokemonCard pokemon={data.hero} />
        </div>
      </section>
      
      {/* Squad Grid */}
      {data.squad.length > 1 && (
        <section>
          <h2 className="text-xl font-semibold mb-3">Your Squad</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.squad.slice(1).map((pokemon) => (
              <PokemonCard key={pokemon.speciesId} pokemon={pokemon} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

