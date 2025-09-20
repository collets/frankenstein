import { ActionFunctionArgs, LoaderFunctionArgs, defer, useLoaderData, Await } from 'react-router-dom';
import { Suspense } from 'react';

export interface SessionInfo { userId: string | null; isGuest: boolean }
export interface StatValue { name: string; value: number }
export interface PokemonDetails { speciesId: number; number: number; name: string; types: string[]; artworkUrl: string; stats: StatValue[] }
export interface SpeciesMeta { description: string; genderRate: number }
export interface EvolutionNode { speciesId: number; name: string; children?: EvolutionNode[] }
export interface EvolutionChain { chain: EvolutionNode[] }

export interface DetailsData {
  session: SessionInfo;
  pokemon: PokemonDetails;
  species: SpeciesMeta;
  evolution?: Promise<EvolutionChain>;
  status: { inSquad: boolean; caught: boolean };
}

export async function loader({ params }: LoaderFunctionArgs) {
  const id = Number(params.id);
  const pokemon: PokemonDetails = {
    speciesId: id,
    number: id,
    name: `pokemon-${id}`,
    types: ['normal'],
    artworkUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
    stats: [
      { name: 'hp', value: 45 },
      { name: 'attack', value: 49 },
    ],
  };
  const species: SpeciesMeta = { description: 'A sample species.', genderRate: 4 };
  const evolution = new Promise<EvolutionChain>((resolve) => setTimeout(() => resolve({ chain: [{ speciesId: id, name: pokemon.name }] }), 250));
  return defer({
    session: { userId: null, isGuest: true },
    pokemon,
    species,
    evolution,
    status: { inSquad: false, caught: false },
  });
}

export async function action(_args: ActionFunctionArgs) {
  return null;
}

export default function PokemonDetails() {
  const data = useLoaderData() as DetailsData;
  return (
    <div>
      <h1>{data.pokemon.name}</h1>
      <img src={data.pokemon.artworkUrl} alt={data.pokemon.name} width={160} height={160} />
      <div>Types: {data.pokemon.types.join(', ')}</div>
      <h2>Species</h2>
      <p>{data.species.description}</p>
      <h2>Evolution</h2>
      <Suspense fallback={<div>Loading evolution…</div>}>
        <Await resolve={data.evolution} errorElement={<div>Failed to load evolution</div>}>
          {(evo) => <pre>{JSON.stringify(evo, null, 2)}</pre>}
        </Await>
      </Suspense>
    </div>
  );
}

