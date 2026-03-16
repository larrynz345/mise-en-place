import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "dummy", {
  apiVersion: "2024-04-10" as Stripe.LatestApiVersion,
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: unknown) {
    if (err instanceof Error) {
      return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }
    return new NextResponse(`Webhook Error`, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;

        if (userId) {
          await supabase
            .from("profiles")
            .update({ subscription_tier: "pro" })
            .eq("id", userId);
        }
        break;
      }
      case "customer.subscription.deleted": {
        // const subscription = event.data.object as Stripe.Subscription;
        break;
      }
    }
  } catch (error) {
    console.error("Supabase update error:", error);
    return new NextResponse("Webhook handler failed", { status: 500 });
  }

  return new NextResponse("Webhook processed", { status: 200 });
}
