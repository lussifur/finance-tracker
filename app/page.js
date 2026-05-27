'use client';
import { useState, useEffect } from 'react';

const getTodayDate = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function Home() {
  const [formData, setFormData] = useState({
    date: getTodayDate(), 
    type: 'Revenue', 
    amount: ''
  });
  
  const [dashboard, setDashboard] = useState({ revenue: 0, expenses: 0, profit: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/finance');
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Server error instead of JSON:', errorText);
        return;
      }

      const data = await res.json();
      setDashboard(data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Transaction logged successfully!');
        
        setFormData({ 
          date: getTodayDate(), 
          type: 'Revenue', 
          amount: '' 
        });
        
        fetchDashboardData(); 
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (err) {
      alert(`Network error: ${err.message}`);
    }
  };

  // --- NEW HIGHLIGHT STYLES FOR INPUTS ---
  // We define the style here once so we don't have to copy-paste it three times
  const highlightedInputStyle = {
    width: '100%', 
    padding: '0.75rem', 
    border: '2px solid #0070f3', // Solid blue border
    borderRadius: '8px',         // Rounded corners
    backgroundColor: '#f0f7ff',  // Very light blue background tint
    fontSize: '1rem',
    outline: 'none'              // Removes the default browser focus ring
  };

  return (
    <main style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2 style={{ textAlign: 'center' }}>Business Finance Tracker</h2>
      
      {/* DASHBOARD CARDS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '2rem', marginTop: '1.5rem' }}>
        <div style={{ flex: 1, padding: '1rem', backgroundColor: '#e6fffa', borderRadius: '8px', textAlign: 'center', border: '1px solid #38b2ac' }}>
          <h4 style={{ margin: 0, color: '#2c7a7b' }}>Revenue</h4>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0.5rem 0 0 0' }}>
            ₹{isLoading ? '...' : dashboard.revenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div style={{ flex: 1, padding: '1rem', backgroundColor: '#fff5f5', borderRadius: '8px', textAlign: 'center', border: '1px solid #fc8181' }}>
          <h4 style={{ margin: 0, color: '#c53030' }}>Expenses</h4>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0.5rem 0 0 0' }}>
            ₹{isLoading ? '...' : dashboard.expenses.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div style={{ flex: 1, padding: '1rem', backgroundColor: '#ebf4ff', borderRadius: '8px', textAlign: 'center', border: '1px solid #63b3ed' }}>
          <h4 style={{ margin: 0, color: '#2b6cb0' }}>Net Profit</h4>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0.5rem 0 0 0', color: dashboard.profit >= 0 ? 'black' : '#c53030' }}>
            ₹{isLoading ? '...' : dashboard.profit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <hr style={{ marginBottom: '2rem', border: '0', borderTop: '1px solid #eaeaea' }} />

      {/* INPUT FORM */}
      <h3 style={{ margin: '0 0 1rem 0' }}>Add New Transaction</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Date</label>
          <input type="date" required style={highlightedInputStyle}
            value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Type</label>
          <select style={highlightedInputStyle}
            value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
            <option value="Revenue">Revenue</option>
            <option value="Expense">Expense</option>
          </select>
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Amount (₹)</label>
          <input type="number" step="0.01" required style={highlightedInputStyle}
            value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
        </div>
        
        <button type="submit" style={{ padding: '0.85rem', cursor: 'pointer', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '8px', marginTop: '1rem', fontWeight: 'bold', fontSize: '1.1rem' }}>
          Add to Tracker
        </button>
      </form>
    </main>
  );
}