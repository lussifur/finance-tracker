'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const getTodayDate = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function PendingPage() {
  const [formData, setFormData] = useState({ date: getTodayDate(), name: '', amount: '' });
  const [pendingData, setPendingData] = useState({ totalPending: 0, history: [] });
  const [isLoading, setIsLoading] = useState(true);

  const fetchPendingData = async () => {
    try {
      const res = await fetch('/api/pending');
      if (res.ok) {
        const data = await res.json();
        setPendingData(data);
      }
    } catch (error) {
      console.error('Error fetching pending data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchPendingData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/pending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setFormData({ date: getTodayDate(), name: '', amount: '' });
        fetchPendingData(); 
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure this has been paid? This will delete the record permanently.")) return;
    
    try {
      const response = await fetch(`/api/pending?id=${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchPendingData(); 
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const inputStyle = { width: '100%', padding: '0.75rem', border: '2px solid #ed8936', borderRadius: '8px', backgroundColor: '#fffaf0', fontSize: '1rem', outline: 'none' };

  return (
    <>
      <style>{`
        .container { padding: 2rem; max-width: 600px; margin: 0 auto; font-family: sans-serif; }
        .list-item { display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: #fffaf0; border: 1px solid #fbd38d; border-radius: 8px; margin-bottom: 0.75rem; }
        @media (max-width: 500px) { .container { padding: 1rem; } .list-item { flex-direction: column; align-items: flex-start; gap: 0.75rem; } .paid-btn { align-self: flex-end; } }
      `}</style>

      <main className="container">
        <h2 style={{ textAlign: 'center', margin: '0 0 1.5rem 0' }}>Pending Receivables</h2>

        {/* BIG BUTTON TO SWITCH TO DASHBOARD */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
          <Link href="/" style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#0070f3', 
            color: 'white',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            Switch to Main Dashboard ⇄
          </Link>
        </div>

        <div style={{ padding: '1.5rem', backgroundColor: '#dd6b20', borderRadius: '8px', textAlign: 'center', color: 'white', marginBottom: '2rem' }}>
          <h4 style={{ margin: 0, opacity: 0.9 }}>Total Amount Owed to You</h4>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0 0 0' }}>
            ₹{isLoading ? '...' : pendingData.totalPending.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Date</label>
            <input type="date" required style={inputStyle} value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Person's Name</label>
            <input type="text" required placeholder="e.g. Rahul" style={inputStyle} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Amount (₹)</label>
            <input type="number" step="0.01" required style={inputStyle} value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
          </div>
          <button type="submit" style={{ padding: '0.85rem', cursor: 'pointer', backgroundColor: '#ed8936', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem' }}>
            Add Pending Due
          </button>
        </form>

        <hr style={{ border: '0', borderTop: '1px solid #eaeaea', marginBottom: '1.5rem' }} />
        
        <h3 style={{ margin: '0 0 1rem 0' }}>Who Owes You?</h3>
        <div>
          {pendingData.history.length > 0 ? (
            pendingData.history.map((item) => (
              <div key={item.id} className="list-item">
                <div>
                  <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.1rem' }}>{item.name}</p>
                  <p style={{ margin: '0.25rem 0 0 0', color: '#718096', fontSize: '0.9rem' }}>{item.date} • <strong style={{color: '#dd6b20'}}>₹{item.amount.toLocaleString('en-IN')}</strong></p>
                </div>
                <button 
                  className="paid-btn"
                  onClick={() => handleDelete(item.id)}
                  style={{ padding: '0.5rem 1rem', backgroundColor: '#38a169', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Mark as Paid ✓
                </button>
              </div>
            ))
          ) : (
            <p style={{ color: '#a0aec0', fontStyle: 'italic' }}>{isLoading ? 'Loading...' : 'Nobody owes you money! Yay!'}</p>
          )}
        </div>
      </main>
    </>
  );
}