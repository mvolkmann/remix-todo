import {
  type ActionFunction,
  type LinksFunction,
  type LoaderFunctionArgs,
  json,
  redirect
} from '@remix-run/node';
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData
} from '@remix-run/react';

import MainNav from '~/components/MainNav';
import globalStyles from '~/styles/global.css?url';
import tailwindStyles from '~/styles/tailwind.css?url';
import {commitSession, getSession} from './sessions';

export const links: LinksFunction = () => [
  {rel: 'stylesheet', href: tailwindStyles, as: 'style'},
  {rel: 'stylesheet', href: globalStyles, as: 'style'}
];

export const action: ActionFunction = async ({request}) => {
  try {
    const formData = await request.formData();
    const intent = formData.get('intent') as string;
    switch (intent) {
      case 'sign-out':
        console.log('MainNav.tsx action: got sign-out intent');
        const session = await getSession(request.headers.get('Cookie'));
        session.set('username', '');
        return redirect('/login', {
          headers: {'Set-Cookie': await commitSession(session)}
        });
    }
    return {}; // stays on current page
  } catch (e) {
    console.error('MainNav.tsx action:', e);
  }
};

export async function loader({request}: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get('Cookie'));
  const username = session.get('username') ?? '';
  return json({username});
}

// This must be named "Layout" so Remix will
// use it as a template for every route.
export function Layout({children}: {children: React.ReactNode}) {
  const data = useLoaderData<typeof loader>();
  const {username} = data ?? {};
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
      <body className="font-sans m-4">
        {/* <AppContext.Provider value={username, setUsername, password, setPassword}> */}
        <header>
          <MainNav username={username} />
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
