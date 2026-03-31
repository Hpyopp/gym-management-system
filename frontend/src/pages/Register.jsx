import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  // FIXED: Default duration set to '1_month'
  const [formData, setFormData] = useState({
    gymCode: '', name: '', phone: '', password: '', weight: '', duration: '1_month', age: '', gender: 'Male', medicalHistory: ''
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://gym-management-system-ngbu.onrender.com/api/auth/register', formData);
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userInfo', JSON.stringify(res.data));

      navigate(`/dashboard/${res.data._id}`);
    } catch (error) {
      alert(error.response?.data?.message || 'Registration Error occurred');
    }
  };

  return (
    <div className="container auth-container" style={{ maxWidth: '600px' }}>
      <div className="card">
        <h2 className="title">New Member Registration</h2>
        <form onSubmit={handleSubmit}>
          
          <div className="input-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>Gym Invite Code</label>
            <input 
              name="gymCode" 
              placeholder="e.g. OMFIT99 (Ask your Gym Owner)" 
              value={formData.gymCode}
              onChange={handleChange} 
              style={{ border: '2px solid var(--accent-primary)' }}
              required 
            />
          </div>

          <div className="grid-2">
            <div className="input-group">
              <label>Full Name</label>
              <input name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label>Phone Number</label>
              <input name="phone" placeholder="10-digit number" value={formData.phone} onChange={handleChange} required />
            </div>
          </div>
          <div className="grid-2">
            <div className="input-group">
              <label>Age</label>
              <input name="age" type="number" placeholder="Years" value={formData.age} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label>Gender</label>
              {/* FIXED: Controlled Select */}
              <select name="gender" value={formData.gender} onChange={handleChange}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>
          <div className="grid-2">
            <div className="input-group">
              <label>Current Weight (kg)</label>
              <input name="weight" type="number" placeholder="e.g. 75" value={formData.weight} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label>Plan Duration</label>
              {/* FIXED: Controlled Select */}
              <select name="duration" value={formData.duration} onChange={handleChange}>
                <option value="1_month">1 Month</option>
                <option value="3_months">3 Months</option>
                <option value="6_months">6 Months</option>
                <option value="1_year">1 Year</option>
              </select>
            </div>
          </div>
          <div className="input-group">
            <label>Password</label>
            <input name="password" type="password" placeholder="Create a secure password" value={formData.password} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label>Medical History / Injuries (Optional)</label>
            <input name="medicalHistory" placeholder="Any past injuries or conditions?" value={formData.medicalHistory} onChange={handleChange} />
          </div>
          <button type="submit" className="btn btn-primary" style={{marginTop: '20px', width: '100%'}}>
            Verify Gym & Generate Plan
          </button>
        </form>
        <div className="link-text">
          Already a member? <Link to="/">Login Here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;