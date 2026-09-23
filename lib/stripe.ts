import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-08-26.dahlia',
  typescript: true,
});

export const SUBSCRIPTION_PRICES = {
  monthly: 2999,
  yearly: 29999,
};

export function getSubscriptionPrice(planType: 'monthly' | 'yearly'): number {
  return SUBSCRIPTION_PRICES[planType];
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

export function calculateCharityAmount(
  subscriptionAmount: number,
  charityPercentage: number
): number {
  return Math.round((subscriptionAmount * charityPercentage) / 100);
}

export async function getOrCreateCustomer(
  userId: string,
  email: string,
  name?: string
): Promise<string> {
  const existingCustomers = await stripe.customers.list({
    email,
    limit: 1,
  });

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0].id;
  }

  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      supabase_user_id: userId,
    },
  });

  return customer.id;
}
