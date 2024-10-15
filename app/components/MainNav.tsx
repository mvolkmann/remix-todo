import {Form, NavLink, useNavigation} from '@remix-run/react';

type Props = {
  username: string;
};

export default function MainNav({username}: Props) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <nav id="main-nav">
      <Form method="post" id="nav-form">
        <ul>
          <li className="nav-item">
            <NavLink to="/">Home</NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/demo">Demo</NavLink>
          </li>
          <li className="nav-item">
            {/* Using prefetch="intent" causes todos to load on hover,
                before the click. */}
            <NavLink prefetch="intent" to="/todos">
              Todos
            </NavLink>
          </li>
          {username && (
            <li className="nav-item">
              <button disabled={isSubmitting} name="intent" value="sign-out">
                Sign Out
              </button>
            </li>
          )}
        </ul>
      </Form>
    </nav>
  );
}
