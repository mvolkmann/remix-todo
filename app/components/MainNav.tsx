import {
  type ActionFunction,
  redirect
} from "@remix-run/node";

import {
  Form,
  NavLink,
  useNavigation
} from "@remix-run/react";

export const action: ActionFunction = async ({ request }) => {
  try {
    const formData = await request.formData();
    const intent = formData.get("intent") as string;
    console.log('login.tsx action: intent =', intent);

    switch (intent) {
      case "sign-out":
        return { formError: 'Forgot is not implemented yet.' }

    }
    return null; // stays on current page
  } catch (e) {
    console.error("todos.tsx action:", e);
  }
};

function MainNav() {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

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
          <li className="nav-item">
            <button
              disabled={isSubmitting}
              name="intent"
              value="sign-out"
            >
              Sign Out
            </button>
          </li>
        </ul>
      </Form>
    </nav >
  );
}

export default MainNav;
