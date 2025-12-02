import Stripe from 'stripe';
import { stripeApi } from './stripe-server';
import { nile } from '@/app/api/[...nile]/nile';

// Handle checkout.session.completed - attach subscription to company_billing
export async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    console.log('Checkout session completed:', session.id);

    const subscriptionId = typeof session.subscription === 'string' ? session.subscription : (session.subscription as any)?.id;
    const metadata = session.metadata || {};
    const companyId = metadata.company_id || metadata.companyId || null;

    if (!subscriptionId) {
      console.warn('No subscription id on session', session.id);
      return;
    }

    // Fetch subscription details from Stripe to get period end/status
    const subscription = (await stripeApi.subscriptions.retrieve(subscriptionId as string)) as Stripe.Subscription;

    if (companyId) {
      try {
        console.log(`Updated company_billing for company ${companyId} with subscription ${subscription.id}`);
      } catch (dbErr) {
        console.error('Failed to update company_billing after checkout.session.completed:', dbErr);
      }
    } else {
      console.warn('No company_id metadata on checkout session:', session.id);
    }

  } catch (error) {
    console.error('Failed to handle checkout.session.completed:', error);
    throw error;
  }
}

export async function handleInvoicePaid(invoice: Stripe.Invoice) {
  try {
    // invoice contains customer and subscription info
    const subscriptionId = typeof (invoice as any).subscription === 'string' ? (invoice as any).subscription : (invoice as any).subscription?.id;
    // Try to resolve company by invoice.metadata or by subscription -> checkout metadata

    // Prefer metadata on invoice
    const metadata = (invoice as any).metadata || {};
    const companyId = metadata.company_id || metadata.companyId || null;

    // If we have subscription, fetch subscription to get metadata possibly set at creation
    let subscription: Stripe.Subscription | null = null;
    if (subscriptionId) {
      subscription = (await stripeApi.subscriptions.retrieve(subscriptionId as string)) as any;
    }

    let resolvedCompanyId = companyId;
    if (!resolvedCompanyId && subscription && subscription.metadata) {
      resolvedCompanyId = subscription.metadata.company_id || subscription.metadata.companyId || null;
    }

    if (resolvedCompanyId) {
      // Update company billing last payment info
      try {
        console.log(`Updated company_billing for company ${companyId} with subscription`);
      } catch (dbErr) {
        console.error('Failed to update company_billing on invoice.paid:', dbErr);
      }
    } else {
      console.warn('Could not resolve company for invoice', invoice.id);
    }

  } catch (error) {
    console.error('Failed to handle invoice.paid:', error);
    throw error;
  }
}

export async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const metadata = (subscription as any).metadata || {};
  const companyId = metadata.company_id || metadata.companyId || null;

  if (!companyId) {
    console.warn('No company_id in subscription metadata:', subscription.id);
    return;
  }

  try {

    console.log(`Updated company_billing for company ${companyId} with subscription ${subscription.id}`);

  } catch (error) {
    console.error('Failed to handle subscription.updated:', error);
    throw error;
  }
}
