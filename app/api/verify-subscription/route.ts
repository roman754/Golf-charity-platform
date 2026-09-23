import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid' && session.mode === 'subscription') {
      const stripeSubscriptionId = session.subscription as string;
      const stripeCustomerId = session.customer as string;

      // Retrieve the Stripe subscription to get period dates
      const stripeSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);

      // Type assertion for accessing period properties
      const periodStart = 'current_period_start' in stripeSubscription ? (stripeSubscription as any).current_period_start : Date.now() / 1000;
      const periodEnd = 'current_period_end' in stripeSubscription ? (stripeSubscription as any).current_period_end : Date.now() / 1000;

      // Update subscription in database
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          stripe_subscription_id: stripeSubscriptionId,
          stripe_customer_id: stripeCustomerId,
          current_period_start: new Date(periodStart * 1000).toISOString(),
          current_period_end: new Date(periodEnd * 1000).toISOString(),
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (subError) {
        console.error('Error updating subscription:', subError);
        return NextResponse.json(
          { error: 'Failed to update subscription' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        subscription: {
          status: subscription.status,
          plan_type: subscription.plan_type,
        }
      });
    } else {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error verifying subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
