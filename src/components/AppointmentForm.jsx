import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { loadAll, saveAll } from '../storage.js';

const DEFAULT_DURATIONS = { 'Haircut': 45, 'Color / Highlights': 120, 'Blowout / Styling': 60 };

const EMPTY = {
  client_name: '', client_phone: '', service: 'Haircut',
  duration_minutes: 45, price: '', deposit: '', notes: '',
  appointment_date: '', appointment_time: '',
};

export default function AppointmentForm({ onSaved, editing, onCancel }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) {
      setForm({ ...editing, price: editing.price ?? '', deposit: editing.deposit ?? '' });
    } else {
      setForm(EMPTY);
    }
  }, [editing]);

  function set(field, value) {
    setForm(prev => {
      const next = { ...prev, [field]: value };
      if (field === 'service') next.duration_minutes = DEFAULT_DURATIONS[value] || 60;
      return next;
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const all = loadAll();
      const data = {
        ...form,
        price: parseFloat(form.price) || 0,
        deposit: parseFloat(form.deposit) || 0,
      };
      if (editing) {
        saveAll(all.map(a => a.id === editing.id ? { ...a, ...data } : a));
        toast.success('Appointment updated!');
      } else {
        saveAll([...all, { ...data, id: Date.now(), confirmation_sent: false, reminder_sent: false }]);
        toast.success('Appointment booked!');
        setForm(EMPTY);
      }
      onSaved();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2 style={styles.title}>{editing ? 'Edit Appointment' : 'New Appointment'}</h2>

      <div style={styles.row}>
        <Field label="Client Name" required>
          <input style={styles.input} value={form.client_name} onChange={e => set('client_name', e.target.value)} placeholder="Jane Smith" required />
        </Field>
        <Field label="Client Phone" required>
          <input style={styles.input} value={form.client_phone} onChange={e => set('client_phone', e.target.value)} placeholder="555-867-5309" required />
        </Field>
      </div>

      <div style={styles.row}>
        <Field label="Service" required>
          <select style={styles.input} value={form.service} onChange={e => set('service', e.target.value)}>
            <option>Haircut</option>
            <option>Color / Highlights</option>
            <option>Blowout / Styling</option>
          </select>
        </Field>
        <Field label="Duration (min)">
          <input style={styles.input} type="number" min="15" step="15" value={form.duration_minutes} onChange={e => set('duration_minutes', parseInt(e.target.value))} />
        </Field>
      </div>

      <div style={styles.row}>
        <Field label="Date" required>
          <input style={styles.input} type="date" value={form.appointment_date} onChange={e => set('appointment_date', e.target.value)} required />
        </Field>
        <Field label="Time" required>
          <input style={styles.input} type="time" value={form.appointment_time} onChange={e => set('appointment_time', e.target.value)} required />
        </Field>
      </div>

      <div style={styles.row}>
        <Field label="Price ($)">
          <input style={styles.input} type="number" min="0" step="0.01" value={form.price} onChange={e => set('price', e.target.value)} placeholder="0.00" />
        </Field>
        <Field label="Deposit ($)">
          <input style={styles.input} type="number" min="0" step="0.01" value={form.deposit} onChange={e => set('deposit', e.target.value)} placeholder="0.00" />
        </Field>
      </div>

      <Field label="Notes">
        <textarea style={{ ...styles.input, height: 72, resize: 'vertical' }} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Allergies, style preferences, hair history…" />
      </Field>

      <div style={styles.actions}>
        {editing && <button type="button" onClick={onCancel} style={styles.cancelBtn}>Cancel</button>}
        <button type="submit" disabled={saving} style={styles.submitBtn}>
          {saving ? 'Saving…' : editing ? 'Save Changes' : 'Book Appointment'}
        </button>
      </div>
    </form>
  );
}

function Field({ label, children, required }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <label style={styles.label}>{label}{required && <span style={{ color: '#c0392b' }}> *</span>}</label>
      {children}
    </div>
  );
}

const styles = {
  form: { background: '#fff', borderRadius: 12, padding: 28, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' },
  title: { fontSize: 20, fontWeight: 700, marginBottom: 20, color: '#8b3a62' },
  row: { display: 'flex', gap: 16, marginBottom: 16 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#555' },
  input: { width: '100%', border: '1.5px solid #e0cdd8', borderRadius: 8, padding: '10px 12px', fontSize: 14, outline: 'none', background: '#fdf6f0' },
  actions: { display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 },
  submitBtn: { background: '#8b3a62', color: '#fff', border: 'none', borderRadius: 8, padding: '11px 24px', fontSize: 14, fontWeight: 600 },
  cancelBtn: { background: 'transparent', color: '#8b3a62', border: '1.5px solid #8b3a62', borderRadius: 8, padding: '11px 24px', fontSize: 14, fontWeight: 600 },
};
