import { prisma } from "@/utils/connect";
import { NextResponse } from "next/server";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)

export const POST = async ({params}: {params: {id: string}}) => {
  const {id} = params;
  const order = await prisma.order.findUnique({
    where: {
      id: id
    }
  });
  if (order) {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 100*100,
      currency: "eur",
      automatic_payment_methods: {
        enabled: true
      }
    })
    return new NextResponse(JSON.stringify({clientSecret: paymentIntent.client_secret}), {status: 200})
  } else {
    return new NextResponse(JSON.stringify({message: "Order not found!"}), {status: 404})
  }
}