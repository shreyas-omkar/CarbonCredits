import jwt from 'jsonwebtoken';
import { cookies as nextCookies } from 'next/headers';

export const generateTokenAndSetCookies = async (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

  const cookies = await nextCookies();
  cookies.set('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV !== 'development', // true in production
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  });

  return token;
};
