// app/api/requests/videos/route.ts
import { NextResponse } from 'next/server';
import { videosServerService } from '@/lib/videos/service';

export async function GET() {
  try {
    const data = await videosServerService.getAll();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = await videosServerService.create(body);
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}