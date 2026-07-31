// TICKET-ADV118 — useInfiniteScroll: invokes loadMore() when sentinel is visible.
import { useEffect,useRef } from 'react';

export function useInfiniteScroll(loadMore) {
  const sentinelRef = useRef(null);
  const loadMoreRef = useRef(loadMore);

  // TODO(TICKET-ADV118): in a useEffect, create an IntersectionObserver that
  //                     calls loadMore() when entries[0].isIntersecting.
  //                     Observe sentinelRef.current. Disconnect in cleanup.

 

  // Keep the latest callback in a ref so the observer doesn't have to churn.
  useEffect(() => {
    loadMoreRef.current = loadMore;
  }, [loadMore]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) loadMoreRef.current();
    }, { threshold: 0.1 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return sentinelRef;
}
