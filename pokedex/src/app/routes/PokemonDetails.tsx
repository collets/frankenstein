import { ActionFunctionArgs, LoaderFunctionArgs, defer, useLoaderData, Await } from 'react-router-dom';
import { Suspense } from 'react';
import { PokeApi } from '@scdevelop/data-access/pokeapi';
import { PokemonCard, PokemonTypeBadge, Tabs, TabsList, TabsTrigger, TabsContent } from '@scdevelop/ui';
import type { PokemonDetails as PokemonDetailsType, SpeciesMeta, EvolutionChain } from '@scdevelop/models';

export interface SessionInfo { userId: string | null; isGuest: boolean }

export interface DetailsData {
  session: SessionInfo;
  pokemon: PokemonDetailsType;
  species: SpeciesMeta;
  evolution?: Promise<EvolutionChain>;
  status: { inSquad: boolean; caught: boolean };
}

export async function loader({ params }: LoaderFunctionArgs) {
  const id = Number(params.id);
  if (!id || isNaN(id)) {
    throw new Response('Invalid Pokemon ID', { status: 400 });
  }
  
  try {
    const pokemon = await PokeApi.getPokemon({ speciesId: id });
    const species = await PokeApi.getSpecies({ speciesId: id });
    const evolution = PokeApi.getEvolutionChain({ speciesId: id });
    
    return defer({
      session: { userId: null, isGuest: true },
      pokemon,
      species,
      evolution,
      status: { inSquad: false, caught: false },
    });
  } catch (error: any) {
    console.error('Failed to load pokemon details:', error);
    if (error?.code === 'NotFound') {
      throw new Response('Pokemon not found', { status: 404 });
    }
    throw new Response('Failed to load pokemon data', { status: 502 });
  }
}

export async function action(_args: ActionFunctionArgs) {
  return null;
}

export default function PokemonDetails() {
  const data = useLoaderData() as DetailsData;
  const primaryType = data.pokemon.types[0];
  const totalStats = data.pokemon.stats.reduce((sum, stat) => sum + stat.value, 0);
  
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <div className="absolute top-4 right-4 text-2xl font-bold text-white/80 drop-shadow-lg">
            #{String(data.pokemon.number).padStart(3, '0')}
          </div>
          <PokemonCard pokemon={data.pokemon} className="!p-8" />
        </div>
      </div>
      
      {/* Tabs Section */}
      <div className="max-w-4xl mx-auto">
        <Tabs defaultValue="about" className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
            <TabsTrigger value="evolution">Evolution</TabsTrigger>
          </TabsList>
          
          {/* About Tab */}
          <TabsContent value="about" className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-neutral-700 dark:text-neutral-300">{data.species.description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="card p-4">
                <h4 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">Types</h4>
                <div className="flex gap-2">
                  {data.pokemon.types.map((type) => (
                    <PokemonTypeBadge key={type} type={type} />
                  ))}
                </div>
              </div>
              
              <div className="card p-4">
                <h4 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">Gender Rate</h4>
                <p className="text-lg">
                  {data.species.genderRate === -1 ? 'Genderless' : 
                   `♀ ${(data.species.genderRate / 8 * 100).toFixed(0)}% / ♂ ${((8 - data.species.genderRate) / 8 * 100).toFixed(0)}%`}
                </p>
              </div>
            </div>
          </TabsContent>
          
          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-3">
            {data.pokemon.stats.map((stat) => (
              <div key={stat.name} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium capitalize">{stat.name}</span>
                  <span className="text-sm font-bold">{stat.value}</span>
                </div>
                <div className="h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[--color-accent] rounded-full"
                    style={{ width: `${Math.min(100, (stat.value / 255) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
            <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800">
              <div className="flex justify-between items-center">
                <span className="text-base font-semibold">Total</span>
                <span className="text-base font-bold">{totalStats}</span>
              </div>
            </div>
          </TabsContent>
          
          {/* Evolution Tab */}
          <TabsContent value="evolution">
            <Suspense fallback={<div className="py-8 text-center text-neutral-500">Loading evolution…</div>}>
              <Await resolve={data.evolution} errorElement={<div className="py-8 text-center text-red-500">Failed to load evolution</div>}>
                {(evo: EvolutionChain) => (
                  <div className="space-y-4">
                    {evo.chain.map((node, idx) => (
                      <div key={node.speciesId} className="card p-4">
                        <div className="flex items-center gap-3">
                          {idx > 0 && <span className="text-2xl">→</span>}
                          <div>
                            <p className="font-semibold capitalize">{node.name}</p>
                            {node.trigger && <p className="text-xs text-neutral-500">Trigger: {node.trigger}</p>}
                          </div>
                        </div>
                        {node.children && node.children.length > 0 && (
                          <div className="ml-8 mt-2 space-y-2">
                            {node.children.map((child) => (
                              <div key={child.speciesId} className="flex items-center gap-2">
                                <span className="text-xl">↳</span>
                                <p className="capitalize">{child.name}</p>
                                {child.trigger && <span className="text-xs text-neutral-500">({child.trigger})</span>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Await>
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

