// TICKET-ADV115 — useWebSocket(url) with auto-reconnect (exp backoff up to 5 tries).
import {  useCallback, useEffect, useRef, useState } from 'react';

export function useWebSocket(url, { reconnect = true, maxRetries = 5 } = {}) {
  // TODO(TICKET-ADV115): open a WebSocket in a useEffect.
  //   - track readyState in `status` ('connecting' | 'open' | 'closed' | 'error').
  //   - parse incoming messages as JSON (fall back to raw string).
  //   - on close, if `reconnect` and retries < maxRetries, schedule another
  //     connect() with exponential backoff (500 * 2^attempt, capped at 30s).
  //   - cleanup must close the socket AND cancel any pending reconnect.
  const [data , setData ] = useState(null);
  const [status , setStatus ] = useState('connecting');
  const wsRef = useRef(null);
  const retriesRef = useRef(0);
  const timerRef = useRef(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;
    retriesRef.current = 0;

    function connect() {
      if (cancelledRef.current) return;
      const ws = new WebSocket(url);
      wsRef.current = ws;
      setStatus('connecting');

      ws.onopen = () => {
        if (cancelledRef.current) return;
        setStatus('open');
        retriesRef.current = 0;
      };
      ws.onmessage = (event) => {
        if (cancelledRef.current) return;
        try {
          setData(JSON.parse(event.data));
        } catch {
          setData(event.data);
        }
      };
      ws.onerror = () => {
        if (cancelledRef.current) return;
        setStatus('error');
      };
      ws.onclose = () => {
        if (cancelledRef.current) return;
        setStatus('closed');
        if (reconnect && retriesRef.current < maxRetries) {
          const attempt = retriesRef.current++;
          const delay = Math.min(30000, 500 * 2 ** attempt);
          timerRef.current = setTimeout(connect, delay);
        }
      };
    }

    connect();

    return () => {
      cancelledRef.current = true;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      const ws = wsRef.current;
      if (ws && ws.readyState <= WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [url, reconnect, maxRetries]);


  const send = (/* payload */) => {
    // TODO(TICKET-ADV115): only send if the socket exists AND readyState === OPEN.
    //                     Serialize non-string payloads via JSON.stringify.
    const send = useCallback((payload) => {
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) return;
      ws.send(typeof payload === 'string' ? payload : JSON.stringify(payload));
    }, []);
  };

  return { data, status, send };
}
