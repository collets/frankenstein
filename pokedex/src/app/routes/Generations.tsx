import { LoaderFunctionArgs, useLoaderData } from 'react-router-dom';

export interface SessionInfo { userId: string | null; isGuest: boolean }

export interface GenerationsData {
  session: SessionInfo;
  generations: Array<{ id: number; name: string; range: { fromNumber: number; toNumber: number } }>;
}

export async function loader(_args: LoaderFunctionArgs): Promise<GenerationsData> {
  return {
    session: { userId: null, isGuest: true },
    generations: [
      { id: 1, name: 'Generation I', range: { fromNumber: 1, toNumber: 151 } },
    ],
  };
}

export default function Generations() {
  const data = useLoaderData() as GenerationsData;
  return (
    <div>
      <h1>Generations</h1>
      <ul>
        {data.generations.map(g => (
          <li key={g.id}>{g.name} ({g.range.fromNumber}-{g.range.toNumber})</li>
        ))}
      </ul>
    </div>
  );
}

