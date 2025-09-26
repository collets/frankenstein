import { ActionFunctionArgs, LoaderFunctionArgs, useLoaderData, Form } from 'react-router-dom';

export interface SessionInfo { userId: string | null; isGuest: boolean }

export interface SettingsData {
  session: SessionInfo;
  preferences: { theme: 'system'|'light'|'dark'; accent: string };
}

export async function loader(_args: LoaderFunctionArgs): Promise<SettingsData> {
  return { session: { userId: null, isGuest: true }, preferences: { theme: 'system', accent: 'indigo' } };
}

export async function action(_args: ActionFunctionArgs) {
  return null;
}

export default function Settings() {
  const data = useLoaderData() as SettingsData;
  return (
    <div>
      <h1>Settings</h1>
      <Form method="post">
        <label>
          Theme
          <select name="theme" defaultValue={data.preferences.theme}>
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
        <label>
          Accent
          <input name="accent" defaultValue={data.preferences.accent} />
        </label>
        <button type="submit">Save</button>
      </Form>
    </div>
  );
}

