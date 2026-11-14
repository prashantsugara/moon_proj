export const REGISTRATION_PRICES: Readonly<Partial<Record<number, number>>> = {
  1: 2000,
  100: 4900,
  1000: 9900,
  43560: 19900,
};

export function formatRegistrationPrice(cents: number) {
  return 'US$' + (cents / 100).toLocaleString('en-US');
}

export const REGISTRATION_PRICE = formatRegistrationPrice(2000);
