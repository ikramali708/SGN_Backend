import { useEffect, useState } from 'react';
import api from '../api/axios.js';
import Card from '../components/Card.jsx';
import Spinner from '../components/Spinner.jsx';

export default function Reports() {
  const [reports, setReports] = useState(null);
  const [dash, setDash] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [r, d] = await Promise.all([
          api.get('/api/admin/reports'),
          api.get('/api/admin/dashboard/stats'),
        ]);
        if (!cancelled) {
          setReports(r.data);
          setDash(d.data);
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e.response?.data?.message || e.message || 'Failed to load reports.'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
        {error}
      </div>
    );
  }

  const fmtMoney = (n) =>
    typeof n === 'number' ? n.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '—';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-primary">Reports</h1>
        <p className="text-slate-600">Aggregated metrics</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card
          title="Total sales"
          value={fmtMoney(reports?.totalRevenue)}
          subtitle="Sum of order totals (all time)"
          icon="💰"
        />
        <Card
          title="Monthly orders"
          value={reports?.totalOrders ?? '—'}
          subtitle="Backend returns total orders; monthly filter not in API yet"
          icon="📅"
        />
        <Card
          title="New nurseries"
          value={dash?.totalNurseries ?? '—'}
          subtitle="Total nurseries registered"
          icon="🏡"
        />
        <Card
          title="New users"
          value={reports?.totalUsers ?? '—'}
          subtitle="Total registered users"
          icon="👤"
        />
      </div>
    </div>
  );
}
