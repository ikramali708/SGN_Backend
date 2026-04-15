import { useEffect, useState } from 'react';
import api from '../../services/api.js';
import Card from '../../components/Card.jsx';
import Spinner from '../../components/Spinner.jsx';

export default function NurseryDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/api/nursery/dashboard/stats');
        if (!cancelled) setStats(data);
      } catch (e) {
        if (!cancelled) {
          setError(
            e.response?.data?.message ||
              e.message ||
              'Could not load nursery dashboard stats.'
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-primary">Nursery dashboard</h1>
        <p className="text-slate-600">Overview of your nursery operations</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card title="Total Plants" value={stats?.totalPlants ?? '—'} icon="🌿" />
        <Card title="Total Orders" value={stats?.totalOrders ?? '—'} icon="🧾" />
        <Card
          title="Delivered Orders"
          value={stats?.completedOrders ?? '—'}
          icon="✅"
        />
        <Card
          title="Pending Orders"
          value={stats?.pendingOrders ?? '—'}
          icon="⏳"
        />
        <Card
          title="Cancelled Orders"
          value={stats?.cancelledOrders ?? '—'}
          icon="❌"
        />
        <Card
          title="Total Sales"
          value={
            typeof stats?.totalSales === 'number'
              ? stats.totalSales.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              : '—'
          }
          icon="💰"
        />
      </div>
    </div>
  );
}
