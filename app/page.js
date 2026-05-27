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
    amount: '',
    item: '' 
  });
  
  // We now store both sets of data from the backend
  const [dashboard, setDashboard] = useState({ 
    allTime: { revenue: 0, expenses: 0, profit: 0 },
    thisMonth: { revenue: 0, expenses: 0, profit: 0 }
  });
  
  // State to track which view is currently selected via the toggle buttons
  const [viewMode, setViewMode] = useState('month'); // defaults to showing 'month'
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

  // Determine which data to show in the cards based on the toggle button
  const currentData = viewMode === 'month' ? dashboard.thisMonth : dashboard.allTime;

  return (
    <main style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Business Finance Tracker</h2>
      
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
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ flex: 1, padding: '1rem', backgroundColor: '#e6fffa', borderRadius: '8px', textAlign: 'center', border: '1px solid #38b2ac' }}>
          <h4 style={{ margin: 0, color: '#2c7a7b' }}>Revenue</h4>
          <p style={{ fontSize: '1.3rem', fontWeight: 'bold', margin: '0.5rem 0 0 0' }}>
            ₹{isLoading ? '...' : currentData.revenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div style={{ flex: 1, padding: '1rem', backgroundColor: '#fff5f5', borderRadius: '8px', textAlign: 'center', border: '1px solid #fc8181' }}>
          <h4 style={{ margin: 0, color: '#c53030' }}>Expenses</h4>
          <p style={{ fontSize: '1.3rem', fontWeight: 'bold', margin: '0.5rem 0 0 0' }}>
            ₹{isLoading ? '...' : currentData.expenses.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div style={{ flex: 1, padding: '1rem', backgroundColor: '#ebf4ff', borderRadius: '8px', textAlign: 'center', border: '1px solid #63b3ed' }}>
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
                    style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer' }}
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
    </main>
  );
}