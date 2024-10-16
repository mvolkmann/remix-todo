import {useEffect, useRef, useState} from 'react';
import {type LinksFunction, type MetaFunction} from '@remix-run/node';

import Heading from '~/components/Heading';

import styles from '~/styles/pokemon.css?url';

export const links: LinksFunction = () => [
  {rel: 'stylesheet', href: styles, as: 'style'}
];

type Pokemon = {
  name: string;
  url: string;
};

type PokemonResult = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Pokemon[];
};

const POKEMON_URL_PREFIX = 'https://pokeapi.co/api/v2/pokemon-species';
const ROWS_PER_PAGE = 5;

export const meta: MetaFunction = () => {
  return [{title: 'Pokemon'}];
};

export default function Pokemon() {
  const isFirstRender = useRef(true);
  const nextUrl = useRef<string | null>(
    POKEMON_URL_PREFIX + '?offset=0&limit=' + ROWS_PER_PAGE
  );
  const prevUrl = useRef<string | null>(null);
  const [items, setItems] = useState<Pokemon[]>([]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      loadMore();
    }

    window.addEventListener('scroll', handleScroll, {passive: true});
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const getID = (pokemon: Pokemon) => pokemon.url.split('/')[6];

  const getImageUrl = (pokemon: Pokemon) =>
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${getID(
      pokemon
    )}.png`;

  function handleScroll() {
    const lastRow = document.querySelector(
      'table tbody tr:last-child'
    ) as HTMLElement | null;
    if (lastRow && isElementInViewport(lastRow)) loadMore();
  }

  function isElementInViewport(el: HTMLElement) {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  async function loadMore() {
    if (!nextUrl.current) return; // at end
    if (nextUrl.current === prevUrl.current) return; // already loaded
    try {
      console.log('===========================');
      console.log('loadMore: prevUrl.current =', prevUrl.current);
      console.log('loadMore: nextUrl.current =', nextUrl.current);
      const res = await fetch(nextUrl.current);
      const result = (await res.json()) as PokemonResult;
      setItems(prevItems => [...prevItems, ...result.results]);
      prevUrl.current = nextUrl.current;
      nextUrl.current = result.next;
    } catch (e) {
      console.error('pokemon.tsx loadMore:', e);
    }
  }

  return (
    <section>
      <Heading>Pokemon</Heading>
      <div>prevUrl = {prevUrl.current}</div>
      <div>nextUrl = {nextUrl.current}</div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Image</th>
          </tr>
        </thead>
        <tbody>
          {items.map((p: Pokemon, index: number) => {
            return (
              <tr key={getID(p)}>
                <td>{getID(p)}</td>
                <td>{p.name}</td>
                <td>
                  <img src={getImageUrl(p)} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
