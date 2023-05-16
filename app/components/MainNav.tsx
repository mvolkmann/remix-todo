import { NavLink } from "@remix-run/react";

function MainNav() {
  return (
    <nav id="main-nav">
      <Form action="post" id="nav-form">
        <ul>
          <li className="nav-item">
            <NavLink to="/">Home</NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/demo">Demo</NavLink>
          </li>
          <li className="nav-item">
            <NavLink prefetch="intent" to="/todos">Todos</NavLink>
          </li>
        </ul>
      </Form>
    </nav >
  );
}

export default MainNav;
