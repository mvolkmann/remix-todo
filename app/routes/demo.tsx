import type { V2_MetaFunction } from "@remix-run/node";

import Heading, { links as headingLinks } from "~/components/heading"; // don't need file extension
import styles from "~/styles/demo.css"; // do need file extension for CSS

export const links = () => [
  { rel: "stylesheet", href: styles },
  // This pattern is called "surfacing links" in the Remix docs.
  ...headingLinks(),
];

export const meta: V2_MetaFunction = () => {
  return [{ title: "Demo Page" }];
};

export default function Demo() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h1>Demo time!</h1>

      <Heading />
    </div>
  );
}
