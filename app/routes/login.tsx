// import { useContext } from 'react';
import {
  type ActionFunction,
  type ActionFunctionArgs,
  type LinksFunction,
  type LoaderFunctionArgs,
  type MetaFunction,
  json,
  redirect
} from '@remix-run/node';

import {Form, useActionData, useNavigation} from '@remix-run/react';

import {getSession, commitSession} from '../sessions';

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

export const action: ActionFunction = async ({request}: ActionFunctionArgs) => {
  try {
    const session = await getSession(request.headers.get('Cookie'));
    const formData = await request.formData();
    const intent = formData.get('intent') as string;

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

        session.set('username', username);
        return redirect('/', {
          headers: {'Set-Cookie': await commitSession(session)}
        });

      case 'sign-up':
        return {formError: 'Sign up is not implemented yet.'};
    }
    return {}; // stays on current page
  } catch (e) {
    console.error('login.tsx action:', e);
  }
};

export async function loader({request}: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get('Cookie'));
  const username = session.get('username');

  if (session.has('username')) {
    // Redirect to the home page if already signed in.
    return redirect('/');
  }

  const data = {error: session.get('error')};

  return json(data, {
    headers: {
      'Set-Cookie': await commitSession(session)
    }
  });
}

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
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  const {formError, fieldErrors} = actionData ?? {};
  const usernameError = fieldErrors?.username;
  const passwordError = fieldErrors?.password;

  return (
    <div className="bg-orange-100 login p-4">
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
        <div className="flex gap-2">
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
