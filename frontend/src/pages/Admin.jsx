import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const [members, setMembers] = useState([]);
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await axios.get('https://gym-management-system-ngbu.onrender.com/api/admin/members');
        setMembers(res.data);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };
    fetchMembers();
  }, []);

  const sendBroadcast = async (type) => {
    if (!msg) return alert("Message cannot be empty.");
    try {
      await axios.post('https://gym-management-system-ngbu.onrender.com/api/admin/broadcast', { message: msg, type: type });
      alert(`${type} Transmitted Successfully.`); 
      setMsg('');
    } catch (error) {
      alert("System connection failed.");
    }
  };

  return (
    <div className="container">
      <header className="header">
        <div className="branding-box">
          <img 
            src="/logo.jpg" 
            alt="Gym Logo" 
            className="gym-logo"
            style={{ borderRadius: '8px' }}
          />
          <h1 className="title">System <span>Admin</span></h1>
        </div>
        <button onClick={() => navigate('/')} className="btn btn-danger">Disconnect</button>
      </header>
      
      <div className="card">
        <div className="card-header">Broadcast Command Center</div>
        <textarea 
          placeholder="Input transmission data here..." 
          value={msg} 
          onChange={(e) => setMsg(e.target.value)} 
          rows="3"
        />
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-warning" onClick={() => sendBroadcast('Holiday')}>Deploy Holiday Notice</button>
          <button className="btn btn-danger" onClick={() => sendBroadcast('System Alert')}>Deploy System Alert</button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">Subject Database ({members.length} Active)</div>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Identifier (Name)</th>
                <th>Contact Link</th>
                <th>Age/Gen</th>
                <th>Current Mass</th>
                <th>Medical Record</th>
                <th>Expiration Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => {
                const isExpired = new Date(m.expiryDate) < new Date();
                return (
                  <tr key={m._id}>
                    <td style={{ fontWeight: '500' }}>{m.name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{m.phone}</td>
                    <td>{m.age || '-'} / {m.gender?.charAt(0) || '-'}</td>
                    <td><span className="badge badge-primary">{m.currentWeight} kg</span></td>
                    <td style={{ color: m.medicalHistory === 'None' ? 'var(--text-muted)' : 'var(--danger)' }}>
                      {m.medicalHistory || 'None'}
                    </td>
                    <td>{new Date(m.expiryDate).toDateString()}</td>
                    <td>
                      <span className={`badge ${isExpired ? 'badge-danger' : 'badge-success'}`}>
                        {isExpired ? 'TERMINATED' : 'ACTIVE'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Admin;