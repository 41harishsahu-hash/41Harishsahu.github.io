import React, { useState, useEffect, useCallback } from 'react';
import { Users, Search, Eye, UserCheck, UserX, FileText, CalendarCheck } from 'lucide-react';
import { adminAPI } from '../../services/api';
import { Badge, Modal, LoadingSpinner, Pagination } from '../../components/CommonUI';

export const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');

  // Customer inspection drawer / modal
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getCustomers({
        search,
        status: status === 'All' ? undefined : status,
        page,
        limit: 10,
      });

      if (res.data?.success) {
        setCustomers(res.data.data || []);
        setTotal(res.data.total || 0);
        setPages(res.data.pages || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, status, page]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const viewCustomer = async (cust) => {
    setSelectedCustomer(cust);
    setDetailsLoading(true);
    try {
      const res = await adminAPI.getCustomerById(cust._id);
      if (res.data?.success) {
        setCustomerDetails(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const toggleStatus = async (cust) => {
    const action = cust.status === 'active' ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} ${cust.name}'s account?`)) return;

    try {
      const res = await adminAPI.toggleCustomerStatus(cust._id);
      if (res.data?.success) {
        fetchCustomers();
        if (selectedCustomer?._id === cust._id) {
          setSelectedCustomer(res.data.data);
        }
      }
    } catch (err) {
      alert('Failed to update customer status');
    }
  };

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h2>Customer Accounts Management</h2>
          <p>Review registered users, examine their past moves, and manage account statuses</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 200px', minWidth: 0 }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search customer by name, email, or mobile..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div style={{ flex: '1 1 140px', minWidth: 0 }}>
          <select
            className="form-control"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="All">All Statuses</option>
            <option value="active">Active Accounts</option>
            <option value="inactive">Deactivated Accounts</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading customer accounts..." />
      ) : customers.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
          <Users size={44} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
          <h3>No Customers Found</h3>
          <p>No customer records match your filter criteria.</p>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Email</th>
                  <th>Mobile Number</th>
                  <th>Registered Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((cust) => (
                  <tr key={cust._id}>
                    <td>
                      <strong style={{ color: 'var(--brand-navy)' }}>{cust.name}</strong>
                    </td>
                    <td>{cust.email}</td>
                    <td>{cust.mobile}</td>
                    <td>{new Date(cust.createdAt).toLocaleDateString()}</td>
                    <td><Badge status={cust.status} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => viewCustomer(cust)}
                        >
                          <Eye size={14} /> Profile & History
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm"
                          style={{
                            backgroundColor: cust.status === 'active' ? '#FEF2F2' : '#F0FDF4',
                            color: cust.status === 'active' ? 'var(--danger)' : 'var(--success)',
                            border: '1px solid currentColor',
                          }}
                          onClick={() => toggleStatus(cust)}
                        >
                          {cust.status === 'active' ? <UserX size={14} /> : <UserCheck size={14} />}
                          <span>{cust.status === 'active' ? 'Deactivate' : 'Activate'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination currentPage={page} totalPages={pages} onPageChange={(p) => setPage(p)} />
        </>
      )}

      {/* Customer Profile & History Modal */}
      <Modal
        isOpen={Boolean(selectedCustomer)}
        onClose={() => {
          setSelectedCustomer(null);
          setCustomerDetails(null);
        }}
        title={`Customer Details: ${selectedCustomer?.name}`}
      >
        {selectedCustomer && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.875rem' }}>
              <div><strong>Email:</strong> {selectedCustomer.email}</div>
              <div><strong>Mobile:</strong> {selectedCustomer.mobile}</div>
              <div><strong>Status:</strong> <Badge status={selectedCustomer.status} /></div>
              <div><strong>Joined:</strong> {new Date(selectedCustomer.createdAt).toLocaleDateString()}</div>
            </div>

            {detailsLoading ? (
              <LoadingSpinner text="Fetching moving records..." />
            ) : customerDetails ? (
              <>
                {/* Enquiries */}
                <div>
                  <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileText size={16} color="var(--brand-orange)" />
                    Submitted Enquiries ({customerDetails.enquiries?.length || 0})
                  </h4>
                  {customerDetails.enquiries?.length === 0 ? (
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>No enquiries submitted.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '160px', overflowY: 'auto' }}>
                      {customerDetails.enquiries.map((e) => (
                        <div key={e._id} style={{ padding: '0.5rem 0.75rem', backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.8125rem', display: 'flex', justifyContent: 'space-between' }}>
                          <div>
                            <strong>{e.enquiryNumber}</strong> — {e.serviceType} ({e.pickupCity} → {e.destinationCity})
                          </div>
                          <Badge status={e.status} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bookings */}
                <div>
                  <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CalendarCheck size={16} color="var(--brand-orange)" />
                    Associated Bookings ({customerDetails.bookings?.length || 0})
                  </h4>
                  {customerDetails.bookings?.length === 0 ? (
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>No confirmed bookings on record.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '160px', overflowY: 'auto' }}>
                      {customerDetails.bookings.map((b) => (
                        <div key={b._id} style={{ padding: '0.5rem 0.75rem', backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.8125rem', display: 'flex', justifyContent: 'space-between' }}>
                          <div>
                            <strong>{b.bookingNumber}</strong> — {b.serviceType} (Date: {new Date(b.movingDate).toLocaleDateString()})
                          </div>
                          <div>
                            <Badge status={b.status} />
                            <span style={{ marginLeft: '0.5rem', fontWeight: 600 }}>₹{(b.quoteAmount || 0).toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminCustomers;

