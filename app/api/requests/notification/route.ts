import { NextResponse } from 'next/server';

import {
  sendNotification,
} from '@/lib/notifications/service';

import type {
  NotificationPayload,
} from '@/lib/notifications/types';

export async function POST(
  request: Request,
) {
  try {
    const payload =
      (await request.json()) as NotificationPayload;

    const result =
      await sendNotification(payload);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error(
      '[POST /api/notifications]',
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          'Impossible d’envoyer la notification.',
      },
      {
        status: 500,
      },
    );
  }
}