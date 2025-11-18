"use client";

import { useState } from "react";
import { createStripeCheckoutSession } from "@/lib/utils/checkoutUtils";
import { Plan } from "@/types/settings/plans";

/**
 * Custom hook for managing Stripe checkout session creation
 * @returns Object containing handleCheckoutForPlan function and isCheckoutLoading state
 */
export function useStripeCheckout() {
	const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

	/**
	 * Handler to create a Stripe Checkout Session for a selected plan and open the returned URL
	 * @param plan - The plan to create checkout session for
	 */
	const handleCheckoutForPlan = async (plan: Plan) => {
		try {
			setIsCheckoutLoading(true);
			await createStripeCheckoutSession(plan);
		} catch (err) {
			console.error('Error Stripe Checkout session:', err);
		} finally {
			setIsCheckoutLoading(false);
		}
	};

	return {
		handleCheckoutForPlan,
		isCheckoutLoading,
	};
}
