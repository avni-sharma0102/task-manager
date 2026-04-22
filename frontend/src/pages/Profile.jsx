import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Toast from '../components/Toast';
import '../styles/Profile.css';

function Profile() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState('');
  const [toast, setToast] = useState(null);
  const [profileData, setProfileData] = useState({
    email: '',
    joinDate: '',
    totalTasks: 0,
    completedTasks: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('userEmail');
    
    if (!token) {
      navigate('/');
      return;
    }

    setUserEmail(email || 'user@example.com');
    
    // Simulate loading user data
    setTimeout(() => {
      setProfileData({
        email: email || 'user@example.com',
        joinDate: new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        totalTasks: 0,
        completedTasks: 0,
      });
      setLoading(false);
    }, 500);
  }, [navigate]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    showToast('Logged out successfully!', 'success');
    setTimeout(() => navigate('/'), 1500);
  };

  const handleChangePassword = () => {
    showToast('Password change feature coming soon!', 'info');
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      showToast('Account deleted', 'warning');
      setTimeout(() => navigate('/'), 1500);
    }
  };

  return (
    <div className="profile-wrapper">
      <div className="profile-container">
        <Header 
          title="Profile" 
          subtitle="Manage your account settings and preferences"
        />

        {loading ? (
          <div className="loading-state">
            <div className="spinner-large"></div>
            <p>Loading profile...</p>
          </div>
        ) : (
          <>
            {/* Profile Card */}
            <div className="profile-card">
              <div className="profile-header">
                <div className="profile-avatar-large">U</div>
                <div className="profile-info">
                  <h2 className="profile-email">{profileData.email}</h2>
                  <p className="profile-join-date">Member since {profileData.joinDate}</p>
                </div>
              </div>

              {/* Profile Stats */}
              <div className="profile-stats">
                <div className="profile-stat">
                  <div className="stat-icon"></div>
                  <div className="stat-content">
                    <div className="stat-value">Dashboard</div>
                    <div className="stat-description">View your tasks and progress</div>
                  </div>
                </div>
                <div className="profile-stat">
                  <div className="stat-icon"></div>
                  <div className="stat-content">
                    <div className="stat-value">Settings</div>
                    <div className="stat-description">Customize your preferences</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Settings Section */}
            <div className="settings-section">
              <h3 className="section-title">Security</h3>
              <div className="settings-list">
                <div className="settings-item">
                  <div className="settings-info">
                    <h4>Change Password</h4>
                    <p>Update your password to keep your account secure</p>
                  </div>
                  <button 
                    className="btn btn-secondary"
                    onClick={handleChangePassword}
                  >
                    Update
                  </button>
                </div>

                <div className="settings-item">
                  <div className="settings-info">
                    <h4>Two-Factor Authentication</h4>
                    <p>Add an extra layer of security to your account</p>
                  </div>
                  <button 
                    className="btn btn-secondary"
                    disabled
                  >
                    Disabled
                  </button>
                </div>
              </div>
            </div>

            {/* Account Section */}
            <div className="settings-section">
              <h3 className="section-title">Account</h3>
              <div className="settings-list">
                <div className="settings-item">
                  <div className="settings-info">
                    <h4>Email Address</h4>
                    <p>{profileData.email}</p>
                  </div>
                  <button 
                    className="btn btn-secondary"
                    disabled
                  >
                    Primary
                  </button>
                </div>

                <div className="settings-item">
                  <div className="settings-info">
                    <h4>Logout</h4>
                    <p>Sign out from your account and all sessions</p>
                  </div>
                  <button 
                    className="btn btn-warning"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>

                <div className="settings-item danger">
                  <div className="settings-info">
                    <h4>Delete Account</h4>
                    <p>Permanently delete your account and all data</p>
                  </div>
                  <button 
                    className="btn btn-danger"
                    onClick={handleDeleteAccount}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Toast Notification */}
        {toast && <Toast message={toast.message} type={toast.type} />}
      </div>
    </div>
  );
}

export default Profile;
