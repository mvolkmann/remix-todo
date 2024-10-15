import type {ReactNode} from 'react';
import {type LinksFunction} from '@remix-run/node';

//TODO: Why isn't it enough to import this in root.tsx?
//TODO: If this is removed then any route that uses this component won't render.
import tailwindStyles from '~/styles/tailwind.css?url';

type Props = {
  children: ReactNode;
};

export const links: LinksFunction = () => [
  {rel: 'stylesheet', href: tailwindStyles, as: 'style'}
];

// This is used in demo.tsx and todos.tsx.
export default function Heading({children}: Props) {
  return (
    <div className="heading">
      <h2 className="text-3xl text-green-600">{children}</h2>
    </div>
  );
}
