import * as React from 'react';
import { type PokemonType, type PokemonSummary } from '@scdevelop/models';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from './context-menu';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from './dropdown-menu';
import { cn } from './utils';

// Pokemon type colors (official palette)
const typeToColor: Record<PokemonType, string> = {
  normal: '#a8a77a',
  fire: '#ee8130',
  water: '#6390f0',
  electric: '#f7d02c',
  grass: '#7ac74c',
  ice: '#96d9d6',
  fighting: '#c22e28',
  poison: '#a33ea1',
  ground: '#e2bf65',
  flying: '#a98ff3',
  psychic: '#f95587',
  bug: '#a6b91a',
  rock: '#b6a136',
  ghost: '#735797',
  dragon: '#6f35fc',
  dark: '#705746',
  steel: '#b7b7ce',
  fairy: '#d685ad'
};

// ============================================================================
// Pokemon-specific Components
// ============================================================================

export function PokemonTypeBadge(props: { type: PokemonType; className?: string; label?: string }) {
  const { type, className, label } = props;
  const background = typeToColor[type];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-white shadow-sm',
        className
      )}
      style={{ backgroundColor: background }}
      aria-label={label ?? `${type} type`}
    >
      {label ?? type}
    </span>
  );
}

export function PokemonCardSkeleton(props: { primaryType?: PokemonType; className?: string }) {
  const bg = props.primaryType ? typeToColor[props.primaryType] : '#6366f1';
  return (
    <div
      className={cn(
        'rounded-lg shadow-sm border border-black/5 dark:border-white/10 p-4 flex flex-col h-full',
        props.className
      )}
      style={{ backgroundColor: bg }}
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

export function PokemonCard(props: { 
  pokemon: PokemonSummary; 
  className?: string; 
  onContextMenu?: (e: React.MouseEvent) => void 
}) {
  const { pokemon, className, onContextMenu } = props;
  const primaryType = pokemon.types[0];
  const typeColor = typeToColor[primaryType];
  
  return (
    <article
      className={cn(
        'rounded-lg shadow-md border border-black/5 dark:border-white/10 p-3 flex flex-col h-full',
        'transition-transform hover:scale-105 cursor-pointer',
        className
      )}
      style={{ backgroundColor: typeColor }}
      role="article"
      aria-label={`${pokemon.name} card`}
      onContextMenu={onContextMenu}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-white/90 text-xs font-bold">
          #{String(pokemon.number).padStart(3, '0')}
        </span>
        <div className="flex gap-1">
          {pokemon.types.map((t) => (
            <PokemonTypeBadge 
              key={t} 
              type={t} 
              className="!px-1.5 !py-0.5 !text-[10px]" 
            />
          ))}
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center bg-white/20 rounded-md mb-2 min-h-[120px]">
        <img 
          src={pokemon.artworkUrl} 
          alt="" 
          className="w-full h-full object-contain p-2" 
          loading="lazy" 
        />
      </div>
      <h3 className="text-sm font-bold text-white drop-shadow-sm capitalize text-center truncate">
        {pokemon.name}
      </h3>
    </article>
  );
}

// ============================================================================
// Navigation Components
// ============================================================================

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
      className={cn(
        'fixed bottom-0 inset-x-0 z-40 border-t border-black/5 dark:border-white/10',
        'bg-white/90 dark:bg-neutral-900/90 backdrop-blur',
        'supports-[backdrop-filter]:bg-white/60 supports-[backdrop-filter]:dark:bg-neutral-900/60',
        className
      )}
      aria-label="Bottom navigation"
    >
      <ul className="flex items-stretch justify-between px-2 py-1">
        {items.map((item) => (
          <li key={item.key} className="flex-1">
            {item.href ? (
              <a
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 py-2 text-xs',
                  item.isActive 
                    ? 'text-[--color-accent]' 
                    : 'text-neutral-500 dark:text-neutral-400'
                )}
                aria-current={item.isActive ? 'page' : undefined}
              >
                {item.icon}
                <span>{item.label}</span>
              </a>
            ) : (
              <button
                type="button"
                onClick={item.onClick}
                className={cn(
                  'w-full flex flex-col items-center justify-center gap-1 py-2 text-xs',
                  item.isActive 
                    ? 'text-[--color-accent]' 
                    : 'text-neutral-500 dark:text-neutral-400'
                )}
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

export interface SidebarNavItem extends BottomNavItem {}

export function SidebarNav(props: { items: SidebarNavItem[]; className?: string }) {
  const { items, className } = props;
  return (
    <nav
      className={cn(
        'h-full w-64 border-r border-black/5 dark:border-white/10',
        'bg-white/80 dark:bg-neutral-900/80 backdrop-blur',
        className
      )}
      aria-label="Sidebar navigation"
    >
      <ul className="p-2 space-y-1">
        {items.map((item) => (
          <li key={item.key}>
            {item.href ? (
              <a
                href={item.href}
                className={cn(
                  'flex items-center gap-2 rounded-md px-2 py-2 text-sm',
                  item.isActive 
                    ? 'bg-[--color-accent]/10 text-[--color-accent]' 
                    : 'text-neutral-700 dark:text-neutral-300'
                )}
                aria-current={item.isActive ? 'page' : undefined}
              >
                {item.icon}
                <span>{item.label}</span>
              </a>
            ) : (
              <button
                type="button"
                onClick={item.onClick}
                className={cn(
                  'w-full flex items-center gap-2 rounded-md px-2 py-2 text-sm',
                  item.isActive 
                    ? 'bg-[--color-accent]/10 text-[--color-accent]' 
                    : 'text-neutral-700 dark:text-neutral-300'
                )}
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

// ============================================================================
// Composed Components (using shadcn primitives)
// ============================================================================

export interface PokemonContextMenuItem {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
}

export function PokemonContextMenu(props: {
  children: React.ReactNode;
  items: PokemonContextMenuItem[];
}) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{props.children}</ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        {props.items.map((item, idx) => (
          <ContextMenuItem
            key={idx}
            onClick={item.onClick}
            className="gap-2"
          >
            {item.icon && <span className="w-4 h-4">{item.icon}</span>}
            <span>{item.label}</span>
          </ContextMenuItem>
        ))}
      </ContextMenuContent>
    </ContextMenu>
  );
}

export interface FilterOption {
  value: string;
  label: string;
  checked?: boolean;
}

export function FilterDropdown(props: {
  label: string;
  icon?: React.ReactNode;
  options: FilterOption[];
  onToggle: (value: string) => void;
  onClear?: () => void;
}) {
  const hasSelection = props.options.some((opt) => opt.checked);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2 rounded-md border text-sm font-medium',
            'hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors',
            hasSelection
              ? 'border-[--color-accent] text-[--color-accent] bg-[--color-accent]/5'
              : 'border-neutral-300 dark:border-neutral-700'
          )}
        >
          {props.icon}
          <span>{props.label}</span>
          {hasSelection && (
            <span className="px-1.5 py-0.5 rounded-full bg-[--color-accent] text-white text-xs">
              {props.options.filter((o) => o.checked).length}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-52 max-h-96 overflow-auto">
        {props.options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={option.checked}
            onCheckedChange={() => props.onToggle(option.value)}
          >
            {option.label}
          </DropdownMenuCheckboxItem>
        ))}
        {hasSelection && props.onClear && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={props.onClear}
              className="text-red-600 dark:text-red-400"
            >
              Clear filters
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ============================================================================
// Re-export shadcn components
// ============================================================================

export { Tabs, TabsList, TabsTrigger, TabsContent };
export { cn } from './utils';
