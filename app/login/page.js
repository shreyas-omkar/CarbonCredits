'use client';

import { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/login', { email, password });
      console.log('Login successful:', response.data);
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-black text-green-400 overflow-hidden px-4">
      {/* Background image */}
      <div
        className="absolute inset-0 z-10 bg-cover bg-center"
        style={{
          backgroundImage: `url("/auth.jpg")`,
          opacity: 0.4,
        }}
      />

      {/* Glassmorphic Login Card */}
      <Card className="relative z-30 w-full border-0 max-w-md bg-white/5 backdrop-blur-md shadow-xl text-green-300 rounded-xl">
        <CardContent className="p-6 sm:p-8">
          <h1 className="text-3xl font-bold mb-6 text-center text-green-400">Sign In</h1>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="bg-transparent border border-green-600 text-green-100 focus:ring-green-500"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="mt-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Your password"
                className="bg-transparent border border-green-600 text-green-100 focus:ring-green-500"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
            )}

            <Link href="/forgotPassword" className="underline hover:text-green-400">
              Forgot Password?
            </Link>

            <Button
              type="submit"
              className="w-full bg-green-400 text-black font-bold hover:bg-green-500 mt-2 transition"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-green-300">
            Don’t have an account?{' '}
            <Link href="/signup" className="underline hover:text-green-400">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
