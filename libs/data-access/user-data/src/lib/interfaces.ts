import type {
  BoxEntry,
  PokemonSummary,
  SquadSlot,
} from '@scdevelop/models';

export interface SquadRepo {
  get(userId: string): Promise<SquadSlot[]>;
  setSlot(
    userId: string,
    slot: SquadSlot['slot'],
    species: PokemonSummary,
  ): Promise<void>;
  swap(userId: string, a: SquadSlot['slot'], b: SquadSlot['slot']): Promise<void>;
  remove(userId: string, speciesId: number): Promise<void>;
}

export interface BoxRepo {
  list(
    userId: string,
    args: { cursor?: string; limit?: number },
  ): Promise<{ entries: BoxEntry[]; cursor?: string }>;
  latest(userId: string, args?: { limit?: number }): Promise<BoxEntry[]>;
  catch(userId: string, species: PokemonSummary): Promise<BoxEntry>;
  free(userId: string, entryId: string): Promise<void>;
}

export interface DexRepo {
  markSeen(userId: string, speciesId: number): Promise<void>;
  markCaught(userId: string, speciesId: number): Promise<void>;
}

export interface ProfileRepo {
  get(userId: string): Promise<{ displayName?: string; email?: string } | undefined>;
  upsert(
    userId: string,
    profile: { displayName?: string; email?: string },
  ): Promise<void>;
}

export interface MigrationService {
  migrateGuestData(guestId: string, userId: string): Promise<void>;
}

export interface UserDataRepos {
  squad: SquadRepo;
  box: BoxRepo;
  dex: DexRepo;
  profile: ProfileRepo;
}

