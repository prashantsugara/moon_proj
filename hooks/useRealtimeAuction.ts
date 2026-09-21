import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useRealtimeAuction(itemId: string, initialBid: number) {
  const [currentBid, setCurrentBid] = useState<number>(initialBid);
  const [bidsHistory, setBidsHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Fetch initial bids
    supabase
      .from('bids')
      .select('*, profiles(full_name)')
      .eq('item_id', itemId)
      .order('amount', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data && isMounted) {
          setBidsHistory(data);
          if (data.length > 0) setCurrentBid(data[0].amount);
        }
        if (isMounted) setIsLoading(false);
      });

    // Real-time subscription to new bids
    const channel = supabase
      .channel(`auction-${itemId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'bids', filter: `item_id=eq.${itemId}` },
        (payload) => {
          const newBid = payload.new;
          setCurrentBid(newBid.amount);
          setBidsHistory((prev) => [newBid, ...prev]);
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [itemId]);

  const placeBid = async (amount: number) => {
    const { error } = await supabase.rpc('place_bid', {
      p_item_id: itemId,
      p_amount: amount,
    });
    if (error) throw error;
  };

  return { currentBid, bidsHistory, isLoading, placeBid };
}
