import { NavLink } from "@remix-run/react";

function MainNav() {
  return (
    <nav id="main-nav">
      <ul>
        <li className="nav-item">
          <NavLink to="/">Home</NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/demo">Demo</NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/todos">Todos</NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default MainNav;
