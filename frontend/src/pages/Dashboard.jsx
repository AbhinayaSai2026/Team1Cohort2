// TICKET-ADV120 — useMemo for portfolio-value calc.
// TICKET-ADV116 — useTradeStream live feed.
import React, { useMemo } from 'react';
import { withAuth } from '@components/withAuth.jsx';
import { useTradeStream } from '@hooks/useTradeStream.js';

function StatCard({ label, value }) {
  return (
    <article className="stat-card" style={{
      background: '#f8f9fa',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '16px 20px',
      boxShadow: 'none'
    }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#888', fontWeight: '700' }}>{label}</h3>
      <p style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#111827' }}>{value}</p>
    </article>
  );
}

function Dashboard({ trades: tradesProp }) {
  const stream = useTradeStream();
  const trades = tradesProp ?? stream.trades;
  const isConnected = tradesProp ? true : stream.isConnected;

  const portfolioValue = useMemo(() => {
    return trades.reduce((sum, t) => {
      const qty = Number(t.quantity || t.qty || 0);
      const price = Number(t.price || 0);
      return sum + qty * price;
    }, 0);
  }, [trades]);

  const matchedCount = useMemo(() => {
    return trades.filter((t) => t.status === 'MATCHED').length;
  }, [trades]);

  const openBreaksCount = useMemo(() => {
    return trades.filter((t) => ['UNMATCHED', 'DISPUTED', 'BREAK'].includes(t.status)).length;
  }, [trades]);

  return (
    <section style={{ padding: '20px 24px', maxWidth: '1400px', margin: '0 auto' }}>
      <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', fontWeight: '800', color: '#111827' }}>Dashboard</h2>
      
      <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
        <StatCard label="Portfolio Value" value={`$${portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
        <StatCard label="Trades Streamed" value={trades.length} />
        <StatCard label="Matched Trades" value={matchedCount} />
        <StatCard label="Open Breaks" value={openBreaksCount} />
      </div>

      <div role="status" aria-live="polite" style={{
        marginBottom: '24px',
        padding: '12px 16px',
        borderRadius: '8px',
        backgroundColor: isConnected ? '#e6f7f5' : '#fef2f2',
        border: `1px solid ${isConnected ? '#b2dfdb' : '#fecaca'}`,
        color: isConnected ? '#0d5c56' : '#991b1b',
        fontSize: '14px',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        <span>SSE Connection Status:</span>
        <span style={{ color: isConnected ? '#00695c' : '#dc2626', fontWeight: '700' }}>
          ● Connected (Live)
        </span>
      </div>

      <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '800', color: '#111827' }}>Live Trade Stream</h3>
      <div style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '16px',
        background: '#ffffff',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
        maxHeight: '480px',
        overflowY: 'auto'
      }}>
        {trades.length === 0 ? (
          <p style={{ color: '#6b7280', fontStyle: 'italic', margin: 0 }}>Waiting for live trades to stream...</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '10px 12px', color: '#4b5563', fontWeight: '700' }}>Ref</th>
                <th style={{ padding: '10px 12px', color: '#4b5563', fontWeight: '700' }}>Symbol</th>
                <th style={{ padding: '10px 12px', color: '#4b5563', fontWeight: '700' }}>Counterparty</th>
                <th style={{ padding: '10px 12px', color: '#4b5563', fontWeight: '700' }}>Qty</th>
                <th style={{ padding: '10px 12px', color: '#4b5563', fontWeight: '700' }}>Price</th>
                <th style={{ padding: '10px 12px', color: '#4b5563', fontWeight: '700' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((t, idx) => {
                const status = (t.status || '').toUpperCase();
                let badgeBg = '#fef3c7';
                let badgeColor = '#92400e';

                if (status === 'MATCHED') {
                  badgeBg = '#dcfce7';
                  badgeColor = '#166534';
                } else if (status === 'UNMATCHED' || status === 'DISPUTED' || status === 'BREAK') {
                  badgeBg = '#fee2e2';
                  badgeColor = '#991b1b';
                } else if (status === 'PENDING') {
                  badgeBg = '#fef3c7';
                  badgeColor = '#92400e';
                }

                return (
                  <tr key={t.id || t.tradeRef || idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px', fontWeight: '700', color: '#111827' }}>{t.tradeRef}</td>
                    <td style={{ padding: '12px', color: '#374151' }}>{t.instrumentSymbol || t.symbol || '-'}</td>
                    <td style={{ padding: '12px', color: '#374151' }}>{t.counterpartyName || t.counterparty || '-'}</td>
                    <td style={{ padding: '12px', color: '#374151' }}>{t.quantity || t.qty}</td>
                    <td style={{ padding: '12px', color: '#374151' }}>${t.price}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '700',
                        backgroundColor: badgeBg,
                        color: badgeColor,
                        display: 'inline-block',
                        textTransform: 'uppercase'
                      }}>
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

export default withAuth(Dashboard);
