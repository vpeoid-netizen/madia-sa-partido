'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAccessibilityPreferences } from '@/lib/client-storage';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  municipality_id?: string;
}

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const { simplified, setSimplified, highContrast, setHighContrast } = useAccessibilityPreferences();

  useEffect(() => {
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then((data) => setUser(data.user));
  }, []);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name }),
    });
    const data = await res.json();
    if (res.ok) {
      setUser(data.user);
      setMessage('Signed in on this device.');
    } else {
      setMessage(data.error || 'Sign-in failed.');
    }
  }

  async function signOut() {
    await fetch('/api/auth/session', { method: 'DELETE' });
    setUser(null);
    setMessage('Signed out.');
  }

  return (
    <div style={{ padding: '0.75rem 1rem 2rem', maxWidth: '560px', margin: '0 auto' }}>
      <h1 className="madia-brand">Your account</h1>

      {user ? (
        <div className="madia-glass" style={{ padding: '1rem' }}>
          <p><strong>{user.name}</strong></p>
          <p>{user.email}</p>
          <p>Role: {user.role}</p>
          {user.municipality_id && <p>Municipality scope: {user.municipality_id}</p>}
          {(user.role === 'admin' || user.role === 'validator' || user.role === 'owner') && (
            <p style={{ marginTop: '0.75rem' }}>
              <Link href="/admin" className="button button-secondary">Open staff tools</Link>
            </p>
          )}
          <button type="button" className="button button-secondary" onClick={signOut} style={{ marginTop: '0.75rem' }}>
            Sign out
          </button>
          <p style={{ marginTop: '1rem' }}>
            <Link href="/trips">View saved trips</Link>
          </p>
        </div>
      ) : (
        <form className="madia-glass book-form" onSubmit={signIn}>
          <p>Local development sign-in. Production uses Supabase authentication.</p>
          <p style={{ fontSize: '0.9rem', opacity: 0.85 }}>
            Administrator demo: <code>admin@madia.local</code>
          </p>
          <label>
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <button type="submit" className="button button-primary">Continue</button>
        </form>
      )}

      <section className="madia-glass book-form" style={{ marginTop: '1rem' }}>
        <h2 style={{ marginTop: 0 }}>Display preferences</h2>
        <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={simplified}
            onChange={(e) => setSimplified(e.target.checked)}
          />
          Simplified layout
        </label>
        <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={highContrast}
            onChange={(e) => setHighContrast(e.target.checked)}
          />
          High contrast
        </label>
      </section>

      {message && <p role="status">{message}</p>}
    </div>
  );
}
