import { NextResponse } from 'next/server';
import { getQuestions, saveQuestion, deleteQuestion } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';

export async function GET(request) {
  try {
    const userPayload = getUserIdFromRequest(request);
    if (!userPayload) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const questions = await getQuestions();
    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Questions GET API Error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const userPayload = getUserIdFromRequest(request);
    if (!userPayload || userPayload.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized - Admin only' }, { status: 403 });
    }

    const questionData = await request.json();
    if (!questionData.area || !questionData.subArea || !questionData.practice || !questionData.questionText) {
      return NextResponse.json({ message: 'Missing required question fields' }, { status: 400 });
    }

    await saveQuestion(questionData);
    return NextResponse.json({ message: 'Question saved successfully' });
  } catch (error) {
    console.error('Questions POST API Error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const userPayload = getUserIdFromRequest(request);
    if (!userPayload || userPayload.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized - Admin only' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ message: 'Question ID is required' }, { status: 400 });
    }

    const deleted = await deleteQuestion(id);
    if (!deleted) {
      return NextResponse.json({ message: 'Question not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Questions DELETE API Error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
