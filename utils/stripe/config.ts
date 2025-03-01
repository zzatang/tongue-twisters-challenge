import Stripe from 'stripe';

// Only initialize Stripe if we have an API key
let stripe: Stripe | undefined;

if (process.env.STRIPE_SECRET_KEY_LIVE || process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(
    process.env.STRIPE_SECRET_KEY_LIVE ?? process.env.STRIPE_SECRET_KEY ?? '',
    {
      // https://github.com/stripe/stripe-node#configuration
      // https://stripe.com/docs/api/versioning
      apiVersion: '2025-01-27.acacia', // Latest stable API version from Stripe types
      // Register this as an official Stripe plugin.
      // https://stripe.com/docs/building-plugins#setappinfo
      appInfo: {
        name: 'Tongue Twisters Challenge',
        version: '1.0.0'
      }
    }
  );
}

export { stripe };
