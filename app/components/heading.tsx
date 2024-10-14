import type {ReactNode} from 'react';
import {type LinksFunction} from '@remix-run/node';

import tailwindStyles from '~/styles/tailwind.css?url';

type Props = {
  children: ReactNode;
};

export const links: LinksFunction = () => [
  {rel: 'stylesheet', href: tailwindStyles}
];

// This is used in demo.tsx and todos.tsx.
export default function Heading({children}: Props) {
  return (
    <div className="heading">
      <h2 className="text-3xl text-green-600">{children}</h2>
    </div>
  );
}
