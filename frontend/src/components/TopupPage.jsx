import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

function TopupPage() {
  // keep your constant user for now
  const TEST_USER_ID = "507f1f77bcf86cd799439011";
  const location = useLocation();
  const navigate = useNavigate();

  // === existing states you already had for cards/UI ===
  const [selectedCard, setSelectedCard] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [nfcCards, setNfcCards] = useState([]);

  // === booking data from seat selection (not from database yet) ===
  const [bookingData, setBookingData] = useState(null);
  const [fare, setFare] = useState(0);

  // ---- keep your old distance/route logic commented (as you asked) ----
  // const [routeNumber, setRouteNumber] = useState('');
  // const [routeData, setRouteData] = useState(null);
  // const [distance, setDistance] = useState(0);
  // const calculateFare = () => { /* old logic */ };
  // useEffect(() => { calculateFare(); }, [distance]);
  // --------------------------------------------------------------------

  // Load NFC cards + get booking data from navigation state
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setMessage('');

        // Load NFC cards
        const cards = await api.getSmartCards(TEST_USER_ID);
        setNfcCards(cards || []);

        // Get booking data from navigation state (from SeatLayout)
        if (location.state && location.state.bookingData) {
          const data = location.state.bookingData;
          setBookingData(data);
          setFare(data.totalFare || 0);
        } else {
          setBookingData(null);
          setFare(0);
          setMessage('ℹ️ No booking data found. Please select seats first.');
        }
      } catch (err) {
        console.error('Init error:', err);
        setMessage('❌ Failed to load cards: ' + err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [location.state]);


  const bookingInfo = useMemo(() => {
    if (!bookingData) return null;

    // Map of stop IDs to stop names (from our database)
    const stopNames = {
      '68d441acd1ce3741243f1b42': 'Kaduwela',
      '68d441e4d1ce3741243f1b44': 'Kothalawala',
      '68d44208d1ce3741243f1b46': 'SLIIT Halt',
      '68d44235d1ce3741243f1b4b': 'Malabe',
      '68d450ac1863f0ff0dd9d2b1': 'Maharagama',
      '68d450e91863f0ff0dd9d2b3': 'Apeksha Hospital',
      '68d451241863f0ff0dd9d2b8': 'Ambillawatta',
      '68d4513f1863f0ff0dd9d2bb': 'Boralesgamuwa',
      '68d451691863f0ff0dd9d2be': 'Park Stop',
      '68d4518e1863f0ff0dd9d2c1': 'Bellanwila'
    };

    // Fix date formatting - use proper date format
    const dateStr = bookingData.travelDate ?
      new Date(bookingData.travelDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }) : '—';

    const fromName = bookingData.fromStopId?.stopName || stopNames[bookingData.fromStopId] || bookingData.fromStopId || '—';
    const toName = bookingData.toStopId?.stopName || stopNames[bookingData.toStopId] || bookingData.toStopId || '—';
    const seats = Array.isArray(bookingData.seatNumbers) ? bookingData.seatNumbers.join(', ') : '';
    const bus = bookingData.busInfo?.vehicleNumber || 'Bus';
    const vType = bookingData.busInfo?.vehicleType || '';

    // Get route information
    const routeInfo = bookingData.busInfo?.route;
    const routeDisplay = routeInfo ?
      `Route ${routeInfo.routeNum}: ${routeInfo.routeName}` :
      `${fromName} → ${toName}`;

    // Use real booking ID if available, otherwise temporary
    const bookingId = bookingData.bookingId || 'TEMP_' + Date.now();

    // Determine title based on payment status
    const title = bookingData.paymentStatus === 'paid' ? 'Booking Details' : 'Booking Details (Pending Payment)';

    return {
      bookingId,
      dateStr,
      routeStr: routeDisplay,
      routeInfo: routeInfo,
      fromName,
      toName,
      seats,
      bus,
      vType,
      paymentStatus: bookingData.paymentStatus || 'pending',
      bookingStatus: bookingData.bookingStatus || 'pending',
      title
    };
  }, [bookingData]);

  const handleTransportPayment = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      if (!selectedCard) {
        setMessage('❌ Please select an NFC card');
        return;
      }
      if (!bookingData) {
        setMessage('❌ No booking data found to pay for');
        return;
      }
      if (fare <= 0) {
        setMessage('❌ Invalid fare for the booking');
        return;
      }

      // Check if travel date is not in the past
      if (bookingData.travelDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedDate = new Date(bookingData.travelDate);
        selectedDate.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
          setMessage('❌ Cannot make payment for previous dates. Please select today or a future date.');
          return;
        }
      }

      // ensure card has enough balance
      const card = nfcCards.find(c => c.cardNumber === selectedCard);
      if (!card) {
        setMessage('❌ NFC card not found');
        return;
      }
      if ((card.balance || 0) < fare) {
        setMessage(`❌ Insufficient balance. Required: Rs. ${fare.toFixed(2)}, Available: Rs. ${Number(card.balance).toFixed(2)}`);
        return;
      }

      // Deduct from NFC card (your existing endpoint)
      const debit = await api.updateCardBalance(selectedCard, -fare);
      if (!debit?.success) {
        setMessage('❌ Payment failed: ' + (debit?.error || 'unknown error'));
        return;
      }

      // NOW CREATE THE BOOKING IN DATABASE AFTER SUCCESSFUL PAYMENT
      try {
        // Use actual IDs and seat numbers from bookingData to properly block seats
        const validBusId = bookingData.busId;
        const validFromStopId = bookingData.fromStopId;
        const validToStopId = bookingData.toStopId;

        const seatNumbersToBook = (bookingData.seatNumbers || []).map(String);

        console.log('Seat numbers to book:', seatNumbersToBook);
        console.log('Booking data userId:', bookingData.userId);
        console.log('Using userId:', bookingData.userId || TEST_USER_ID);
        console.log('Fare amount:', fare);
        console.log('Travel date:', bookingData.travelDate);

        // Create new booking
        const bookingPayload = {
          busId: validBusId,
          userId: bookingData.userId || TEST_USER_ID,
          seatNumbers: seatNumbersToBook,
          fromStopId: validFromStopId,
          toStopId: validToStopId,
          passengerDetails: bookingData.passengerDetails,
          totalFare: fare, // Use the fare state that was displayed to user and deducted from card
          travelDate: bookingData.travelDate,
          paymentStatus: 'paid' // Mark as paid since payment just succeeded
        };

        console.log('Booking payload:', JSON.stringify(bookingPayload, null, 2));

        const bookingResult = await api.createBooking(bookingPayload);
        console.log('Booking result:', bookingResult);

        if (!bookingResult.success) {
          console.error('Booking creation failed:', bookingResult);
          throw new Error(bookingResult.message || 'Failed to create booking');
        }

        console.log('✅ Booking created successfully:', bookingResult.data);

        // Record transaction linked to the new booking
        const transactionData = {
          bookingId: bookingResult.data.bookingId,
          userId: bookingData.userId || TEST_USER_ID,
          cardNumber: selectedCard,
          amount: fare,
          transactionType: 'transport_payment',
          status: 'completed',
          paymentMethod: 'nfc_card',
          fromLocation: bookingInfo?.fromName || 'Kaduwela',
          toLocation: bookingInfo?.toName || 'Malabe',
          meta: {
            seatNumbers: bookingData.seatNumbers || [],
            travelDate: bookingData.travelDate || null,
            bus: {
              id: bookingData.busId,
              vehicleNumber: bookingData.busInfo?.vehicleNumber || ''
            }
          }
        };

        await api.addTransaction(transactionData);

        setMessage(`✅ Payment successful! Booking created. Fare: Rs. ${fare.toFixed(2)} | New balance: Rs. ${Number(debit.balance).toFixed(2)} | Booking ID: ${bookingResult.data.bookingId}`);

        setBookingData(prev => ({
          ...prev,
          paymentStatus: 'paid',
          bookingStatus: 'confirmed',
          bookingId: bookingResult.data.bookingId
        }));

        // Don't clear booking data immediately - let user see the success
        // setBookingData(null);
        // setFare(0);

      } catch (bookingErr) {
        console.error('Booking creation error:', bookingErr);
        console.error('Error details:', {
          message: bookingErr.message,
          stack: bookingErr.stack,
          name: bookingErr.name
        });
        setMessage('❌ Payment succeeded but booking creation failed: ' + bookingErr.message);
      }

      // refresh cards
      await reloadCards();
    } catch (err) {
      console.error('Payment error:', err);
      setMessage('❌ Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  async function reloadCards() {
    try {
      const cards = await api.getSmartCards(TEST_USER_ID);
      setNfcCards(cards || []);
    } catch (e) {
      console.error('Reload error:', e);
    }
  }

  if (loading && nfcCards.length === 0 && !bookingData) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div>Loading…</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Hero Section (unchanged style) */}
      <div style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)', padding: '4rem 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem', position: 'relative', zIndex: '1' }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem', color: '#ffffff' }}>
              Transport Payment
            </h1>
            <p style={{ fontSize: '1.125rem', marginBottom: '2rem', color: '#cbd5e1' }}>
              Complete your booking payment — booking will be created after successful payment.
            </p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem', paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '2rem' }}>

          {/* Payment Form (kept the same style you used) */}
          <div style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            borderRadius: '1.25rem',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            padding: '2rem',
            border: '1px solid #e2e8f0',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1f2937' }}>💳 Complete Booking Payment</h2>
            </div>

            <form onSubmit={handleTransportPayment} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* NFC Card select (unchanged) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                  Select NFC Card
                </label>
                <select
                  value={selectedCard}
                  onChange={(e) => setSelectedCard(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e2e8f0',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    outline: 'none',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    background: 'white'
                  }}
                  required
                >
                  <option value="">Choose NFC card</option>
                  {nfcCards.map((card) => (
                    <option key={card._id} value={card.cardNumber}>
                      Card #{card.cardNumber} - Rs. {Number(card.balance).toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Booking details card (from seat selection, not database yet) */}
              {bookingInfo ? (
                <div style={{
                  padding: '1.25rem',
                  borderRadius: '0.75rem',
                  background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                  border: '1px solid #cbd5e1'
                }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>📄 {bookingInfo?.title || 'Booking Details'}</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Booking ID</span>
                      <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937', margin: '0.25rem 0 0 0' }}>{bookingInfo.bookingId}</p>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bus</span>
                      <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937', margin: '0.25rem 0 0 0' }}>
                        {bookingInfo.bus} {bookingInfo.vType ? `(${bookingInfo.vType})` : ''}
                      </p>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</span>
                      <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937', margin: '0.25rem 0 0 0' }}>{bookingInfo.dateStr}</p>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Route</span>
                      <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937', margin: '0.25rem 0 0 0' }}>{bookingInfo.routeStr}</p>
                    </div>
                    {bookingInfo.seats && (
                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Seats</span>
                        <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937', margin: '0.25rem 0 0 0' }}>{bookingInfo.seats}</p>
                      </div>
                    )}
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</span>
                      <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937', margin: '0.25rem 0 0 0' }}>
                        {(bookingInfo.paymentStatus || '').toUpperCase()}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{
                  padding: '1rem',
                  borderRadius: '0.75rem',
                  background: '#fff7ed',
                  border: '1px solid #fed7aa',
                  color: '#9a3412'
                }}>
                  No booking data found. Please select seats first.
                </div>
              )}

              {/* Fare from booking */}
              {fare > 0 && (
                <div style={{
                  padding: '1.5rem',
                  borderRadius: '0.75rem',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  border: '1px solid #047857',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '1.125rem', fontWeight: '700', color: '#ffffff' }}>💰 Fare {bookingInfo?.paymentStatus === 'paid' ? '(Paid)' : '(Pending Payment)'}:</span>
                    <span style={{ fontSize: '1.75rem', fontWeight: '800', color: '#ffffff' }}>Rs. {fare.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !bookingData || fare <= 0 || bookingInfo?.paymentStatus === 'paid'}
                style={{
                  width: '100%',
                  background: loading || !bookingData || fare <= 0 || bookingInfo?.paymentStatus === 'paid' ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  color: 'white',
                  padding: '1rem 1.5rem',
                  borderRadius: '0.75rem',
                  border: 'none',
                  fontSize: '1rem',
                  fontWeight: '700',
                  cursor: loading || !bookingData || fare <= 0 || bookingInfo?.paymentStatus === 'paid' ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: loading || fare <= 0 ? 'none' : '0 6px 20px rgba(59, 130, 246, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.025em'
                }}
              >
                {loading ? '⏳ Processing Payment...' :
                  bookingInfo?.paymentStatus === 'paid' ?
                    '✅ Payment Completed' :
                    `💳 Pay Rs. ${fare.toFixed(2)}`}
              </button>
            </form>

            {message && (
              <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                borderRadius: '0.75rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                background: message.includes('✅') ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: '#ffffff',
                boxShadow: message.includes('✅') ? '0 4px 12px rgba(16, 185, 129, 0.3)' : '0 4px 12px rgba(239, 68, 68, 0.3)',
                border: message.includes('✅') ? '1px solid #047857' : '1px solid #b91c1c'
              }}>
                {message}
              </div>
            )}
          </div>

          {/* Right column panel left intact (you can keep your fare info section or replace with notes) */}
          <div style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            borderRadius: '1.25rem',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            padding: '2rem',
            border: '1px solid #e2e8f0'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem', color: '#1f2937' }}>ℹ️ Payment Process</h2>
            <p style={{ fontSize: '0.95rem', color: '#374151' }}>
              <strong>Step 1:</strong> Select seats and passenger details<br />
              <strong>Step 2:</strong> Choose NFC card for payment<br />
              <strong>Step 3:</strong> Complete payment to create booking in database<br />
              <strong>Step 4:</strong> Booking is confirmed and saved
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default TopupPage;

