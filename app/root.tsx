import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import styles from "~/styles/root.css";

/*
export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
];
*/

export const links = () => [{ rel: "stylesheet", href: styles }];

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
        {/* This renders the content of the current page. */}
        <Outlet />

        {/* This restores the scrollbar position
            when returning to a previous page. */}
        <ScrollRestoration />

        {/* This injects client-side JavaScript code. */}
        <Scripts />

        {/* This enables use of live reload so
            the browser updates when changes are saved. */}
        {process.env.NODE_ENV === "development" && <LiveReload />}
      </body>
    </html>
  );
}
