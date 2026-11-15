import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { jsPDF } from 'jspdf';
import { drawDeed, getDeedUrl } from '@/utils/deedGenerator';
import { paymentAdmin } from '@/lib/paymentAdmin';

function validEmail(value: unknown) {
  const email = typeof value === 'string' ? value.trim() : '';
  return /^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(email) ? email : undefined;
}

export async function sendDeedEmail(
  admin: ReturnType<typeof paymentAdmin>, paymentId: string, checkoutEmail: unknown
) {
  if (process.env.DEED_EMAIL_ENABLED !== 'true') return;

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.DEED_EMAIL_FROM;
  const siteUrl = process.env.DEED_EMAIL_SITE_URL;
  if (!apiKey || !from || !siteUrl) {
    throw new Error('Deed email configuration is incomplete');
  }

  const { data: order, error: orderError } = await admin.from('lunar_registration_orders')
    .select('id, claim_id, account_id, deed_email_id').eq('payment_id', paymentId).single();
  if (orderError) throw orderError;
  if (order.deed_email_id) return;

  const { data: deed, error: deedError } = await admin.from('lunar_claims')
    .select('id, owner_name, title, lat, lng, sqft, motto, flag_id, created_at')
    .eq('id', order.claim_id).single();
  if (deedError) throw deedError;

  const { data, error } = await admin.auth.admin.getUserById(order.account_id);
  if (error) throw error;
  const loginEmail = data.user?.email_confirmed_at ? validEmail(data.user.email) : undefined;
  const recipient = validEmail(checkoutEmail) ?? loginEmail;
  if (!recipient) throw new Error('Deed email recipient is unavailable');
  const copy = loginEmail && loginEmail.toLowerCase() !== recipient.toLowerCase() ? [loginEmail] : undefined;

  const canvas = createCanvas(2048, 1448);
  const claimedAt = new Date(deed.created_at);
  await drawDeed(canvas, {
    id: deed.id, ownerName: deed.owner_name, title: deed.title, lat: deed.lat, lng: deed.lng,
    acres: deed.sqft / 43560, motto: deed.motto, flagId: deed.flag_id,
    regionName: 'Lunar Surface', claimedAt, txHash: deed.id,
  }, siteUrl, (src: string) => loadImage(join(process.cwd(), 'public', src)));
  const png = canvas.toBuffer('image/png');
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [2048, 1448] });
  pdf.setCreationDate("D:" + claimedAt.toISOString().slice(0, 19).replace(/\D/g, '') + "+00'00'");
  pdf.setFileId(createHash('md5').update(deed.id).digest('hex'));
  pdf.addImage(png, 'PNG', 0, 0, 2048, 1448);

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + apiKey,
      'Content-Type': 'application/json',
      'Idempotency-Key': 'lunar-deed/' + deed.id,
    },
    body: JSON.stringify({
      from,
      to: [recipient],
      bcc: copy,
      subject: 'Your lunar deed is ready',
      text: 'Your commemorative MoonLandBuy certificate is attached as a PDF and a PNG. View it online at '
        + getDeedUrl(deed.id, siteUrl),
      attachments: [
        { filename: 'Lunar-Certificate.pdf', content: Buffer.from(pdf.output('arraybuffer')).toString('base64') },
        { filename: 'Lunar-Certificate.png', content: png.toString('base64') },
      ],
    }),
  });
  if (!response.ok) throw new Error('Deed email provider returned ' + response.status);
  const { id } = await response.json();
  if (typeof id !== 'string' || !id) throw new Error('Deed email provider did not return an ID');

  const { error: saveError } = await admin.from('lunar_registration_orders')
    .update({ deed_email_id: id }).eq('id', order.id).is('deed_email_id', null);
  if (saveError) throw saveError;
}
