import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.mode === 'subscription') {
          const userId = session.metadata?.user_id;
          const subscriptionId = session.metadata?.subscription_id;
          const stripeSubscriptionId = session.subscription as string;

          if (userId && subscriptionId) {
            // Update subscription with Stripe details
            await supabase
              .from('subscriptions')
              .update({
                status: 'active',
                stripe_subscription_id: stripeSubscriptionId,
                stripe_customer_id: session.customer as string,
                current_period_start: new Date().toISOString(),
              })
              .eq('id', subscriptionId);
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Type assertion for accessing period properties
        const periodStart = 'current_period_start' in subscription ? (subscription as any).current_period_start : Date.now() / 1000;
        const periodEnd = 'current_period_end' in subscription ? (subscription as any).current_period_end : Date.now() / 1000;
        
        // Update subscription status
        await supabase
          .from('subscriptions')
          .update({
            status: subscription.status === 'active' ? 'active' : 'inactive',
            current_period_start: new Date(periodStart * 1000).toISOString(),
            current_period_end: new Date(periodEnd * 1000).toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Mark subscription as canceled
        await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
          })
          .eq('stripe_subscription_id', subscription.id);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        
        const invoiceSubscription = 'subscription' in invoice ? invoice.subscription : null;
        const periodStart = 'period_start' in invoice ? (invoice as any).period_start : Date.now() / 1000;
        const periodEnd = 'period_end' in invoice ? (invoice as any).period_end : Date.now() / 1000;
        
        if (invoiceSubscription) {
          // Update subscription period
          await supabase
            .from('subscriptions')
            .update({
              status: 'active',
              current_period_start: new Date(periodStart * 1000).toISOString(),
              current_period_end: new Date(periodEnd * 1000).toISOString(),
            })
            .eq('stripe_subscription_id', invoiceSubscription as string);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        
        const invoiceSubscription = 'subscription' in invoice ? invoice.subscription : null;
        
        if (invoiceSubscription) {
          // Mark subscription as past_due
          await supabase
            .from('subscriptions')
            .update({
              status: 'past_due',
            })
            .eq('stripe_subscription_id', invoiceSubscription as string);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
