import { Plan } from "@/types/settings/plans";
import { toast } from "sonner";

/**
 * Creates a Stripe Checkout Session for a selected plan and opens the returned URL in a new tab.
 * This function handles the entire checkout flow including error handling and user notifications.
 *
 * @param plan - Optional plan object containing price and/or id. If price is present, it's used as price. If id is present, it's used as planId.
 * @returns Promise that resolves when the checkout URL is opened successfully, or rejects on error.
 */
export async function createStripeCheckoutSession(plan: Plan): Promise<void> {
	try {
		const body: Record<string, unknown> = {};

		// If the plan payload contains an explicit price id, send it.
		if (plan?.priceMonthly) body.price = plan.priceMonthly;

		if (plan?.id) body.planId = plan.id;

		const res = await fetch('/api/stripe/subscription/checkout-session', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body),
		});

		const data = await res.json();
		if (!res.ok) throw new Error(data.error || 'Failed to create checkout session');

		if (data.url) {
			window.open(data.url, '_blank');
			toast.success('Redirecting to checkout...', { duration: 4000 });
		} else if (data.id) {
			const checkoutUrl = `https://checkout.stripe.com/pay/${data.id}`;
			window.open(checkoutUrl, '_blank');
			toast.success('Redirecting to checkout...', { duration: 4000 });
		} else {
			throw new Error('No URL returned from checkout session creation');
		}
	} catch (err) {
		console.error('Error creating Stripe Checkout session:', err);
		toast.error((err as Error)?.message || 'Failed to create checkout session');
		throw err; // Re-throw to allow caller to handle
	}
}
