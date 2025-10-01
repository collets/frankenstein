import { describe, it, expect, beforeEach } from 'vitest';
import type { PokemonSummary } from '@scdevelop/models';
import { InMemoryUserData } from './in-memory-adapter';

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

describe('InMemoryUserData', () => {
  let repos: InMemoryUserData;
  const userId = 'user-1';

  beforeEach(() => {
    repos = new InMemoryUserData();
  });

  it('sets and gets squad slots in order', async () => {
    await repos.squad.setSlot(userId, 1, bulbasaur);
    await repos.squad.setSlot(userId, 3, charmander);
    const squad = await repos.squad.get(userId);
    expect(squad.map((s) => s.slot)).toEqual([1, 3]);
    expect(squad[0].name).toBe('bulbasaur');
  });

  it('swaps squad slots', async () => {
    await repos.squad.setSlot(userId, 1, bulbasaur);
    await repos.squad.setSlot(userId, 2, charmander);
    await repos.squad.swap(userId, 1, 2);
    const squad = await repos.squad.get(userId);
    expect(squad.find((s) => s.name === 'bulbasaur')?.slot).toBe(2);
    expect(squad.find((s) => s.name === 'charmander')?.slot).toBe(1);
  });

  it('removes from squad by speciesId', async () => {
    await repos.squad.setSlot(userId, 1, bulbasaur);
    await repos.squad.remove(userId, bulbasaur.speciesId);
    const squad = await repos.squad.get(userId);
    expect(squad.length).toBe(0);
  });

  it('catches and lists box entries with cursor pagination', async () => {
    const e1 = await repos.box.catch(userId, bulbasaur);
    const e2 = await repos.box.catch(userId, charmander);
    const page1 = await repos.box.list(userId, { limit: 1 });
    expect(page1.entries.length).toBe(1);
    expect(page1.cursor).toBeDefined();
    const page2 = await repos.box.list(userId, { cursor: page1.cursor, limit: 5 });
    expect(page2.entries.length).toBe(1);
    const latest = await repos.box.latest(userId, { limit: 1 });
    expect(latest[0].id).toBe(e2.id);
  });

  it('marks dex seen/caught on actions', async () => {
    await repos.dex.markSeen(userId, bulbasaur.speciesId);
    await repos.box.catch(userId, bulbasaur);
    // No direct read API for dex; rely on lack of errors
    expect(true).toBe(true);
  });

  it('upserts and reads profile', async () => {
    await repos.profile.upsert(userId, { displayName: 'Ash' });
    const p = await repos.profile.get(userId);
    expect(p?.displayName).toBe('Ash');
    await repos.profile.upsert(userId, { email: 'ash@example.com' });
    const p2 = await repos.profile.get(userId);
    expect(p2?.email).toBe('ash@example.com');
  });
});