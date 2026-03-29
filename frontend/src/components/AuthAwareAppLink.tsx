import type { CSSProperties, ReactNode } from 'react';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';

export interface AuthAwareAppLinkProps {
  to: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

export function AuthAwareAppLink({ to, className, style, children }: AuthAwareAppLinkProps) {
  return (
    <>
      <SignedIn>
        <Link to={to} className={className} style={style}>
          {children}
        </Link>
      </SignedIn>
      <SignedOut>
        <Link to="/sign-up" className={className} style={style}>
          {children}
        </Link>
      </SignedOut>
    </>
  );
}
