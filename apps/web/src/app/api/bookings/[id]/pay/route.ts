import { NextResponse } from 'next/server';
import { processTestPayment } from '@/lib/persistence';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const body = await request.json();
  const idempotencyKey = String(body.idempotency_key || `pay-${id}`);

  try {
    const payment = processTestPayment(id, idempotencyKey);
    return NextResponse.json({ payment, mode: 'test' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Payment failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
