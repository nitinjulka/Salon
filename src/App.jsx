import { useState, useEffect, useCallback } from 'react';
import { Toaster } from 'react-hot-toast';
import AppointmentForm from './components/AppointmentForm.jsx';
import AppointmentList from './components/AppointmentList.jsx';
import { loadAll } from './storage.js';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function App() {
  const [appointments, setAppointments] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('upcoming');

  const fetchAppointments = useCallback(() => {
    const all = loadAll();
    const today = todayStr();
    let filtered = all;
    if (filter === 'upcoming') filtered = all.filter(a => a.appointment_date >= today);
    if (filter === 'today') filtered = all.filter(a => a.appointment_date === today);
    filtered.sort((a, b) =>
      a.appointment_date.localeCompare(b.appointment_date) ||
      a.appointment_time.localeCompare(b.appointment_time)
    );
    setAppointments(filtered);
  }, [filter]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  function handleEdit(appt) {
    setEditing(appt);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleSaved() {
    fetchAppointments();
    if (editing) { setEditing(null); setShowForm(false); }
  }

  function handleCancel() {
    setEditing(null);
    setShowForm(false);
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div style={styles.container}>
      <Toaster position="top-right" />

      <header style={styles.header}>
        <div>
          <h1 style={styles.logo}>Salon Scheduler</h1>
          <p style={styles.date}>{today}</p>
        </div>
        <button style={styles.newBtn} onClick={() => { setEditing(null); setShowForm(v => !v); }}>
          {showForm && !editing ? 'Hide Form' : '+ New Appointment'}
        </button>
      </header>

      {(showForm || editing) && (
        <div style={{ marginBottom: 28 }}>
          <AppointmentForm editing={editing} onSaved={handleSaved} onCancel={handleCancel} />
        </div>
      )}

      <div style={styles.listSection}>
        <div style={styles.listHeader}>
          <h2 style={styles.listTitle}>Appointments</h2>
          <div style={styles.filters}>
            {['today', 'upcoming', 'all'].map(f => (
              <button key={f} style={{ ...styles.filterBtn, ...(filter === f ? styles.filterActive : {}) }} onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <AppointmentList appointments={appointments} onEdit={handleEdit} onRefresh={fetchAppointments} />
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: 760, margin: '0 auto', padding: '24px 16px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  logo: { fontSize: 26, fontWeight: 800, color: '#8b3a62' },
  date: { fontSize: 13, color: '#999', marginTop: 2 },
  newBtn: { background: '#8b3a62', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600 },
  listSection: {},
  listHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  listTitle: { fontSize: 18, fontWeight: 700, color: '#2d1b12' },
  filters: { display: 'flex', gap: 6 },
  filterBtn: { background: '#f0e8f0', color: '#8b3a62', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 13, fontWeight: 600 },
  filterActive: { background: '#8b3a62', color: '#fff' },
};
