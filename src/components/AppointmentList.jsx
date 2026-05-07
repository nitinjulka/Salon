import toast from 'react-hot-toast';
import { loadAll, saveAll } from '../storage.js';

const SERVICE_COLORS = {
  'Haircut': '#d4a5c9',
  'Color / Highlights': '#f0c070',
  'Blowout / Styling': '#a8d8b9',
};

function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${((h % 12) || 12)}:${m.toString().padStart(2, '0')} ${ampm}`;
}

export default function AppointmentList({ appointments, onEdit, onRefresh }) {
  function handleDelete(id, name) {
    if (!window.confirm(`Delete appointment for ${name}?`)) return;
    try {
      saveAll(loadAll().filter(a => a.id !== id));
      toast.success('Appointment deleted');
      onRefresh();
    } catch {
      toast.error('Failed to delete');
    }
  }

  if (appointments.length === 0) {
    return (
      <div style={styles.empty}>
        <p>No upcoming appointments.</p>
        <p style={{ fontSize: 13, color: '#aaa', marginTop: 6 }}>Book one above to get started.</p>
      </div>
    );
  }

  const groups = {};
  for (const appt of appointments) {
    if (!groups[appt.appointment_date]) groups[appt.appointment_date] = [];
    groups[appt.appointment_date].push(appt);
  }

  return (
    <div>
      {Object.entries(groups).map(([date, appts]) => (
        <div key={date} style={{ marginBottom: 24 }}>
          <div style={styles.dateHeader}>{formatDate(date)}</div>
          {appts.map(appt => (
            <div key={appt.id} style={styles.card}>
              <div style={{ ...styles.serviceTag, background: SERVICE_COLORS[appt.service] || '#e0d0e8' }} />
              <div style={styles.cardBody}>
                <div style={styles.topRow}>
                  <span style={styles.clientName}>{appt.client_name}</span>
                  <span style={styles.time}>{formatTime(appt.appointment_time)}</span>
                </div>
                <div style={styles.meta}>
                  <span>{appt.client_phone}</span>
                  <span>{appt.duration_minutes} min</span>
                  {appt.price > 0 && <span>${appt.price.toFixed(2)}{appt.deposit > 0 ? ` (deposit $${appt.deposit.toFixed(2)})` : ''}</span>}
                </div>
                {appt.notes && <div style={styles.notes}>{appt.notes}</div>}
              </div>
              <div style={styles.actions}>
                <button style={styles.editBtn} onClick={() => onEdit(appt)}>Edit</button>
                <button style={styles.deleteBtn} onClick={() => handleDelete(appt.id, appt.client_name)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

const styles = {
  empty: { background: '#fff', borderRadius: 12, padding: 40, textAlign: 'center', color: '#999', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  dateHeader: { fontSize: 13, fontWeight: 700, color: '#8b3a62', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, paddingLeft: 4 },
  card: { background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', marginBottom: 10, display: 'flex', alignItems: 'stretch', overflow: 'hidden' },
  serviceTag: { width: 8, flexShrink: 0 },
  cardBody: { flex: 1, padding: '14px 16px' },
  topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  clientName: { fontWeight: 700, fontSize: 16 },
  time: { fontWeight: 600, color: '#8b3a62', fontSize: 15 },
  meta: { display: 'flex', gap: 14, fontSize: 13, color: '#777', marginBottom: 6 },
  notes: { fontSize: 13, color: '#555', fontStyle: 'italic', marginBottom: 6 },
  actions: { display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6, padding: '12px 14px', borderLeft: '1px solid #f0e8f0' },
  editBtn: { background: '#f5eaf2', color: '#8b3a62', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 13, fontWeight: 600 },
  deleteBtn: { background: '#fff0f0', color: '#c0392b', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 13, fontWeight: 600 },
};
