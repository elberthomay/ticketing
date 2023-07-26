import Stripe from "stripe";
process.env.STRIPE_KEY =
  "sk_test_51NXwYLHfuDplnizE2zJ6KphTWCrQayTKIiBF8mxshG1BwieJ4pm1zzrlXqC3Y1ju8zVTTAoHUbIVBONFoIqwegOA00SAOCcnxG";

const stripe = new Stripe(process.env.STRIPE_KEY!, {
  apiVersion: "2022-11-15",
});

export default stripe;
