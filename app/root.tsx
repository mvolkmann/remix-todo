import {type ErrorBoundaryComponent, type LinksFunction} from '@remix-run/node';

import {
  type CatchBoundaryComponent,
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch
} from '@remix-run/react';

import MainNav from '~/components/MainNav';
import styles from '~/styles/global.css';

export const links: LinksFunction = () => [{rel: 'stylesheet', href: styles}];

// Remix creates this component when an error occurs.
// It replaces the content that would otherwise be rendered by <Outlet />.
// Defining this in the root component makes it usable from any page.
// This can also be defined differently in each page
// for page-specific error rendering.
// For page-specific error boundaries,
// only the body content should be specified.
export const ErrorBoundary: ErrorBoundaryComponent = ({error}) => {
  console.log('root.tsx ErrorBoundary: error =', error);
  return (
    <main className="error">
      <h1>An error occurred.</h1>
      <p>{error?.message ?? 'unknown'}</p>
      <p>
        Back to <Link to="/">safety</Link>.
      </p>
    </main>
  );
};

// This is similar to ErrorBoundary and like that we can define it
// in the root component or in pages for page-specific handling.
// Remix creates this component when a Response object is thrown.
// If anything other than an error is thrown
// then ErrorBoundary is used instead of CatchBoundary.
// One place this could be done is in a loader function.  For example:
// if (some-condition) {
//   throw json( // creates a Response object
//     {message: 'some-message'},
//     {status: 404, statusText: 'some-status-text'}
//   );
// }
export const CatchBoundary: CatchBoundaryComponent = () => {
  const response = useCatch();
  const message = response.data?.message || 'unspecified error';
  return (
    <main>
      <p>{message}</p>
    </main>
  );
};

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />

        {/* This injects additional meta tags. */}
        <Meta />

        {/* This injects additional link tags defined by
            "links" functions defined in routes like this one. */}
        <Links />
      </head>
      <body>
        {/* <AppContext.Provider value={username, setUsername, password, setPassword}> */}
        <header>
          <MainNav />
        </header>
        {/* This renders the content of the current page. */}
        <Outlet />

        {/* This restores the scrollbar position
            when returning to a previous page. */}
        <ScrollRestoration />

        {/* This injects client-side JavaScript code. */}
        <Scripts />

        {/* This enables use of live reload so
            the browser updates when changes are saved. */}
        {process.env.NODE_ENV === 'development' && <LiveReload />}
        {/* </AppContext.Provider> */}
      </body>
    </html>
  );
}
