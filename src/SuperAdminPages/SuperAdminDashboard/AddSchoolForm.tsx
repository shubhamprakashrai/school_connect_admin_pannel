import React, { useState, useEffect } from 'react';

interface AdminUser {
  username: string;
  password: string;
  email: string;
  fullName: string;
}

interface SchoolAnalytics {
  totalStudents?: number;
  totalTeachers?: number;
  avgAttendance?: number;
  lastUpdated?: string;
}

interface School {
  id: number;
  name: string;
  schoolCode: string;
  type: string;
  board: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  contactEmail: string;
  contactPhone: string;
  website?: string;
  establishedYear?: number;
  principalName?: string;
  totalClassrooms?: number;
  hasTransportation?: boolean;
  hasCafeteria?: boolean;
  analytics?: SchoolAnalytics;
  adminUser: AdminUser;
}

const initialSchoolState: Omit<School, 'id'> = {
  name: '',
  schoolCode: '',
  type: 'school',
  board: 'CBSE', // Default to CBSE, can be changed
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  contactEmail: '',
  contactPhone: '',
  website: '',
  establishedYear: new Date().getFullYear(),
  principalName: '',
  totalClassrooms: 0,
  hasTransportation: false,
  hasCafeteria: false,

  analytics: {
    totalStudents: 0,
    totalTeachers: 0,
    avgAttendance: 0,
    lastUpdated: new Date().toISOString()
  },
  adminUser: {
    username: '',
    password: '',
    email: '',
    fullName: ''
  }
};

