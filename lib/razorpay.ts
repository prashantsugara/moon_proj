import Razorpay from 'razorpay';

export function paymentGateway() {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !secret) throw new Error('Payment gateway is unavailable');
  return new Razorpay({ key_id: keyId, key_secret: secret });
}
