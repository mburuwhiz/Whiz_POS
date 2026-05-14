import { cookies } from 'next/headers';

export const setSessionCookie = (token: string) => {
    cookies().set('admin_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 // 1 day
    });
};

export const getSessionCookie = () => {
    return cookies().get('admin_session')?.value;
};
