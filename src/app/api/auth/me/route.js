import { NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth';
import { getUserById } from '@/lib/db';

export async function GET(request) {
  try {
    const userPayload = getUserIdFromRequest(request);

    if (!userPayload) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const dbUser = await getUserById(userPayload.id);
    if (!dbUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: dbUser.id,
        email: dbUser.email,
        role: dbUser.role,
        name: dbUser.name || '',
        gender: dbUser.gender || ''
      }
    });
  } catch (error) {
    console.error('Me API Error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
