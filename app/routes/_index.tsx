import {useEffect, useState} from 'react';
import {type MetaFunction} from '@remix-run/node';
import {Link} from '@remix-run/react';

export const meta: MetaFunction = () => {
  return [{title: 'New Remix App'}];
};

export default function Index() {
  const [color, setColor] = useState('');

  useEffect(() => {
    if (typeof sessionStorage !== 'undefined') {
      const storedColor = sessionStorage.getItem('color');
      if (storedColor) setColor(storedColor);
    }
  }, []);

  return (
    <div style={{fontFamily: 'system-ui, sans-serif', lineHeight: '1.4'}}>
      <h1>Welcome to Remix!</h1>
      <ul>
        <li>
          <a
            target="_blank"
            href="https://remix.run/tutorials/blog"
            rel="noreferrer"
          >
            Blog Tutorial
          </a>
        </li>
        <li>
          <a
            target="_blank"
            href="https://remix.run/tutorials/jokes"
            rel="noreferrer"
          >
            Jokes App Tutorial
          </a>
        </li>
        <li>
          <a target="_blank" href="https://remix.run/docs" rel="noreferrer">
            Remix Docs
          </a>
        </li>
        <li>
          <Link to="/demo">Demo</Link>
        </li>
        <li>
          <Link to="/pokemon">Pokemon</Link>
        </li>
        <li>
          <Link to="/login">Login</Link>
        </li>
      </ul>
      {color && <p>I see you like the color {color}.</p>}
    </div>
  );
}
