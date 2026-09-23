import { NextResponse } from 'next/server';
import { stripe, getSubscriptionPrice } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { planType } = await request.json();

    if (!planType || !['monthly', 'yearly'].includes(planType)) {
      return NextResponse.json(
        { error: 'Invalid plan type' },
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

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Get or create subscription record
    let { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!subscription) {
      // Get charity preference from user metadata
      const charityId = user.user_metadata?.charity_id || null;
      const charityPercentage = user.user_metadata?.charity_percentage || 10;

      // Create subscription record if it doesn't exist
      const { data: newSub, error: subError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          charity_id: charityId,
          plan_type: planType,
          status: 'inactive',
          charity_percentage: charityPercentage,
        })
        .select()
        .single();

      if (subError) {
        console.error('Error creating subscription:', subError);
        return NextResponse.json(
          { error: 'Failed to create subscription' },
          { status: 500 }
        );
      }

      subscription = newSub;
    }

    // Create or retrieve Stripe customer
    const customers = await stripe.customers.list({
      email: user.email!,
      limit: 1,
    });

    let customerId: string;

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email!,
        name: profile.full_name || undefined,
        metadata: {
          supabase_user_id: user.id,
        },
      });
      customerId = customer.id;
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: planType === 'monthly' ? 'Monthly Subscription' : 'Yearly Subscription',
              description: `Golf Charity Platform - ${planType} subscription`,
            },
            unit_amount: getSubscriptionPrice(planType),
            recurring: {
              interval: planType === 'monthly' ? 'month' : 'year',
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscribe?canceled=true`,
      metadata: {
        user_id: user.id,
        subscription_id: subscription.id,
        plan_type: planType,
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
