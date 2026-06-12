import { NextResponse } from 'next/server';
import { getSettings, updateSettings } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';

export async function GET(request) {
  try {
    const userPayload = getUserIdFromRequest(request);
    if (!userPayload || userPayload.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized - Admin only' }, { status: 403 });
    }

    const settings = await getSettings();
    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Settings GET API Error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const userPayload = getUserIdFromRequest(request);
    if (!userPayload || userPayload.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized - Admin only' }, { status: 403 });
    }

    const settingsData = await request.json();
    const updated = await updateSettings(settingsData);
    return NextResponse.json({ message: 'Settings updated successfully', settings: updated });
  } catch (error) {
    console.error('Settings POST API Error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
