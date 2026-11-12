import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  FileText,
  CalendarCheck,
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Truck,
  PlusCircle,
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import { StatCard, Badge, LoadingSpinner } from '../../components/CommonUI';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getStats()
      .then((res) => {
        if (res.data?.success) {
          setData(res.data.data);
        }
      })
      .catch((err) => console.error('Failed to load admin stats:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Fetching actual database statistics..." />;

  const stats = data?.stats || {
    totalCustomers: 0,
    totalEnquiries: 0,
    pendingEnquiries: 0,
    totalBookings: 0,
    confirmedBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
  };

  const recentEnquiries = data?.recentEnquiries || [];
  const recentBookings = data?.recentBookings || [];

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h2>Operational Dashboard</h2>
          <p>Real-time metrics, quotation pipeline, and relocation tracking</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/admin/bookings" className="btn btn-navy btn-sm">
            <PlusCircle size={14} /> New Booking
          </Link>
          <Link to="/admin/enquiries" className="btn btn-primary btn-sm">
            View All Enquiries
          </Link>
        </div>
      </div>

      {/* Real Statistics Grid from Database */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <StatCard title="Total Customers" value={stats.totalCustomers} icon={Users} color="navy" />
        <StatCard title="Total Enquiries" value={stats.totalEnquiries} icon={FileText} />
        <StatCard title="Pending Enquiries" value={stats.pendingEnquiries} icon={Clock} color="orange" subtitle="Action needed" />
        <StatCard title="Total Bookings" value={stats.totalBookings} icon={CalendarCheck} color="navy" />
        <StatCard title="In Progress Moves" value={stats.confirmedBookings} icon={Truck} color="orange" />
        <StatCard title="Completed Moves" value={stats.completedBookings} icon={CheckCircle} />
        <StatCard title="Cancelled Moves" value={stats.cancelledBookings} icon={AlertTriangle} subtitle="Archived" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
        {/* Recent Enquiries Table */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.125rem' }}>Recent Enquiries</h3>
            <Link to="/admin/enquiries" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--brand-orange)' }}>
              Manage All →
            </Link>
          </div>

          {recentEnquiries.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>No enquiries found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentEnquiries.map((enq) => (
                <div
                  key={enq._id}
                  style={{
                    padding: '0.875rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '0.875rem', color: 'var(--brand-navy)', display: 'block' }}>
                      {enq.name} ({enq.enquiryNumber})
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {enq.serviceType} • {enq.pickupCity} → {enq.destinationCity}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <Badge status={enq.status} />
                    <Link
                      to={`/admin/enquiries?id=${enq._id}`}
                      style={{ display: 'block', fontSize: '0.75rem', color: 'var(--brand-orange)', fontWeight: 600, marginTop: '0.25rem' }}
                    >
                      Inspect →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Bookings Table */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.125rem' }}>Recent Bookings</h3>
            <Link to="/admin/bookings" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--brand-orange)' }}>
              Manage All →
            </Link>
          </div>

          {recentBookings.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>No bookings created yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentBookings.map((bk) => (
                <div
                  key={bk._id}
                  style={{
                    padding: '0.875rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '0.875rem', color: 'var(--brand-navy)', display: 'block' }}>
                      {bk.customerName} ({bk.bookingNumber})
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {bk.pickupCity} → {bk.destinationCity} • Moving: {new Date(bk.movingDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <Badge status={bk.status} />
                    <Link
                      to={`/admin/bookings?id=${bk._id}`}
                      style={{ display: 'block', fontSize: '0.75rem', color: 'var(--brand-orange)', fontWeight: 600, marginTop: '0.25rem' }}
                    >
                      Update →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

