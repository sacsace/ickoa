import Razorpay from "razorpay";

export function getRazorpayKeyId() {
  return process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? process.env.RAZORPAY_KEY_ID ?? "";
}

export function isRazorpayConfigured() {
  return Boolean(getRazorpayKeyId() && process.env.RAZORPAY_KEY_SECRET);
}

export function getRazorpayClient() {
  const keyId = getRazorpayKeyId();
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay API keys are not configured.");
  }

  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

export function inrToPaise(amountInr: number) {
  return Math.round(amountInr * 100);
}

export function paiseToInr(paise: number) {
  return paise / 100;
}
