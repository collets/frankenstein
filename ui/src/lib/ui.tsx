import { type PokemonType, type PokemonSummary } from '@scdevelop/models';
import { Root as TabsRoot, List as TabsListPrimitive, Trigger as TabsTriggerPrimitive, Content as TabsContentPrimitive } from '@radix-ui/react-tabs';

const typeToCssVar: Record<PokemonType, string> = {
  normal: 'var(--color-type-normal)',
  fire: 'var(--color-type-fire)',
  water: 'var(--color-type-water)',
  electric: 'var(--color-type-electric)',
  grass: 'var(--color-type-grass)',
  ice: 'var(--color-type-ice)',
  fighting: 'var(--color-type-fighting)',
  poison: 'var(--color-type-poison)',
  ground: 'var(--color-type-ground)',
  flying: 'var(--color-type-flying)',
  psychic: 'var(--color-type-psychic)',
  bug: 'var(--color-type-bug)',
  rock: 'var(--color-type-rock)',
  ghost: 'var(--color-type-ghost)',
  dragon: 'var(--color-type-dragon)',
  dark: 'var(--color-type-dark)',
  steel: 'var(--color-type-steel)',
  fairy: 'var(--color-type-fairy)'
};

export function PokemonTypeBadge(props: { type: PokemonType; className?: string; label?: string }) {
  const { type, className, label } = props;
  const background = typeToCssVar[type];
  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-white shadow-sm',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ background }}
      aria-label={label ?? `${type} type`}
    >
      {label ?? type}
    </span>
  );
}

export function PokemonCardSkeleton(props: { primaryType?: PokemonType; className?: string }) {
  const bg = props.primaryType ? typeToCssVar[props.primaryType] : 'var(--color-accent)';
  return (
    <div
      className={[
        'rounded-[--radius-lg] shadow-sm border border-black/5 dark:border-white/10 bg-white dark:bg-neutral-900 p-4',
        props.className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ background: bg }}
      aria-busy
    >
      <div className="h-32 w-full bg-black/10 dark:bg-white/10 rounded-md animate-pulse" />
      <div className="mt-3 h-4 w-2/3 bg-black/10 dark:bg-white/10 rounded animate-pulse" />
      <div className="mt-2 flex gap-2">
        <span className="h-6 w-16 bg-black/10 dark:bg-white/10 rounded-full animate-pulse" />
        <span className="h-6 w-16 bg-black/10 dark:bg-white/10 rounded-full animate-pulse" />
      </div>
    </div>
  );
}

export function PokemonCard(props: { pokemon: PokemonSummary; className?: string }) {
  const { pokemon, className } = props;
  const primaryType = pokemon.types[0];
  const gradientStart = typeToCssVar[primaryType];
  const gradientEnd = 'color-mix(in oklab, var(--color-accent) 40%, transparent)';
  return (
    <article
      className={[
        'rounded-[--radius-lg] shadow-sm border border-black/5 dark:border-white/10 bg-white dark:bg-neutral-900 p-4',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ background: `linear-gradient(180deg, ${gradientStart}, ${gradientEnd})` }}
      role="article"
      aria-label={`${pokemon.name} card`}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold text-white drop-shadow-sm">{pokemon.name}</h3>
          <div className="mt-1 flex gap-1">
            {pokemon.types.map((t) => (
              <PokemonTypeBadge key={t} type={t} label={t} />
            ))}
          </div>
        </div>
        <span className="text-white/80 text-sm">#{String(pokemon.number).padStart(3, '0')}</span>
      </div>
      <div className="mt-3 aspect-square rounded-md overflow-hidden bg-white/20">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={pokemon.artworkUrl} alt="" className="h-full w-full object-contain" loading="lazy" />
      </div>
    </article>
  );
}

// Bottom navigation (mobile)
export interface BottomNavItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  isActive?: boolean;
  onClick?: () => void;
}

export function BottomNav(props: { items: BottomNavItem[]; className?: string }) {
  const { items, className } = props;
  return (
    <nav
      className={[
        'fixed bottom-0 inset-x-0 z-40 border-t border-black/5 dark:border-white/10 bg-white/90 dark:bg-neutral-900/90 backdrop-blur supports-[backdrop-filter]:bg-white/60 supports-[backdrop-filter]:dark:bg-neutral-900/60',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label="Bottom navigation"
    >
      <ul className="flex items-stretch justify-between px-2 py-1">
        {items.map((item) => (
          <li key={item.key} className="flex-1">
            {item.href ? (
              <a
                href={item.href}
                className={[
                  'flex flex-col items-center justify-center gap-1 py-2 text-xs',
                  item.isActive ? 'text-[--color-accent]' : 'text-neutral-500 dark:text-neutral-400',
                ].join(' ')}
              >
                {item.icon}
                <span>{item.label}</span>
              </a>
            ) : (
              <button
                type="button"
                onClick={item.onClick}
                className={[
                  'w-full flex flex-col items-center justify-center gap-1 py-2 text-xs',
                  item.isActive ? 'text-[--color-accent]' : 'text-neutral-500 dark:text-neutral-400',
                ].join(' ')}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

// Sidebar navigation (desktop)
export interface SidebarNavItem extends BottomNavItem {}

export function SidebarNav(props: { items: SidebarNavItem[]; className?: string }) {
  const { items, className } = props;
  return (
    <nav
      className={[
        'h-full w-64 border-r border-black/5 dark:border-white/10 bg-white/80 dark:bg-neutral-900/80 backdrop-blur',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label="Sidebar navigation"
    >
      <ul className="p-2 space-y-1">
        {items.map((item) => (
          <li key={item.key}>
            {item.href ? (
              <a
                href={item.href}
                className={[
                  'flex items-center gap-2 rounded-md px-2 py-2 text-sm',
                  item.isActive ? 'bg-[--color-accent]/10 text-[--color-accent]' : 'text-neutral-700 dark:text-neutral-300',
                ].join(' ')}
              >
                {item.icon}
                <span>{item.label}</span>
              </a>
            ) : (
              <button
                type="button"
                onClick={item.onClick}
                className={[
                  'w-full flex items-center gap-2 rounded-md px-2 py-2 text-sm',
                  item.isActive ? 'bg-[--color-accent]/10 text-[--color-accent]' : 'text-neutral-700 dark:text-neutral-300',
                ].join(' ')}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

// Tabs (Radix UI)
export const Tabs = TabsRoot;
export const TabsList = (props: React.ComponentProps<typeof TabsListPrimitive>) => (
  <TabsListPrimitive
    {...props}
    className={[
      'inline-flex items-center justify-center rounded-[--radius-md] bg-black/5 dark:bg-white/10 p-1 text-sm',
      props.className,
    ]
      .filter(Boolean)
      .join(' ')}
  />
);
export const TabsTrigger = (props: React.ComponentProps<typeof TabsTriggerPrimitive>) => (
  <TabsTriggerPrimitive
    {...props}
    className={[
      'inline-flex items-center justify-center rounded-[--radius-sm] px-3 py-1.5 data-[state=active]:bg-white data-[state=active]:text-neutral-900 dark:data-[state=active]:bg-neutral-800 dark:data-[state=active]:text-white',
      props.className,
    ]
      .filter(Boolean)
      .join(' ')}
  />
);
export const TabsContent = (props: React.ComponentProps<typeof TabsContentPrimitive>) => (
  <TabsContentPrimitive {...props} className={['mt-3', props.className].filter(Boolean).join(' ')} />
);

