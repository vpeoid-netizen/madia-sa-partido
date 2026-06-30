import { NextResponse } from 'next/server';
import { logAudit } from '@/lib/persistence';

/**
 * Stripe webhook placeholder. Configure STRIPE_WEBHOOK_SECRET in production.
 */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: 'Stripe webhook is not configured. Use MADIA_PAYMENT_MODE=test for local development.' },
      { status: 503 },
    );
  }

  const payload = await request.text();
  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  // Production: verify with Stripe SDK and route payment_intent.succeeded events.
  logAudit('stripe.webhook.received', 'payment', 'unverified', 'stripe', {
    bytes: payload.length,
    signature_present: true,
  });

  return NextResponse.json({ received: true });
}
