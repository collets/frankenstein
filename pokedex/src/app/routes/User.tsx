import { ActionFunctionArgs, LoaderFunctionArgs, useLoaderData } from 'react-router-dom';

export interface SessionInfo { userId: string | null; isGuest: boolean }

export interface UserData {
  session: SessionInfo;
  profile?: { displayName?: string; email?: string };
}

export async function loader(): Promise<UserData> {
  return { session: { userId: null, isGuest: true } };
}

export async function action(_args: ActionFunctionArgs) {
  return null;
}

export default function User() {
  const data = useLoaderData() as UserData;
  return (
    <div>
      <h1>User</h1>
      {data.session.userId ? (
        <div>Signed in</div>
      ) : (
        <div>Guest mode</div>
      )}
    </div>
  );
}

