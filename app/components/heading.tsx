import type {ReactNode} from 'react';
import type {LinksFunction} from '@remix-run/node';
import styles from './Heading.css';

// Remix only looks for "links" and "meta" functions in route components.
// So users of this component need to call this function to get the array
// of links and spread it into their own links array.
// This pattern is called "surfacing links" in the Remix docs.
export const links: LinksFunction = () => [{rel: 'stylesheet', href: styles}];

type Props = {
  children: ReactNode;
};

// This is used in demo.tsx and todos.tsx.
export default function Heading({children}: Props) {
  return (
    <div className="heading">
      <h2>{children}</h2>
    </div>
  );
}
