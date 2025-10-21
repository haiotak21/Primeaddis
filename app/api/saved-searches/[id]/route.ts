import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/database'
import { SavedSearch } from '@/models'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB()
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const item = await SavedSearch.findOne({ _id: params.id, user: session.user.id })
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(item)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB()
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { name, alertEnabled, alertFrequency } = await req.json()
  const updated = await SavedSearch.findOneAndUpdate(
    { _id: params.id, user: session.user.id },
    { $set: { ...(name !== undefined ? { name } : {}), ...(alertEnabled !== undefined ? { alertEnabled } : {}), ...(alertFrequency !== undefined ? { alertFrequency } : {}) } },
    { new: true }
  )
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB()
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const res = await SavedSearch.deleteOne({ _id: params.id, user: session.user.id })
  if (res.deletedCount === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
