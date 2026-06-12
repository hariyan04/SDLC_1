import { NextResponse } from 'next/server';
import { createUser } from '@/lib/db';
import { signToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ message: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const newUser = await createUser(email, password);
    const token = signToken(newUser);

    const response = NextResponse.json(
      { message: 'User created successfully', user: { id: newUser.id, email: newUser.email } },
      { status: 201 }
    );

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Signup API Error:', error);
    return NextResponse.json({ message: error.message || 'Error creating user' }, { status: 500 });
  }
}
