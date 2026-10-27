// Hash routes for the account pages, so links and the browser Back button work on static hosting.
import { useSyncExternalStore } from 'react';

export type Page = 'plans' | 'account' | 'classroom' | 'school' | 'student' | 'privacy' | 'terms' | 'invite';

const parse = () => {
  const [path, query = ''] = window.location.hash.replace(/^#\/?/, '').split('?');
  const [page, arg] = path.split('/');
  const known: Page[] = ['plans', 'account', 'classroom', 'school', 'student', 'privacy', 'terms', 'invite'];
  return {
    page: (known as string[]).includes(page) ? (page as Page) : null,
    arg: arg ?? null,
    query: new URLSearchParams(query),
  };
};

let current = parse();
const listeners = new Set<() => void>();
window.addEventListener('hashchange', () => {
  current = parse();
  listeners.forEach((l) => l());
});

export const useRoute = () =>
  useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => current,
    () => current
  );

export const openPage = (page: Page, arg?: string) => {
  window.location.hash = `#/${page}${arg ? `/${arg}` : ''}`;
};

export const closePage = () => {
  // Drop the hash without adding a history entry.
  history.replaceState(null, '', window.location.pathname + window.location.search);
  current = parse();
  listeners.forEach((l) => l());
};
