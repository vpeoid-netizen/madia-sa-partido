'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface User {
  role: string;
  email: string;
  name: string;
}

export function StaffGate({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles: string[];
}) {
  const [user, setUser] = useState<User | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then((data) => {
        setUser(data.user);
        setChecked(true);
      });
  }, []);

  if (!checked) {
    return <p aria-live="polite">Checking access…</p>;
  }

  if (!user || !roles.includes(user.role)) {
    return (
      <div style={{ padding: '0.75rem 1rem 2rem', maxWidth: '560px', margin: '0 auto' }}>
        <h1 className="madia-brand">Sign in required</h1>
        <p className="madia-glass" style={{ padding: '1rem' }}>
          This area is limited to authorized staff. Sign in at{' '}
          <Link href="/account">your account</Link> using an approved email address.
        </p>
        <p style={{ fontSize: '0.9rem', opacity: 0.85 }}>
          Local development: use <code>admin@madia.local</code> for administrator access.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
