import { createContext, useContext } from 'react';
import { useUser as useClerkUser } from '@clerk/clerk-react';
import type { ReactNode } from 'react';

interface AppUser {
  id: string;
  email: string | undefined;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string;
  fullName: string | null;
}

const UserContext = createContext<AppUser | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const { isLoaded, user } = useClerkUser();

  // This provider is rendered inside ProtectedRoute, so isLoaded will
  // be true and user will be non-null by the time we reach here.
  // But guard defensively in case it's used elsewhere.
  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-on-surface-variant">Loading…</p>
      </div>
    );
  }

  const appUser: AppUser = {
    id: user.id,
    email: user.primaryEmailAddress?.emailAddress,
    firstName: user.firstName,
    lastName: user.lastName,
    imageUrl: user.imageUrl,
    fullName: user.fullName,
  };

  return (
    <UserContext.Provider value={appUser}>
      {children}
    </UserContext.Provider>
  );
}

export function useAppUser(): AppUser {
  const user = useContext(UserContext);
  if (!user) {
    throw new Error('useAppUser must be used within a UserProvider');
  }
  return user;
}
