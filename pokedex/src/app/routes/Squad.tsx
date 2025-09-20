import { ActionFunctionArgs, LoaderFunctionArgs, useLoaderData } from 'react-router-dom';

export interface SessionInfo { userId: string | null; isGuest: boolean }
export interface SquadSlot { slot: 1|2|3|4|5|6; speciesId: number; number: number; name: string; types: string[]; artworkUrl: string }
export interface BoxEntry { id: string; addedAt: string; speciesId: number; number: number; name: string; types: string[]; artworkUrl: string }

export interface SquadData {
  session: SessionInfo;
  squad: SquadSlot[];
  latestCaught: BoxEntry[];
}

export async function loader(): Promise<SquadData> {
  return {
    session: { userId: null, isGuest: true },
    squad: [],
    latestCaught: [],
  };
}

export async function action(_args: ActionFunctionArgs) {
  return null;
}

export default function Squad() {
  const data = useLoaderData() as SquadData;
  return (
    <div>
      <h1>Squad</h1>
      <div>Slots used: {data.squad.length}/6</div>
    </div>
  );
}

