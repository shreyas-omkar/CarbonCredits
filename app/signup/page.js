'use client';
import Link from 'next/link';
import { useState } from 'react';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setError('');
    setLoading(true);

    try {
      const formData = { name, email, password, confirmPassword };
      const response = await axios.post('/api/auth/signup', formData);

      console.log('Signup successful:', response.data);
      router.push('/verifyEmail');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
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

      {/* Glassmorphic Signup Card */}
      <Card className="relative z-30 w-full border-0 max-w-md bg-white/5 backdrop-blur-md shadow-xl text-green-300 rounded-xl">
        <CardContent className="p-6 sm:p-8">
          <h1 className="text-3xl font-bold mb-6 text-center text-green-400">Sign Up</h1>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your full name"
                className="bg-transparent border border-green-600 text-green-100 focus:ring-green-500"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>
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
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                className="bg-transparent border border-green-600 text-green-100 focus:ring-green-500"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                className="bg-transparent border border-green-600 text-green-100 focus:ring-green-500"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <Button
              type="submit"
              className="w-full bg-green-400 text-black font-bold hover:bg-green-500 transition"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-green-300">
            Already have an account?{' '}
            <Link href="/login" className="underline hover:text-green-400">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
