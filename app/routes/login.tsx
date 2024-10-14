// import { useContext } from 'react';
import {
  type ActionFunction,
  type LinksFunction,
  type MetaFunction,
  redirect
} from '@remix-run/node';

import {Form, useActionData, useNavigation} from '@remix-run/react';

// import AppContext from '~/AppContext';
import styles from '~/styles/login.css?url';

type ActionData = {
  fields: {password?: string; username?: string};
  fieldErrors: {password?: string; username?: string};
  formError?: string;
};

export const links: LinksFunction = () => [{rel: 'stylesheet', href: styles}];

export const meta: MetaFunction = () => {
  return [{title: 'Login'}];
};

export const action: ActionFunction = async ({request}) => {
  try {
    const formData = await request.formData();
    const intent = formData.get('intent') as string;
    console.log('login.tsx action: intent =', intent);

    switch (intent) {
      case 'forgot':
        return {formError: 'Forgot is not implemented yet.'};

      case 'sign-in':
        const username = formData.get('username') as string;
        const password = formData.get('password') as string;
        const fieldErrors = {
          password: validatePassword(password),
          username: validateUsername(username)
        };
        if (Object.values(fieldErrors).some(Boolean)) {
          return {formError: 'Invalid sign in data.', fieldErrors};
        }
        const authenticated = username == 'username' && password == 'password';
        if (!authenticated) {
          return {formError: 'Invalid username or password.'};
        }
        return redirect('/home');

      case 'sign-up':
        return {formError: 'Sign up is not implemented yet.'};
    }
    return null; // stays on current page
  } catch (e) {
    console.error('login.tsx action:', e);
  }
};

function validatePassword(password: string) {
  if (password.length < 8) {
    return 'Password must be at least eight characters.';
  }
}

function validateUsername(username: string) {
  if (username.length < 8) {
    return 'Username must be at least eight characters.';
  }
}

export default function Login() {
  // const { username, setUsername } = useContext(AppContext);
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  const {formError, fieldErrors} = actionData ?? {};
  const usernameError = fieldErrors?.username;
  const passwordError = fieldErrors?.password;
  // console.log('login.tsx Login: context.foo =', context.foo);

  return (
    <div className="login">
      <Form method="post" id="login-form">
        <h1>Login</h1>
        <div>
          <label htmlFor="username">Username</label>
          <input name="username" />
          {usernameError && <div className="error">{usernameError}</div>}
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input name="password" type="password" />
          {passwordError && <div className="error">{passwordError}</div>}
        </div>
        <div className="buttons">
          <button disabled={isSubmitting} name="intent" value="sign-in">
            {isSubmitting ? 'Signing In' : 'Sign In'}
          </button>
          {isSubmitting && <div id="spinner"></div>}
          <button name="intent" value="sign-up">
            Sign Up
          </button>
          <button name="intent" value="forgot">
            Forgot Username or Password
          </button>
        </div>
        {formError && <div className="error">{formError}</div>}
      </Form>
    </div>
  );
}
