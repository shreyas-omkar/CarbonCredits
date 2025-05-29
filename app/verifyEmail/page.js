'use client';

import { useState } from 'react';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from "next/navigation";


export default function EmailVerification() {

  const router = useRouter();

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/verifyEmail', { verificationToken: otp });
      console.log('OTP verification success:', response.data);
      router.push('/login')
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
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
            Email Verification
          </h1>
          <p className="text-center mb-6 text-green-300 text-sm">
            Enter the 6-digit code sent to your email
          </p>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                placeholder="123456"
                className="bg-transparent border border-green-600 text-green-100 tracking-widest text-center text-xl focus:ring-green-500"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                disabled={loading}
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full bg-green-400 text-black font-bold hover:bg-green-500 transition"
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
