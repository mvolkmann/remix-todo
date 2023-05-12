import Heading, { links as headingLinks } from "~/components/Heading";

import type { V2_MetaFunction } from "@remix-run/node";

export const links = () => [...headingLinks()];

export const meta: V2_MetaFunction = () => {
  return [{ title: "Todos" }];
};

export default function Todos() {
  return (
    <div className="todos">
      <Heading>Todos</Heading>
    </div>
  );
}
