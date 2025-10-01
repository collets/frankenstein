# shadcn/ui Migration Plan

**Goal:** Replace custom Radix UI implementations with shadcn/ui components for better maintainability and consistency.

## Current State
- Using Radix UI primitives directly (Tabs, ContextMenu, DropdownMenu)
- Custom styling for each component
- Type colors in TypeScript constants

## Target State
- Use shadcn/ui components (pre-styled, copy-paste approach)
- Remove direct Radix dependencies where shadcn provides them
- Keep shadcn components in `ui/src/lib/` directory
- Maintain Pokemon-specific components (PokemonCard, PokemonTypeBadge)

## Components to Migrate

### From Custom Radix → shadcn/ui
1. **Tabs** → `shadcn add tabs`
2. **Context Menu** → `shadcn add context-menu`
3. **Dropdown Menu** → `shadcn add dropdown-menu`
4. **Button** (future-proof) → `shadcn add button`

### Keep Custom
- `PokemonCard` - domain-specific
- `PokemonTypeBadge` - domain-specific
- `PokemonCardSkeleton` - domain-specific
- `SidebarNav` - app-specific layout
- `BottomNav` - app-specific layout

## Migration Steps

### Phase 1: Setup shadcn
- [ ] Initialize shadcn in the `ui` library
- [ ] Configure components path to `ui/src/lib/`
- [ ] Add required shadcn components

### Phase 2: Replace Components
- [ ] Replace custom Tabs with shadcn Tabs
- [ ] Replace custom ContextMenu with shadcn ContextMenu
- [ ] Replace custom DropdownMenu (FilterDropdown) with shadcn DropdownMenu
- [ ] Update PokemonContextMenu to use shadcn primitives
- [ ] Update FilterDropdown to use shadcn primitives

### Phase 3: Update Consumers
- [ ] Update PokemonDetails.tsx to use new Tabs
- [ ] Update Pokedex.tsx to use new components
- [ ] Verify all imports work

### Phase 4: Cleanup
- [ ] Remove unused Radix dependencies
- [ ] Update tests if needed
- [ ] Build and verify

### Phase 5: Validation
- [ ] Run all tests
- [ ] Build all projects
- [ ] Visual verification

## Dependencies

### To Install
```bash
pnpm add -w class-variance-authority clsx tailwind-merge
```

### To Remove (after migration)
- None initially - shadcn uses Radix under the hood

## Notes
- shadcn copies components into your codebase (you own them)
- Can customize shadcn components as needed
- Better TypeScript support
- Consistent styling with Tailwind
