'use client';

import { useCallback, useEffect, type ComponentProps } from 'react';
import NextLink from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type NavigateOptions = {
  replace?: boolean;
  state?: unknown;
};

type CompatLinkProps = Omit<ComponentProps<typeof NextLink>, 'href'> & {
  href?: ComponentProps<typeof NextLink>['href'];
  to?: string;
};

const normalizePath = (to: string) => {
  if (to.startsWith('http') || to.startsWith('#')) return to;
  return to.startsWith('/') ? to : `/${to}`;
};

export function Link({ to, href, ...props }: CompatLinkProps) {
  return <NextLink href={href ?? normalizePath(to ?? '/')} {...props} />;
}

export function useNavigate() {
  const router = useRouter();

  return useCallback((to: string | number, options?: NavigateOptions) => {
    if (typeof to === 'number') {
      if (to < 0) router.back();
      return;
    }

    const path = normalizePath(to);
    if (options?.state && typeof window !== 'undefined') {
      window.history.replaceState({ ...window.history.state, pawcareState: options.state }, '', window.location.href);
    }

    if (options?.replace) {
      router.replace(path);
    } else {
      router.push(path);
    }
  }, [router]);
}

export function useParams<T extends Record<string, string | undefined> = Record<string, string>>() {
  const pathname = usePathname() ?? '';
  const segments = pathname.split('/').filter(Boolean);
  const params: Record<string, string> = {};

  if (segments[1] === 'edit' && segments[2]) {
    params.id = segments[2];
  } else if (segments[0] === 'care-records' && segments[1] && segments[1] !== 'new') {
    params.id = segments[1];
  } else if (segments[0] === 'schedules' && segments[1] && segments[1] !== 'new') {
    params.id = segments[1];
  }

  return params as T;
}

export function useLocation() {
  const pathname = usePathname() ?? '/';
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const state = typeof window === 'undefined' ? undefined : window.history.state?.pawcareState;

  return {
    pathname,
    search: search ? `?${search}` : '',
    state,
  };
}

export function Navigate({ to, replace, state }: { to: string; replace?: boolean; state?: unknown }) {
  const navigate = useNavigate();

  useEffect(() => {
    navigate(to, { replace, state });
  }, [navigate, replace, state, to]);

  return null;
}
