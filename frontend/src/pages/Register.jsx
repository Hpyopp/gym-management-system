import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', phone: '', password: '', weight: '', duration: '3_months', age: '', gender: 'Male', medicalHistory: ''
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', formData);
      navigate(`/dashboard/${res.data._id}`);
    } catch (error) {
      alert(error.response?.data?.message || 'Error occurred');
    }
  };

  return (
    <div className="container auth-container" style={{ maxWidth: '600px' }}>
      <div className="card">
        <h2 className="title">New Member Registration</h2>
        <form onSubmit={handleSubmit}>
          
          <div className="grid-2">
            <div className="input-group">
              <label>Full Name</label>
              <input name="name" placeholder="John Doe" onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label>Phone Number</label>
              <input name="phone" placeholder="10-digit number" onChange={handleChange} required />
            </div>
          </div>

          <div className="grid-2">
            <div className="input-group">
              <label>Age</label>
              <input name="age" type="number" placeholder="Years" onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label>Gender</label>
              <select name="gender" onChange={handleChange}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div className="input-group">
              <label>Current Weight (kg)</label>
              <input name="weight" type="number" placeholder="e.g. 75" onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label>Plan Duration</label>
              <select name="duration" onChange={handleChange}>
                <option value="1_month">1 Month</option>
                <option value="3_months">3 Months</option>
                <option value="6_months">6 Months</option>
                <option value="1_year">1 Year</option>
              </select>
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <input name="password" type="password" placeholder="Create a secure password" onChange={handleChange} required />
          </div>

          <div className="input-group">
            <label>Medical History / Injuries (Optional)</label>
            <input name="medicalHistory" placeholder="Any past injuries or conditions?" onChange={handleChange} />
          </div>

          <button type="submit" className="btn btn-primary" style={{marginTop: '20px'}}>
            Register & Generate Plan
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