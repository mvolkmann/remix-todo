import type { V2_MetaFunction } from "@remix-run/node";

export const meta: V2_MetaFunction = () => {
  return [{ title: "Home" }];
};

export default function Home() {
  return (
    <div>
      <h1>Home</h1>
    </div>
  );
}
