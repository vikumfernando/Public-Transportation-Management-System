import { useState, useEffect } from 'react';
import { api } from '../services/api';

function RevenueDashboard() {
  const [revenueStats, setRevenueStats] = useState(null);
  const [activeCardsCount, setActiveCardsCount] = useState(null);
  const [overallRevenue, setOverallRevenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [customRangeRevenue, setCustomRangeRevenue] = useState(null);

  useEffect(() => {
    loadRevenueData();
  }, [selectedPeriod]);

  const loadRevenueData = async () => {
    try {
      setLoading(true);
      
      const [statsData, cardsData, overallData] = await Promise.all([
        api.getRevenueStats(selectedPeriod),
        api.getActiveCardsCount(),
        api.getOverallRevenue('daily')
      ]);
      
      setRevenueStats(statsData);
      setActiveCardsCount(cardsData);
      setOverallRevenue(overallData);
    } catch (error) {
      console.error('Error loading revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomDateRange = async () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      alert('Please select both start and end dates');
      return;
    }

    try {
      const customData = await api.getRevenueByDateRange(dateRange.startDate, dateRange.endDate);
      setCustomRangeRevenue(customData);
    } catch (error) {
      console.error('Error loading custom date range revenue:', error);
    }
  };

  const formatCurrency = (amount) => {
    return `Rs. ${(amount / 100).toFixed(2)}`;
  };

  const formatNumber = (num) => {
    return num.toLocaleString();
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{textAlign: 'center'}}>
          <div style={{
            width: '3rem',
            height: '3rem',
            border: '3px solid #e5e7eb',
            borderTop: '3px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem auto'
          }}></div>
          <div style={{fontSize: '1.125rem', color: '#374151'}}>Loading revenue data...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{backgroundColor: '#F0EBE8', minHeight: '100vh', padding: '2rem'}}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
        borderRadius: '1rem',
        padding: '2rem',
        marginBottom: '2rem',
        color: 'white',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '800',
          marginBottom: '0.5rem',
          background: 'linear-gradient(45deg, #60a5fa, #34d399)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          📊 Revenue Dashboard
        </h1>
        <p style={{fontSize: '1.125rem', opacity: '0.9'}}>
          Comprehensive revenue analytics and insights
        </p>
      </div>

      <div style={{maxWidth: '1400px', margin: '0 auto'}}>
        {/* Period Selection */}
        <div style={{
          background: 'white',
          borderRadius: '1rem',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937'}}>
            📅 Time Period Selection
          </h3>
          <div style={{display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap'}}>
            <div>
              <label style={{fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginRight: '0.5rem'}}>
                Period:
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                style={{
                  padding: '0.5rem 1rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  backgroundColor: 'white'
                }}
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="1y">Last Year</option>
              </select>
            </div>
            
            <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
              <label style={{fontSize: '0.875rem', fontWeight: '500', color: '#374151'}}>
                Custom Range:
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                style={{
                  padding: '0.5rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem'
                }}
              />
              <span style={{color: '#6b7280'}}>to</span>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                style={{
                  padding: '0.5rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem'
                }}
              />
              <button
                onClick={handleCustomDateRange}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Get Revenue
              </button>
            </div>
          </div>
        </div>

        {/* Revenue Overview Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {/* Total Revenue */}
          <div style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            borderRadius: '1rem',
            padding: '2rem',
            color: 'white',
            boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)'
          }}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <div>
                <h3 style={{fontSize: '1rem', fontWeight: '500', opacity: '0.9', margin: '0 0 0.5rem 0'}}>
                  Total Revenue
                </h3>
                <p style={{fontSize: '2.5rem', fontWeight: '800', margin: '0'}}>
                  {revenueStats ? formatCurrency(revenueStats.revenue.netRevenue) : 'Rs. 0.00'}
                </p>
              </div>
              <div style={{
                width: '4rem',
                height: '4rem',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem'
              }}>
                💰
              </div>
            </div>
          </div>

          {/* Fare Revenue */}
          <div style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            borderRadius: '1rem',
            padding: '2rem',
            color: 'white',
            boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)'
          }}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <div>
                <h3 style={{fontSize: '1rem', fontWeight: '500', opacity: '0.9', margin: '0 0 0.5rem 0'}}>
                  Fare Revenue
                </h3>
                <p style={{fontSize: '2.5rem', fontWeight: '800', margin: '0'}}>
                  {revenueStats ? formatCurrency(revenueStats.revenue.totalFareRevenue) : 'Rs. 0.00'}
                </p>
              </div>
              <div style={{
                width: '4rem',
                height: '4rem',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem'
              }}>
                🚌
              </div>
            </div>
          </div>

          {/* Top-up Revenue */}
          <div style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            borderRadius: '1rem',
            padding: '2rem',
            color: 'white',
            boxShadow: '0 8px 25px rgba(245, 158, 11, 0.3)'
          }}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <div>
                <h3 style={{fontSize: '1rem', fontWeight: '500', opacity: '0.9', margin: '0 0 0.5rem 0'}}>
                  Top-up Revenue
                </h3>
                <p style={{fontSize: '2.5rem', fontWeight: '800', margin: '0'}}>
                  {revenueStats ? formatCurrency(revenueStats.revenue.totalTopupRevenue) : 'Rs. 0.00'}
                </p>
              </div>
              <div style={{
                width: '4rem',
                height: '4rem',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem'
              }}>
                💳
              </div>
            </div>
          </div>

          {/* Active Cards */}
          <div style={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            borderRadius: '1rem',
            padding: '2rem',
            color: 'white',
            boxShadow: '0 8px 25px rgba(139, 92, 246, 0.3)'
          }}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <div>
                <h3 style={{fontSize: '1rem', fontWeight: '500', opacity: '0.9', margin: '0 0 0.5rem 0'}}>
                  Active Cards
                </h3>
                <p style={{fontSize: '2.5rem', fontWeight: '800', margin: '0'}}>
                  {activeCardsCount ? formatNumber(activeCardsCount.activeCards) : '0'}
                </p>
              </div>
              <div style={{
                width: '4rem',
                height: '4rem',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem'
              }}>
                📱
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Statistics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <h4 style={{fontSize: '1rem', fontWeight: '600', color: '#374151', margin: '0 0 0.5rem 0'}}>
              Fare Transactions
            </h4>
            <p style={{fontSize: '2rem', fontWeight: '800', color: '#3b82f6', margin: '0'}}>
              {revenueStats ? formatNumber(revenueStats.transactions.totalFareTransactions) : '0'}
            </p>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <h4 style={{fontSize: '1rem', fontWeight: '600', color: '#374151', margin: '0 0 0.5rem 0'}}>
              Top-up Transactions
            </h4>
            <p style={{fontSize: '2rem', fontWeight: '800', color: '#f59e0b', margin: '0'}}>
              {revenueStats ? formatNumber(revenueStats.transactions.totalTopupTransactions) : '0'}
            </p>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <h4 style={{fontSize: '1rem', fontWeight: '600', color: '#374151', margin: '0 0 0.5rem 0'}}>
              Total Cards
            </h4>
            <p style={{fontSize: '2rem', fontWeight: '800', color: '#8b5cf6', margin: '0'}}>
              {activeCardsCount ? formatNumber(activeCardsCount.totalCards) : '0'}
            </p>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <h4 style={{fontSize: '1rem', fontWeight: '600', color: '#374151', margin: '0 0 0.5rem 0'}}>
              Blocked Cards
            </h4>
            <p style={{fontSize: '2rem', fontWeight: '800', color: '#ef4444', margin: '0'}}>
              {activeCardsCount ? formatNumber(activeCardsCount.blockedCards) : '0'}
            </p>
          </div>
        </div>

        {/* Custom Date Range Results */}
        {customRangeRevenue && (
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', marginBottom: '1rem'}}>
              📅 Custom Date Range Results
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              <div style={{textAlign: 'center'}}>
                <h4 style={{fontSize: '1rem', fontWeight: '600', color: '#374151', margin: '0 0 0.5rem 0'}}>
                  Total Revenue
                </h4>
                <p style={{fontSize: '1.5rem', fontWeight: '800', color: '#10b981', margin: '0'}}>
                  {formatCurrency(customRangeRevenue.revenue.totalRevenue)}
                </p>
              </div>
              <div style={{textAlign: 'center'}}>
                <h4 style={{fontSize: '1rem', fontWeight: '600', color: '#374151', margin: '0 0 0.5rem 0'}}>
                  Transactions
                </h4>
                <p style={{fontSize: '1.5rem', fontWeight: '800', color: '#3b82f6', margin: '0'}}>
                  {formatNumber(customRangeRevenue.revenue.totalTransactions)}
                </p>
              </div>
              <div style={{textAlign: 'center'}}>
                <h4 style={{fontSize: '1rem', fontWeight: '600', color: '#374151', margin: '0 0 0.5rem 0'}}>
                  Avg Amount
                </h4>
                <p style={{fontSize: '1.5rem', fontWeight: '800', color: '#f59e0b', margin: '0'}}>
                  {formatCurrency(customRangeRevenue.revenue.avgTransactionAmount)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Daily Breakdown */}
        {revenueStats && revenueStats.dailyBreakdown && revenueStats.dailyBreakdown.length > 0 && (
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', marginBottom: '1rem'}}>
              📈 Daily Revenue Breakdown
            </h3>
            <div style={{overflowX: 'auto'}}>
              <table style={{width: '100%', borderCollapse: 'collapse'}}>
                <thead>
                  <tr style={{borderBottom: '2px solid #e5e7eb'}}>
                    <th style={{padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151'}}>Date</th>
                    <th style={{padding: '1rem', textAlign: 'right', fontWeight: '600', color: '#374151'}}>Revenue</th>
                    <th style={{padding: '1rem', textAlign: 'right', fontWeight: '600', color: '#374151'}}>Transactions</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueStats.dailyBreakdown.slice(-10).map((day, index) => (
                    <tr key={index} style={{borderBottom: '1px solid #f3f4f6'}}>
                      <td style={{padding: '1rem', color: '#374151'}}>
                        {day._id.year}-{String(day._id.month).padStart(2, '0')}-{String(day._id.day).padStart(2, '0')}
                      </td>
                      <td style={{padding: '1rem', textAlign: 'right', fontWeight: '600', color: '#10b981'}}>
                        {formatCurrency(day.dailyRevenue)}
                      </td>
                      <td style={{padding: '1rem', textAlign: 'right', fontWeight: '600', color: '#3b82f6'}}>
                        {formatNumber(day.dailyTransactions)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Top Routes */}
        {revenueStats && revenueStats.topRoutes && revenueStats.topRoutes.length > 0 && (
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', marginBottom: '1rem'}}>
              🚌 Top Revenue Routes
            </h3>
            <div style={{overflowX: 'auto'}}>
              <table style={{width: '100%', borderCollapse: 'collapse'}}>
                <thead>
                  <tr style={{borderBottom: '2px solid #e5e7eb'}}>
                    <th style={{padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151'}}>Route ID</th>
                    <th style={{padding: '1rem', textAlign: 'right', fontWeight: '600', color: '#374151'}}>Revenue</th>
                    <th style={{padding: '1rem', textAlign: 'right', fontWeight: '600', color: '#374151'}}>Transactions</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueStats.topRoutes.map((route, index) => (
                    <tr key={index} style={{borderBottom: '1px solid #f3f4f6'}}>
                      <td style={{padding: '1rem', color: '#374151'}}>
                        Route {route._id}
                      </td>
                      <td style={{padding: '1rem', textAlign: 'right', fontWeight: '600', color: '#10b981'}}>
                        {formatCurrency(route.routeRevenue)}
                      </td>
                      <td style={{padding: '1rem', textAlign: 'right', fontWeight: '600', color: '#3b82f6'}}>
                        {formatNumber(route.routeTransactions)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RevenueDashboard;
