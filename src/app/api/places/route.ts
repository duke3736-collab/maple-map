import { NextResponse } from 'next/server';
import { getPlaces } from '@/lib/places';

export const revalidate = 0;

export async function GET() {
  const places = await getPlaces();
  return NextResponse.json(places);
}
