import { describe, it, expect, beforeEach } from 'vitest';
import type { PokemonSummary } from '@scdevelop/models';
import { InMemoryUserData } from './in-memory-adapter';
import { InMemoryMigrationService } from './migration';

const bulbasaur: PokemonSummary = {
  speciesId: 1,
  number: 1,
  name: 'bulbasaur',
  types: ['grass', 'poison'],
  artworkUrl: 'https://img/1.png',
};

const charmander: PokemonSummary = {
  speciesId: 4,
  number: 4,
  name: 'charmander',
  types: ['fire'],
  artworkUrl: 'https://img/4.png',
};

describe('InMemoryMigrationService', () => {
  let repos: InMemoryUserData;
  let migration: InMemoryMigrationService;
  const guestId = 'guest-123';
  const userId = 'user-456';

  beforeEach(() => {
    repos = new InMemoryUserData();
    migration = new InMemoryMigrationService(repos);
  });

  it('merges guest squad into user free slots', async () => {
    await repos.squad.setSlot(guestId, 1, bulbasaur);
    await repos.squad.setSlot(guestId, 2, charmander);
    await repos.squad.setSlot(userId, 1, charmander);

    await migration.migrateGuestData(guestId, userId);

    const squad = await repos.squad.get(userId);
    expect(squad.length).toBeGreaterThan(1);
    expect(squad.find((s) => s.name === 'charmander')).toBeTruthy();
    expect(squad.find((s) => s.name === 'bulbasaur')).toBeTruthy();
  });

  it('appends guest box entries', async () => {
    await repos.box.catch(guestId, bulbasaur);
    await repos.box.catch(guestId, charmander);

    await migration.migrateGuestData(guestId, userId);

    const list = await repos.box.list(userId, { limit: 10 });
    expect(list.entries.length).toBe(2);
  });
});

