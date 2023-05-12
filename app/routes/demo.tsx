import type { V2_MetaFunction } from "@remix-run/node";

// Don't need file extension when importing JS/TS files.
import Heading, { links as headingLinks } from "~/components/Heading";

// If you placed demo.css in the "routes" directory, you will get the error
// "Cannot read properties of undefined (reading 'filter')".
// Do need file extension when importing CSS files.
import styles from "~/styles/demo.css";

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
