'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';

export default function PasswordReset() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    setError('');
    // Submit reset password logic here
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-black text-green-400 overflow-hidden px-4">
      {/* Background image */}
      <div
        className="absolute inset-0 z-10 bg-cover bg-center"
        style={{ backgroundImage: `url("/auth.jpg")`, opacity: 0.4 }}
      />

      {/* Glassmorphic Card */}
      <Card className="relative z-30 w-full max-w-md bg-white/5 backdrop-blur-md shadow-xl text-green-300 rounded-xl border-0">
        <CardContent className="p-6 sm:p-8">
          <h1 className="text-3xl font-bold mb-6 text-center text-green-400">
            Reset Password
          </h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter new password"
                className="bg-transparent border border-green-600 text-green-100 focus:ring-green-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                className="bg-transparent border border-green-600 text-green-100 focus:ring-green-500"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
            <Button
              type="submit"
              className="w-full bg-green-400 text-black font-bold hover:bg-green-500 transition"
            >
              Reset Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
