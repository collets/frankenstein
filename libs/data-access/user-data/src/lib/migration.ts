import type { UserDataRepos } from './interfaces';

export class InMemoryMigrationService {
  constructor(private readonly repos: UserDataRepos) {}

  async migrateGuestData(guestId: string, userId: string): Promise<void> {
    if (!guestId || !userId) return;

    // Merge squad: prefer existing user slots, fill remaining with guest picks in slot order
    const userSquad = await this.repos.squad.get(userId);
    const guestSquad = await this.repos.squad.get(guestId);
    const occupied = new Set(userSquad.map((s) => s.slot));
    for (const g of guestSquad) {
      // find first free slot
      let assigned = false;
      for (let slot = 1 as 1 | 2 | 3 | 4 | 5 | 6; slot <= 6; slot = (slot + 1) as any) {
        if (!occupied.has(slot)) {
          await this.repos.squad.setSlot(userId, slot, g);
          occupied.add(slot);
          assigned = true;
          break;
        }
      }
      if (!assigned) break; // full
    }

    // Merge box: append all guest entries (IDs are unique per store)
    const { entries: guestBox } = await this.repos.box.list(guestId, { limit: Number.MAX_SAFE_INTEGER });
    for (const e of guestBox) {
      await this.repos.box.catch(userId, e);
    }

    // Merge dex: OR flags, keep earliest timestamps
    const speciesIds = new Set<number>();
    for (const e of guestBox) speciesIds.add(e.speciesId);
    for (const s of await this.repos.squad.get(guestId)) speciesIds.add(s.speciesId);
    // also include user species to ensure timestamps are not lost
    for (const e of (await this.repos.box.list(userId, { limit: Number.MAX_SAFE_INTEGER })).entries)
      speciesIds.add(e.speciesId);
    for (const s of await this.repos.squad.get(userId)) speciesIds.add(s.speciesId);

    for (const speciesId of speciesIds) {
      // naive: mark seen/caught if any guest activity
      // In-memory repo does not store timestamps explicitly; we only ensure flags are set
      await this.repos.dex.markSeen(userId, speciesId);
    }
  }
}

