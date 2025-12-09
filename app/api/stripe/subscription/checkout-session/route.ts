import { NextResponse, NextRequest } from 'next/server';
import { stripeApi } from '@/lib/stripe/stripe-server';
import { nile } from '@/app/api/[...nile]/nile';

interface NileUser {
  id: string;
  companyId?: number;
}

const CHECKOUT_STATUS = {
  SUCCESS: 'success',
  CANCELED: 'canceled',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planId, price } = body || {};

    // Get authenticated user and derive company context
    const user: NileUser = await nile.users.getSelf();
    if (user instanceof Response) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userId = user.id;
    const companyId = user.companyId;
    const successUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/billing?checkout=${CHECKOUT_STATUS.SUCCESS}`;
    const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/billing?checkout=${CHECKOUT_STATUS.CANCELED}`;

    const session = await stripeApi.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{
        quantity: 1,
        price_data: {
          currency: 'usd',
          recurring: {
            interval: 'month',
            interval_count: 1,
          },
          product_data: {
            name: `plan ${planId}`,
            unit_label: 'subscription',
          },
          unit_amount: price,
        },
      }],
      // Attach company and plan metadata so webhook handlers can reconcile
      metadata: {
        requested_plan_id: planId || '',
        company_id: companyId ? String(companyId) : '',
        initiated_by_user: userId,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return NextResponse.json({ url: session.url }, { status: 201 });

  } catch (error) {
    console.error('Failed to create Checkout Session:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
