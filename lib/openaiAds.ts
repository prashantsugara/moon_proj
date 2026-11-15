export async function reportRegistrationPurchase(paymentId: string, amount: number, oppref?: string) {
  const key = process.env.OPENAI_ADS_CONVERSIONS_KEY;
  if (!key) return;

  const response = await fetch('https://bzr.openai.com/v1/events?pid=CVSg6zyrTwnTkxWxeFvqgE', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(5000),
    body: JSON.stringify({
      events: [{
        id: paymentId,
        type: 'order_created',
        timestamp_ms: Date.now(),
        action_source: 'web',
        source_url: 'https://www.moonlandbuy.com/',
        oppref,
        data: { type: 'contents', amount, currency: 'USD' },
      }],
    }),
  });
  if (!response.ok) throw new Error('OpenAI Ads returned ' + response.status);
}
