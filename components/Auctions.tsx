'use client';

import { openCheckout } from '@/lib/openCheckout';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

type Auction = {
  id: string; claim_id: string; seller_id: string; winner_id: string | null;
  price: number; ends_at: string; status: string; deadline: string | null; fee: number;
};
type Plot = { id: string; title: string; accountId: string };

const columns = 'id,claim_id,seller_id,winner_id,price,ends_at,status,deadline,fee';
const money = (paise: number) => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR',
}).format(paise / 100);

export default function Auctions({ plots, onClose, refreshClaims, initialPlot }: {
  initialPlot?: string; plots: Plot[]; onClose: () => void; refreshClaims: () => Promise<void>;
}) {
  const { user, session } = useAuth();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [instructions, setInstructions] = useState<{ accountId: string; auctionId: string; upi: string } | null>(null);

  async function load() {
    const { data, error } = await supabase.from('lunar_auctions').select(columns)
      .order('created_at', { ascending: false }).limit(100);
    if (error) throw error;
    setAuctions(data);
    setNow(Date.now());
  }

  useEffect(() => {
    const poll = () => void load().catch(() => setMessage('Auctions could not be loaded.'));
    poll();
    const timer = setInterval(poll, 10000);
    return () => clearInterval(timer);
  }, []);

  async function run(work: () => Promise<void>) {
    setBusy(true);
    setMessage('');
    try {
      await work();
      await load();
      await refreshClaims();
    } catch (error) {
      setMessage(error?.message || 'The action could not be completed.');
    } finally {
      setBusy(false);
    }
  }

  function action(name: string, id: string, price?: number, hours?: number, details?: string) {
    return run(async () => {
      const { error } = await supabase.rpc('lunar_auction_action', {
        p_action: name, p_id: id, p_price: price, p_hours: hours, p_text: details,
      });
      if (error) throw error;
    });
  }

  async function checkout(id: string) {
    const response = await fetch('/api/razorpay/create-order', {
      method: 'POST', headers: {
        Authorization: `Bearer ${session?.access_token}`, 'Content-Type': 'application/json',
      }, body: JSON.stringify({ auctionId: id }),
    });
    const order = await response.json();
    if (!response.ok) throw new Error(order.error || 'Checkout is unavailable.');
    await openCheckout(order, 'Commemorative registry transfer fee', () =>
      setMessage('Payment submitted. The registry updates after Razorpay confirms it.'));
  }

  return (
    <section className="glass-card" aria-label="Lunar marketplace" style={{
      position: 'absolute', inset: '75px 12px 12px auto', zIndex: 70,
      width: 'min(480px, calc(100vw - 24px))', overflow: 'auto', padding: 20,
    }}>
      <button type="button" onClick={onClose} style={{ float: 'right' }}>Close</button>
      <h2>Marketplace</h2>
      <p>Auctions transfer commemorative registry entries. Pay the seller directly after winning. The winner also pays a platform fee of 2% of the winning bid.</p>
      {message && <p role="status">{message}</p>}
      {!user && <p>Sign in to list a plot or place a bid.</p>}
      <fieldset disabled={busy} style={{ border: 0, minWidth: 0 }}>
        {user && plots.some((plot) => plot.accountId === user.id) && (
          <form onSubmit={(event) => {
            event.preventDefault();
            const values = new FormData(event.currentTarget);
            void action('list', String(values.get('plot')), Math.round(Number(values.get('price')) * 100),
              Number(values.get('hours')), String(values.get('upi')));
          }}>
            <h3>List a plot</h3>
            <label>Plot <select name="plot" defaultValue={initialPlot} required>{plots.filter((plot) => plot.accountId === user.id)
              .map((plot) => <option key={plot.id} value={plot.id}>{plot.title}</option>)}</select></label>
            <label>Opening price (INR) <input name="price" type="number" min="50" max="500000" step=".01" required /></label>
            <label>Duration (hours) <input name="hours" type="number" min="1" max="168" defaultValue="24" required /></label>
            <label>UPI ID <input name="upi" maxLength={100} required /></label>
            <button type="submit">Create auction</button>
          </form>
        )}
        {auctions.map((auction) => {
          const seller = user?.id === auction.seller_id;
          const winner = user?.id === auction.winner_id;
          const open = auction.status === 'open' && Date.parse(auction.ends_at) > now;
          const due = auction.deadline && Date.parse(auction.deadline) > now;
          if (!open && !seller && !winner && auction.status !== 'open') return null;
          return (
            <article key={auction.id} style={{ borderTop: '1px solid #475569', paddingBlock: 12 }}>
              <h3>{plots.find((plot) => plot.id === auction.claim_id)?.title ?? 'Lunar plot'}</h3>
              <p>{money(auction.price)} · {auction.status.replace(/_/g, ' ')}</p>
              <p>Closes {new Date(auction.ends_at).toLocaleString()}</p>
              {auction.deadline && <p>Deadline {new Date(auction.deadline).toLocaleString()}</p>}
              {open && user && !seller && <form onSubmit={(event) => {
                event.preventDefault();
                const price = Number(new FormData(event.currentTarget).get('price'));
                void action('bid', auction.id, Math.round(price * 100));
              }}>
                <label>Bid (INR) <input name="price" type="number" step=".01" required
                  min={(auction.price + (auction.winner_id ? 1 : 0)) / 100} max="500000" /></label>
                <button type="submit">Place bid</button>
              </form>}
              {seller && open && !auction.winner_id &&
                <button onClick={() => void action('cancel', auction.id)}>Cancel listing</button>}
              {user && !open && auction.status === 'open' &&
                <button onClick={() => void action('close', auction.id)}>Close auction</button>}
              {(winner || seller) && !due && auction.status === 'awaiting_buyer' &&
                <button onClick={() => void action('expire', auction.id)}>Flag overdue transfer</button>}
              {winner && due && auction.status === 'awaiting_buyer' && <>
                <button onClick={() => void run(async () => {
                  const { data, error } = await supabase.rpc('lunar_payment_instructions', { p_id: auction.id });
                  if (error) throw error;
                  if (!data) throw new Error('Payment instructions are unavailable.');
                  setInstructions({ accountId: user.id, auctionId: auction.id, upi: data });
                })}>Show seller UPI ID</button>
                {instructions?.accountId === user.id && instructions.auctionId === auction.id &&
                  <p>Pay {money(auction.price)} to {instructions.upi}</p>}
                <button onClick={() => void action('buyer_paid', auction.id)}>I paid the seller</button>
              </>}
              {seller && due && auction.status === 'awaiting_seller' &&
                <button onClick={() => void action('seller_confirmed', auction.id)}>I received payment</button>}
              {winner && due && auction.status === 'awaiting_fee' &&
                <button onClick={() => void run(() => checkout(auction.id))}>Pay transfer fee ({money(auction.fee)})</button>}
              {(seller || winner) && ['awaiting_seller', 'awaiting_fee'].includes(auction.status) && (
                <form onSubmit={(event) => {
                  event.preventDefault();
                  const reason = String(new FormData(event.currentTarget).get('reason'));
                  void action('dispute', auction.id, undefined, undefined, reason);
                }}>
                  <label>Reason <input name="reason" required maxLength={500} /></label>
                  <button type="submit">Report dispute</button>
                </form>
              )}
            </article>
          );
        })}
      </fieldset>
    </section>
  );
}
