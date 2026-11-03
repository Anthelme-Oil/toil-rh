// app/api/requests/evenements/route.ts
import { NextResponse } from 'next/server';
import { evenementsServerService } from '@/lib/evenements/service';

export async function GET() {
  try {
    const data = await evenementsServerService.getAll();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = await evenementsServerService.create(body);
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}