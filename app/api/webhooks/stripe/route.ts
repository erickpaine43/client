import Stripe from 'stripe';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { stripeApi } from '@/lib/stripe/stripe-server';
import { handleCheckoutSessionCompleted, handleInvoicePaid, handleSubscriptionUpdated } from '@/lib/stripe/webhook-handlers';

const endpointSecret = process.env.STRIPE_WEBHOOK_SIGNING_SECRET;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const sig = (await headers()).get('stripe-signature');

    if (!endpointSecret) {
      throw new Error('STRIPE_WEBHOOK_SIGNING_SECRET is not set in environment variables.');
    }

    if (!sig) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripeApi.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case 'customer.subscription.updated':
      case 'customer.subscription.created':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;


      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
