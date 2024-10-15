import {createCookieSessionStorage} from '@remix-run/node';

type SessionData = {
  username: string;
};

type SessionFlashData = {
  error: string;
};

// Create session storage
if (!process) console.log('sessions.ts: process is not defined');
const {getSession, commitSession, destroySession} = createCookieSessionStorage<
  SessionData,
  SessionFlashData
>({
  cookie: {
    name: '__session',
    path: '/',
    httpOnly: true,
    maxAge: 60,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  }
});

export {getSession, commitSession, destroySession};
