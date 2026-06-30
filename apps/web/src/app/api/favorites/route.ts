import { NextResponse } from 'next/server';
import { addFavorite, listFavorites, removeFavorite } from '@/lib/persistence';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('client_id');
  if (!clientId) {
    return NextResponse.json({ error: 'client_id required' }, { status: 400 });
  }
  return NextResponse.json({ favorites: listFavorites(clientId) });
}

export async function POST(request: Request) {
  const body = await request.json();
  const clientId = String(body.client_id || '');
  if (!clientId) return NextResponse.json({ error: 'client_id required' }, { status: 400 });
  const favorite = addFavorite(clientId, {
    record_id: String(body.record_id),
    place_name: String(body.place_name),
    route: String(body.route),
  });
  return NextResponse.json({ favorite }, { status: 201 });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('client_id');
  const recordId = searchParams.get('record_id');
  if (!clientId || !recordId) {
    return NextResponse.json({ error: 'client_id and record_id required' }, { status: 400 });
  }
  removeFavorite(clientId, recordId);
  return NextResponse.json({ ok: true });
}
