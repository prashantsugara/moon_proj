export async function openCheckout(order: { id: string; amount: number; currency: string },
  description: string, onPayment: () => void) {
  const browser = window as Window & { Razorpay?: new (options: object) => { open(): void } };
  if (!browser.Razorpay) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve();
      script.onerror = () => { script.remove(); reject(new Error('Checkout could not load.')); };
      document.head.append(script);
    });
  }
  const Razorpay = browser.Razorpay;
  if (!Razorpay) throw new Error('Checkout could not load.');
  new Razorpay({
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, order_id: order.id,
    amount: order.amount, currency: order.currency, name: 'MoonLandBuy',
    description,
    handler: onPayment,
  }).open();
}
