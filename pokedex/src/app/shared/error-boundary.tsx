import { isRouteErrorResponse, useRouteError, Link } from 'react-router-dom';

export function RootErrorBoundary() {
  const error = useRouteError();
  if (isRouteErrorResponse(error)) {
    return (
      <div style={{ padding: 24 }}>
        <h1>Oops</h1>
        <p>
          {error.status} {error.statusText}
        </p>
        {error.data && <pre>{JSON.stringify(error.data, null, 2)}</pre>}
        <p>
          <Link to="/">Go home</Link>
        </p>
      </div>
    );
  }
  return (
    <div style={{ padding: 24 }}>
      <h1>Something went wrong</h1>
      {error instanceof Error ? (
        <pre>{error.message}</pre>
      ) : (
        <pre>{String(error)}</pre>
      )}
      <p>
        <Link to="/">Go home</Link>
      </p>
    </div>
  );
}

