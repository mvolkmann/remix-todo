import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration
} from '@remix-run/react';
import {type LinksFunction} from '@remix-run/node';

import MainNav from '~/components/MainNav';
import styles from '~/styles/global.css?url';

export const links: LinksFunction = () => [{rel: 'stylesheet', href: styles}];

export function Layout({children}: {children: React.ReactNode}) {
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

        {children}

        {/* This restores the scrollbar position
            when returning to a previous page. */}
        <ScrollRestoration />

        {/* This injects client-side JavaScript code. */}
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
