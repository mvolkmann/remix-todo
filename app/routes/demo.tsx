import type {LinksFunction, MetaFunction} from '@remix-run/node';

// Don't need file extension when importing JS/TS files.
import Heading, {links as headingLinks} from '~/components/Heading';

export const links: LinksFunction = () => [
  // This pattern is called "surfacing links" in the Remix docs.
  ...headingLinks()
];

export const meta: MetaFunction = () => {
  return [{title: 'Demo Page'}];
};

export default function Demo() {
  return (
    <div>
      <Heading>Demo Time!</Heading>
    </div>
  );
}
