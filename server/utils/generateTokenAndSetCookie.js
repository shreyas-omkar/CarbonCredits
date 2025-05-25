import jwt from 'jsonwebtoken'

export const generateTokenAndSetCookeies = (res, userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, { 
        httpOnly: false, 
        sameSite: 'lax',  // Loosen for development
        maxAge: 7 * 24 * 60 * 60 * 1000, 
        secure: false // Ensure HTTPS in production
    });

    return token;
}