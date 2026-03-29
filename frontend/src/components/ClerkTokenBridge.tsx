import { useAuth } from '@clerk/clerk-react';
import { useEffect } from 'react';
import { setClerkTokenGetter } from '../api/client';

/** Wires Clerk session tokens into the API client for Authorization headers. */
export function ClerkTokenBridge() {
  const { getToken } = useAuth();

  useEffect(() => {
    setClerkTokenGetter(() => getToken());
  }, [getToken]);

  return null;
}