const AddSchoolForm: React.FC = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [newSchool, setNewSchool] = useState<Omit<School, 'id'>>(initialSchoolState);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    console.log('SchoolDashboard mounted');
    return () => console.log('SchoolDashboard unmounted');
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const inputValue = type === 'number' ? Number(value) : value;
    
    if (name === 'adminUsername' || name === 'adminPassword' || 
        name === 'adminEmail' || name === 'adminFullName') {
      const adminField = name.replace('admin', '').toLowerCase() as keyof AdminUser;
      setNewSchool(prev => ({
        ...prev,
        adminUser: {
          ...prev.adminUser,
          [adminField]: value
        }
      }));
    } else if (name === 'hasTransportation' || name === 'hasCafeteria') {
      setNewSchool(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else {
      setNewSchool(prev => ({
        ...prev,
        [name]: inputValue
      }));
    }
  };

  const resetForm = () => {
    setNewSchool({
      ...initialSchoolState,
      // Reset analytics with current timestamp
      analytics: {
        totalStudents: 0,
        totalTeachers: 0,
        avgAttendance: 0,
        lastUpdated: new Date().toISOString()
      },
      // Reset admin user
      adminUser: {
        username: '',
        password: '',
        email: '',
        fullName: ''
      },
      // Reset facilities
     
    });
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Required fields validation
    const requiredFields = [
      'name', 'email', 'phone', 'address', 'city', 'state', 'pincode',
      'contactEmail', 'contactPhone', 'schoolCode', 'board'
    ];
    
    const missingFields = requiredFields.filter(field => !newSchool[field as keyof typeof newSchool]);
    
    // Validate admin user fields
    const requiredAdminFields = ['username', 'email', 'fullName', 'password'];
    const missingAdminFields = requiredAdminFields.filter(
      field => !newSchool.adminUser[field as keyof AdminUser]
    );
    
    if (missingFields.length > 0 || missingAdminFields.length > 0) {
      const missingFieldsList = [
        ...missingFields,
        ...missingAdminFields.map(field => `Admin ${field}`)
      ].join(', ');
      
      alert(`Please fill in all required fields: ${missingFieldsList}`);
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newSchool.email)) {
      alert('Please enter a valid email address');
      return;
    }
    
    // Validate contact phone
    const phoneRegex = /^[0-9\-+()\s]+$/;
    if (!phoneRegex.test(newSchool.phone) || !phoneRegex.test(newSchool.contactPhone)) {
      alert('Please enter a valid phone number');
      return;
    }
    
    // Update or add school
    const updatedSchool = {
      ...newSchool,
      // Ensure all analytics fields are numbers
      analytics: {
        totalStudents: Number(newSchool.analytics?.totalStudents) || 0,
        totalTeachers: Number(newSchool.analytics?.totalTeachers) || 0,
        avgAttendance: Number(newSchool.analytics?.avgAttendance) || 0,
        lastUpdated: new Date().toISOString()
      },
    };
    
    if (editingId !== null) {
      setSchools(schools.map(school => 
        school.id === editingId ? { ...updatedSchool, id: editingId } : school
      ));
    } else {
      setSchools([...schools, { ...updatedSchool, id: Date.now() }]);
    }
    
    resetForm();
  };

  const handleEdit = (school: School) => {
    setNewSchool({
      name: school.name,
      schoolCode: school.schoolCode,
      type: school.type,
      board: school.board,
      email: school.email,
      phone: school.phone,
      address: school.address,
      city: school.city,
      state: school.state,
      pincode: school.pincode,
      contactEmail: school.contactEmail,
      contactPhone: school.contactPhone,
      website: school.website || '',
      establishedYear: school.establishedYear || new Date().getFullYear(),
      principalName: school.principalName || '',
      totalClassrooms: school.totalClassrooms || 0,
      hasTransportation: school.hasTransportation || false,
      hasCafeteria: school.hasCafeteria || false,

      analytics: {
        totalStudents: school.analytics?.totalStudents || 0,
        totalTeachers: school.analytics?.totalTeachers || 0,
        avgAttendance: school.analytics?.avgAttendance || 0,
        lastUpdated: school.analytics?.lastUpdated || new Date().toISOString()
      },
      adminUser: { 
        username: school.adminUser?.username || '',
        email: school.adminUser?.email || '',
        fullName: school.adminUser?.fullName || '',
        password: school.adminUser?.password || ''
      }
    });
    setEditingId(school.id);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this school?')) {
      setSchools(schools.filter(school => school.id !== id));
    }
  };

  // Simple test to check if component renders
  console.log('Rendering SchoolDashboard');
  
  return (
    <div className="form-page">
      <div className="form-container">
        <h1>{editingId !== null ? 'Edit School' : 'Add New School'}</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>School Name *</label>
              <input
                type="text"
                name="name"
                value={newSchool.name}
                onChange={handleInputChange}
                required
                placeholder="Enter school name"
              />
            </div>

            <div className="form-group">
              <label>School Code *</label>
              <input
                type="text"
                name="schoolCode"
                value={newSchool.schoolCode}
                onChange={handleInputChange}
                required
                placeholder="e.g., SC12345"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>School Type *</label>
              <select
                name="type"
                value={newSchool.type}
                onChange={handleInputChange}
                className="form-control"
                required
              >
                <option value="school">School</option>
                <option value="college">College</option>
                <option value="university">University</option>
                <option value="coaching">Coaching Institute</option>
              </select>
            </div>

            <div className="form-group">
              <label>Education Board *</label>
              <select
                name="board"
                value={newSchool.board}
                onChange={handleInputChange}
                className="form-control"
                required
              >
                <option value="CBSE">CBSE</option>
                <option value="ICSE">ICSE</option>
                <option value="State Board">State Board</option>
                <option value="IB">International Baccalaureate</option>
                <option value="IGCSE">IGCSE</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Established Year</label>
              <input
                type="number"
                name="establishedYear"
                value={newSchool.establishedYear}
                onChange={handleInputChange}
                min="1900"
                max={new Date().getFullYear()}
                placeholder="Established year"
              />
            </div>

            <div className="form-group">
              <label>Principal Name</label>
              <input
                type="text"
                name="principalName"
                value={newSchool.principalName}
                onChange={handleInputChange}
                placeholder="Principal's full name"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={newSchool.email}
                onChange={handleInputChange}
                required
                placeholder="Enter school email"
              />
            </div>

            <div className="form-group">
              <label>Website</label>
              <input
                type="url"
                name="website"
                value={newSchool.website || ''}
                onChange={handleInputChange}
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone *</label>
              <input
                type="tel"
                name="phone"
                value={newSchool.phone}
                onChange={handleInputChange}
                required
                placeholder="Enter contact number"
              />
            </div>

            <div className="form-group">
              <label>Contact Phone *</label>
              <input
                type="tel"
                name="contactPhone"
                value={newSchool.contactPhone}
                onChange={handleInputChange}
                required
                placeholder="Alternative contact number"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Address *</label>
            <textarea
              name="address"
              value={newSchool.address}
              onChange={handleInputChange}
              required
              placeholder="Enter full address"
              rows={2}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>City *</label>
              <input
                type="text"
                name="city"
                value={newSchool.city}
                onChange={handleInputChange}
                required
                placeholder="City"
              />
            </div>
            
            <div className="form-group">
              <label>State *</label>
              <input
                type="text"
                name="state"
                value={newSchool.state}
                onChange={handleInputChange}
                required
                placeholder="State"
              />
            </div>
            
            <div className="form-group">
              <label>Pincode *</label>
              <input
                type="text"
                name="pincode"
                value={newSchool.pincode}
                onChange={handleInputChange}
                required
                placeholder="Postal code"
              />
            </div>
          </div>

          <h3>School Facilities</h3>
          <div className="form-row">
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="hasTransportation"
                  checked={newSchool.hasTransportation || false}
                  onChange={handleInputChange}
                />
                Transportation Available
              </label>
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="hasCafeteria"
                  checked={newSchool.hasCafeteria || false}
                  onChange={handleInputChange}
                />
                Cafeteria Available
              </label>
            </div>
          </div>

          <h3>Analytics</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Total Students</label>
              <input
                type="number"
                name="analytics.totalStudents"
                value={newSchool.analytics?.totalStudents || 0}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  setNewSchool(prev => ({
                    ...prev,
                    analytics: {
                      ...prev.analytics,
                      totalStudents: value,
                      lastUpdated: new Date().toISOString()
                    }
                  }));
                }}
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Total Teachers</label>
              <input
                type="number"
                name="analytics.totalTeachers"
                value={newSchool.analytics?.totalTeachers || 0}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  setNewSchool(prev => ({
                    ...prev,
                    analytics: {
                      ...prev.analytics,
                      totalTeachers: value,
                      lastUpdated: new Date().toISOString()
                    }
                  }));
                }}
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Average Attendance (%)</label>
              <input
                type="number"
                name="analytics.avgAttendance"
                value={newSchool.analytics?.avgAttendance || 0}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  setNewSchool(prev => ({
                    ...prev,
                    analytics: {
                      ...prev.analytics,
                      avgAttendance: Math.min(100, Math.max(0, value)),
                      lastUpdated: new Date().toISOString()
                    }
                  }));
                }}
                min="0"
                max="100"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Phone *</label>
            <input
              type="tel"
              name="phone"
              value={newSchool.phone}
              onChange={handleInputChange}
              required
              placeholder="Enter contact number"
            />
          </div>
          
          <div className="form-group">
            <label>Address *</label>
            <textarea
              name="address"
              value={newSchool.address}
              onChange={handleInputChange}
              required
              placeholder="Enter full address"
              rows={3}
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>City *</label>
              <input
                type="text"
                name="city"
                value={newSchool.city}
                onChange={handleInputChange}
                required
                placeholder="City"
              />
            </div>
            
            <div className="form-group">
              <label>State *</label>
              <input
                type="text"
                name="state"
                value={newSchool.state}
                onChange={handleInputChange}
                required
                placeholder="State"
              />
            </div>
            
            <div className="form-group">
              <label>Pincode *</label>
              <input
                type="text"
                name="pincode"
                value={newSchool.pincode}
                onChange={handleInputChange}
                required
                placeholder="Postal code"
              />
            </div>
          </div>

          <h3>Admin User Details</h3>
          
          <div className="form-group">
            <label>Admin Username *</label>
            <input
              type="text"
              name="adminUsername"
              value={newSchool.adminUser.username}
              onChange={handleInputChange}
              required
              placeholder="Enter admin username"
            />
          </div>

          <div className="form-group">
            <label>Admin Full Name *</label>
            <input
              type="text"
              name="adminFullName"
              value={newSchool.adminUser.fullName}
              onChange={(e) => {
                setNewSchool(prev => ({
                  ...prev,
                  adminUser: {
                    ...prev.adminUser,
                    fullName: e.target.value
                  }
                }));
              }}
              required
              placeholder="Enter admin full name"
              style={{
                width: '100%',
                padding: '0.625rem 0.875rem',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '0.9375rem',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              
              }}
            />
          </div>

          <div className="form-group">
            <label>Admin Email *</label>
            <input
              type="email"
              name="adminEmail"
              value={newSchool.adminUser.email}
              onChange={handleInputChange}
              required
              placeholder="Enter admin email"
            />
          </div>

          <div className="form-group">
            <label>Admin Password *</label>
            <input
              type="password"
              name="adminPassword"
              value={newSchool.adminUser.password}
              onChange={handleInputChange}
              required
              placeholder="Enter admin password"
            />
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="btn-primary"
              style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2), 0 2px 4px -1px rgba(79, 70, 229, 0.06)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                minWidth: '140px',
            
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              {editingId !== null ? 'Update School' : 'Add School'}
            </button>
            
            {editingId !== null && (
              <button 
                type="button" 
                className="btn-secondary"
                onClick={resetForm}
                style={{
                  background: 'white',
                  color: '#4f46e5',
                  border: '1px solid #e0e7ff',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
      
      <style>{`
        .form-page {
          display: flex;
          justify-content: center;
          align-items: flex-start;
          min-height: 100vh;
          padding: 0.5rem 2rem 2rem;
          background-color: #f5f7fa;
        }
        
        .form-container {
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          padding: 2rem;
          width: 100%;
          max-width: 700px;
        }
        
        h1 {
          color: #2d3748;
          margin-bottom: 1.5rem;
          font-size: 1.5rem;
          font-weight: 600;
          text-align: center;
        }
        
        .form-group {
          margin-bottom: 1.25rem;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #4a5568;
          font-size: 0.9375rem;
        }
        
        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 0.625rem 0.875rem;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 0.9375rem;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        
        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
          outline: none;
          border-color: #3182ce;
          box-shadow: 0 0 0 1px #3182ce;
        }
        
        .form-group input::placeholder,
        .form-group textarea::placeholder {
          color: #a0aec0;
        }
        
        .form-group textarea {
          min-height: 80px;
          resize: vertical;
        }
        
        .form-group select[multiple] {
          min-height: 120px;
          padding: 8px;
        }
        
        .checkbox-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .checkbox-group input[type="checkbox"] {
          width: auto;
          margin: 0;
        }
        
        .form-actions {
          display: flex;
          gap: 10px;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
        }
        
        h1, h2, h3 {
          color: #333;
          margin: 25px 0 15px;
        }
        
        h1 {
          font-size: 24px;
          color: #2c3e50;
          padding-bottom: 10px;
          border-bottom: 1px solid #eee;
        }
        
        h3 {
          font-size: 18px;
          color: #2c3e50;
          padding-top: 10px;
          border-top: 1px solid #eee;
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .form-row {
            flex-direction: column;
            gap: 15px;
          }
          
          .form-actions {
            flex-direction: column;
          }
          
          .btn-primary, .btn-secondary, .btn-danger {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default AddSchoolForm;
