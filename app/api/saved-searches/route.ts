import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { SavedSearch } from '@/models';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET: List all saved searches for the current user
export async function GET(req: NextRequest) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const searches = await SavedSearch.find({ user: session.user.id }).sort({ createdAt: -1 });
  return NextResponse.json(searches);
}

// POST: Create a new saved search
export async function POST(req: NextRequest) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  const { name, criteria, alertEnabled, alertFrequency } = body;
  if (!name || !criteria) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  const savedSearch = await SavedSearch.create({
    user: session.user.id,
    name,
    criteria,
    alertEnabled: !!alertEnabled,
    alertFrequency: alertFrequency || 'instant',
  });
  return NextResponse.json(savedSearch, { status: 201 });
}
