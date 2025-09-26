import type { PokemonSummary } from '@scdevelop/models';
import { PokemonCard, PokemonCardSkeleton, PokemonTypeBadge, BottomNav, SidebarNav, Tabs, TabsList, TabsTrigger, TabsContent } from './ui';

export function DemoShowcase() {
	const sample: PokemonSummary = {
		speciesId: 25,
		number: 25,
		name: 'Pikachu',
		types: ['electric'],
		artworkUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
	};

	return (
		<div className="p-4 space-y-6">
			<div className="space-x-2">
				<PokemonTypeBadge type="electric" label="Electric" />
				<PokemonTypeBadge type="fairy" label="Fairy" />
			</div>
			<PokemonCardSkeleton primaryType="electric" />
			<PokemonCard pokemon={sample} />
			<div className="h-20" />
			<BottomNav
				items={[
					{ key: 'home', label: 'Home', href: '/', isActive: true },
					{ key: 'pokedex', label: 'Pokedex', href: '/pokedex' },
					{ key: 'squad', label: 'Squad', href: '/squad' },
					{ key: 'gens', label: 'Generations', href: '/generations' },
					{ key: 'user', label: 'User', href: '/user' },
				]}
			/>
			<div className="flex">
				<SidebarNav
					items={[
						{ key: 'home', label: 'Home', href: '/', isActive: true },
						{ key: 'pokedex', label: 'Pokedex', href: '/pokedex' },
					]}
				/>
				<div className="p-4">
					<Tabs defaultValue="about">
						<TabsList>
							<TabsTrigger value="about">About</TabsTrigger>
							<TabsTrigger value="stats">Stats</TabsTrigger>
						</TabsList>
						<TabsContent value="about">About content</TabsContent>
						<TabsContent value="stats">Stats content</TabsContent>
					</Tabs>
				</div>
			</div>
		</div>
	);
}

