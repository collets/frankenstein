import { randomUUID } from 'node:crypto';
import type {
  BoxEntry,
  PokemonSummary,
  SquadSlot,
} from '@scdevelop/models';
import type {
  BoxRepo,
  DexRepo,
  ProfileRepo,
  SquadRepo,
  UserDataRepos,
} from './interfaces';

interface InMemoryUserPartition {
  squadBySlot: Map<SquadSlot['slot'], SquadSlot>;
  boxEntries: BoxEntry[]; // newest last
  dex: Map<number, { seen: boolean; caught: boolean; seenAt?: string; caughtAt?: string }>;
  profile?: { displayName?: string; email?: string; createdAt: string; updatedAt: string };
}

export class InMemoryUserData implements UserDataRepos {
  private partitions: Map<string, InMemoryUserPartition> = new Map();

  public squad: SquadRepo = {
    get: async (userId) => {
      const p = this.ensure(userId);
      return [1, 2, 3, 4, 5, 6]
        .map((s) => p.squadBySlot.get(s as SquadSlot['slot']))
        .filter(Boolean) as SquadSlot[];
    },
    setSlot: async (userId, slot, species) => {
      const p = this.ensure(userId);
      const now = new Date().toISOString();
      p.squadBySlot.set(slot, { ...species, slot });
      // read-your-writes ensured by returning after mutation
    },
    swap: async (userId, a, b) => {
      const p = this.ensure(userId);
      const aVal = p.squadBySlot.get(a);
      const bVal = p.squadBySlot.get(b);
      if (aVal) p.squadBySlot.set(b, { ...aVal, slot: b }); else p.squadBySlot.delete(b);
      if (bVal) p.squadBySlot.set(a, { ...bVal, slot: a }); else p.squadBySlot.delete(a);
    },
    remove: async (userId, speciesId) => {
      const p = this.ensure(userId);
      for (const [slot, val] of p.squadBySlot) {
        if (val.speciesId === speciesId) {
          p.squadBySlot.delete(slot);
        }
      }
    },
  };

  public box: BoxRepo = {
    list: async (userId, args) => {
      const p = this.ensure(userId);
      const limit = args.limit ?? 20;
      const startIndex = args.cursor ? Number(args.cursor) : 0;
      const slice = p.boxEntries.slice(startIndex, startIndex + limit);
      const nextIndex = startIndex + slice.length;
      const cursor = nextIndex < p.boxEntries.length ? String(nextIndex) : undefined;
      return { entries: slice, cursor };
    },
    latest: async (userId, args) => {
      const p = this.ensure(userId);
      const limit = args?.limit ?? 6;
      return p.boxEntries.slice(-limit).reverse();
    },
    catch: async (userId, species) => {
      const p = this.ensure(userId);
      const now = new Date().toISOString();
      const entry: BoxEntry = {
        ...species,
        id: randomUUID(),
        addedAt: now,
      };
      p.boxEntries.push(entry);
      const dex = p.dex.get(species.speciesId) ?? { seen: false, caught: false };
      dex.caught = true;
      dex.caughtAt = dex.caughtAt ?? now;
      p.dex.set(species.speciesId, dex);
      return entry;
    },
    free: async (userId, entryId) => {
      const p = this.ensure(userId);
      const idx = p.boxEntries.findIndex((e) => e.id === entryId);
      if (idx >= 0) p.boxEntries.splice(idx, 1);
      // If in squad, remove; this is acceptable O(6)
      for (const [slot, val] of p.squadBySlot) {
        if (val && p.boxEntries.every((e) => e.speciesId !== val.speciesId)) {
          // do nothing specifically; freeing does not auto-remove squad unless desired
        }
      }
    },
  };

  public dex: DexRepo = {
    markSeen: async (userId, speciesId) => {
      const p = this.ensure(userId);
      const now = new Date().toISOString();
      const record = p.dex.get(speciesId) ?? { seen: false, caught: false };
      record.seen = true;
      record.seenAt = record.seenAt ?? now;
      p.dex.set(speciesId, record);
    },
    markCaught: async (userId, speciesId) => {
      const p = this.ensure(userId);
      const now = new Date().toISOString();
      const record = p.dex.get(speciesId) ?? { seen: false, caught: false };
      record.caught = true;
      record.caughtAt = record.caughtAt ?? now;
      record.seen = true;
      record.seenAt = record.seenAt ?? now;
      p.dex.set(speciesId, record);
    },
  };

  public profile: ProfileRepo = {
    get: async (userId) => {
      const p = this.ensure(userId);
      if (!p.profile) return undefined;
      const { displayName, email } = p.profile;
      return { displayName, email };
    },
    upsert: async (userId, profile) => {
      const p = this.ensure(userId);
      const now = new Date().toISOString();
      if (!p.profile) {
        p.profile = { ...profile, createdAt: now, updatedAt: now };
      } else {
        p.profile = { ...p.profile, ...profile, updatedAt: now };
      }
    },
  };

  private ensure(userId: string): InMemoryUserPartition {
    const existing = this.partitions.get(userId);
    if (existing) return existing;
    const fresh: InMemoryUserPartition = {
      squadBySlot: new Map(),
      boxEntries: [],
      dex: new Map(),
      profile: undefined,
    };
    this.partitions.set(userId, fresh);
    return fresh;
  }
}

