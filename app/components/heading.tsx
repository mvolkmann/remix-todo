import styles from "./Heading.css";

// Remix only looks for "links" and "meta" functions in route components.
// So users of this component need to call this function to get the array
// and spread it into their own links array.
// This pattern is called "surfacing links" in the Remix docs.
export const links = () => [{ rel: "stylesheet", href: styles }];

// This is used in root.tsx so it appears on every page.
export default function Heading() {
  return (
    <div className="heading">
      <h2>My Heading</h2>
    </div>
  );
}
