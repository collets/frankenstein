import { ActionFunctionArgs, LoaderFunctionArgs, useLoaderData } from 'react-router-dom';

export interface SessionInfo { userId: string | null; isGuest: boolean }
export interface BoxEntry { id: string; addedAt: string; speciesId: number; number: number; name: string; types: string[]; artworkUrl: string }

export interface BoxData {
  session: SessionInfo;
  page: { limit: number; cursor?: string };
  entries: BoxEntry[];
}

export async function loader(_args: LoaderFunctionArgs): Promise<BoxData> {
  return {
    session: { userId: null, isGuest: true },
    page: { limit: 24 },
    entries: [],
  };
}

export async function action(_args: ActionFunctionArgs) {
  return null;
}

export default function Box() {
  const data = useLoaderData() as BoxData;
  return (
    <div>
      <h1>Box</h1>
      <div>Total entries: {data.entries.length}</div>
    </div>
  );
}

