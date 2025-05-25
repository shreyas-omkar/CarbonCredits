'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function ForgotPassword() {
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
            Forgot Password
          </h1>
          <form className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="bg-transparent border border-green-600 text-green-100 focus:ring-green-500"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-green-400 text-black font-bold hover:bg-green-500 transition"
            >
              Send Reset Link
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-green-300">
            Remembered your password?{' '}
            <a href="/login" className="underline hover:text-green-400">
              Sign In
            </a>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
