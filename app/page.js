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

export default function Home() {
  const [formData, setFormData] = useState({
    date: getTodayDate(), 
    type: 'Revenue', 
    amount: '',
    item: '' 
  });
  
  const [dashboard, setDashboard] = useState({ 
    allTime: { revenue: 0, expenses: 0, profit: 0 },
    thisMonth: { revenue: 0, expenses: 0, profit: 0 },
    history: [] 
  });
  
  const [viewMode, setViewMode] = useState('month');
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/finance');
      if (!res.ok) return;
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
        setFormData({ date: getTodayDate(), type: 'Revenue', amount: '', item: '' });
        fetchDashboardData(); 
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (err) {
      alert(`Network error: ${err.message}`);
    }
  };

  const highlightedInputStyle = {
    width: '100%', padding: '0.75rem', border: '2px solid #0070f3',
    borderRadius: '8px', backgroundColor: '#f0f7ff', fontSize: '1rem', outline: 'none'              
  };

  const currentData = viewMode === 'month' ? dashboard.thisMonth : dashboard.allTime;

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        .app-container { padding: 2rem; max-width: 600px; margin: 0 auto; font-family: sans-serif; }
        .dashboard-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem; }
        .history-item { display: flex; justify-content: space-between; align-items: center; }
        @media (max-width: 500px) {
          .app-container { padding: 1rem; }
          .dashboard-grid { grid-template-columns: 1fr; gap: 0.75rem; }
          .history-item { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
          .history-amount { align-self: flex-end; }
        }
      `}</style>

      <main className="app-container">
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Business Finance Tracker</h2>
        
        {/* BIG BUTTON TO SWITCH TO PENDING */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
          <Link href="/pending" style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#dd6b20', 
            color: 'white',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            Switch to Pending Dues ⇄
          </Link>
        </div>
        
        {/* TOGGLE SWITCH */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <button 
            onClick={() => setViewMode('month')} 
            style={{ padding: '0.5rem 1rem', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s', backgroundColor: viewMode === 'month' ? '#0070f3' : '#e2e8f0', color: viewMode === 'month' ? 'white' : '#4a5568' }}>
            This Month
          </button>
          <button 
            onClick={() => setViewMode('all')} 
            style={{ padding: '0.5rem 1rem', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s', backgroundColor: viewMode === 'all' ? '#0070f3' : '#e2e8f0', color: viewMode === 'all' ? 'white' : '#4a5568' }}>
            All Time
          </button>
        </div>
        
        {/* DASHBOARD CARDS */}
        <div className="dashboard-grid">
          <div style={{ padding: '1rem', backgroundColor: '#e6fffa', borderRadius: '8px', textAlign: 'center', border: '1px solid #38b2ac' }}>
            <h4 style={{ margin: 0, color: '#2c7a7b' }}>Revenue</h4>
            <p style={{ fontSize: '1.3rem', fontWeight: 'bold', margin: '0.5rem 0 0 0' }}>
              ₹{isLoading ? '...' : currentData.revenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          <div style={{ padding: '1rem', backgroundColor: '#fff5f5', borderRadius: '8px', textAlign: 'center', border: '1px solid #fc8181' }}>
            <h4 style={{ margin: 0, color: '#c53030' }}>Expenses</h4>
            <p style={{ fontSize: '1.3rem', fontWeight: 'bold', margin: '0.5rem 0 0 0' }}>
              ₹{isLoading ? '...' : currentData.expenses.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          <div style={{ padding: '1rem', backgroundColor: '#ebf4ff', borderRadius: '8px', textAlign: 'center', border: '1px solid #63b3ed' }}>
            <h4 style={{ margin: 0, color: '#2b6cb0' }}>Net Profit</h4>
            <p style={{ fontSize: '1.3rem', fontWeight: 'bold', margin: '0.5rem 0 0 0', color: currentData.profit >= 0 ? 'black' : '#c53030' }}>
              ₹{isLoading ? '...' : currentData.profit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
              value={formData.type} 
              onChange={e => setFormData({...formData, type: e.target.value, item: ''})}>
              <option value="Revenue">Revenue</option>
              <option value="Expense">Expense</option>
            </select>
          </div>

          {formData.type === 'Expense' && (
            <div style={{ padding: '1rem', backgroundColor: '#fff5f5', border: '1px solid #fc8181', borderRadius: '8px' }}>
              <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 'bold', color: '#c53030' }}>Expense Item:</label>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {['Plastic cover', 'LPG', 'Electricity', 'Rent'].map((option) => (
                  <label key={option} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '1.1rem' }}>
                    <input 
                      type="radio" 
                      name="expenseItem"
                      value={option}
                      required={formData.type === 'Expense'} 
                      checked={formData.item === option}
                      onChange={e => setFormData({...formData, item: e.target.value})}
                      style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer', flexShrink: 0 }}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>
          )}
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Amount (₹)</label>
            <input type="number" step="0.01" required style={highlightedInputStyle}
              value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
          </div>
          
          <button type="submit" style={{ padding: '0.85rem', cursor: 'pointer', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '8px', marginTop: '1rem', fontWeight: 'bold', fontSize: '1.1rem' }}>
            Add to Tracker
          </button>
        </form>

        {/* RECENT TRANSACTIONS HISTORY */}
        <hr style={{ margin: '2.5rem 0 1.5rem 0', border: '0', borderTop: '1px solid #eaeaea' }} />
        <h3 style={{ margin: '0 0 1rem 0' }}>Recent Transactions</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {dashboard.history && dashboard.history.length > 0 ? (
            dashboard.history.map((tx, index) => (
              <div key={index} className="history-item" style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.1rem', color: '#2d3748' }}>
                    {tx.type} {tx.item ? `(${tx.item})` : ''}
                  </p>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: '#718096' }}>{tx.date}</p>
                </div>
                <div className="history-amount">
                  <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.1rem', color: tx.type === 'Revenue' ? '#38a169' : '#e53e3e' }}>
                    {tx.type === 'Revenue' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: '#a0aec0', fontStyle: 'italic' }}>{isLoading ? 'Loading history...' : 'No recent transactions found.'}</p>
          )}
        </div>
      </main>
    </>
  );
}