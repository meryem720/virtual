/**
 * Page de connexion
 */

'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Email ou mot de passe incorrect');
        setLoading(false);
        return;
      }

      // Redirection selon le rôle (à améliorer)
      if (email.includes('eleve')) {
        router.push('/student');
      } else if (email.includes('parent')) {
        router.push('/parent');
      } else {
        router.push('/');
      }
    } catch (error) {
      setError('Une erreur est survenue');
      setLoading(false);
    }
  };

  // Comptes de démo
  const demoAccounts = [
    { email: 'eleve@ecole.fr', password: 'password123', label: '👧 Élève (Emma)' },
    { email: 'parent@ecole.fr', password: 'password123', label: '👨 Parent (M. Martin)' },
    { email: 'prof@ecole.fr', password: 'password123', label: '👩‍🏫 Professeur' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-600 mb-2">
            🎓 École Virtuelle CE2
          </h1>
          <p className="text-gray-600">Connecte-toi pour accéder à ton espace</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Connexion</CardTitle>
            <CardDescription>
              Entre ton email et ton mot de passe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="exemple@ecole.fr"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">
                  Mot de passe
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Connexion...' : 'Se connecter'}
              </Button>
            </form>

            {/* Comptes de démo */}
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-gray-600 mb-3 font-semibold">
                🎮 Comptes de démonstration :
              </p>
              <div className="space-y-2">
                {demoAccounts.map((account) => (
                  <button
                    key={account.email}
                    onClick={() => {
                      setEmail(account.email);
                      setPassword(account.password);
                    }}
                    className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded border"
                  >
                    <span className="font-medium">{account.label}</span>
                    <br />
                    <span className="text-xs text-gray-500">{account.email}</span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Clique sur un compte puis sur "Se connecter"
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
