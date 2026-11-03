// app/api/requests/annonces/route.ts
import { NextResponse } from 'next/server';
import { annoncesServerService } from '@/lib/annonces/service';

export async function GET() {
  try {
    const data = await annoncesServerService.getAll();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = await annoncesServerService.create(body);
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}