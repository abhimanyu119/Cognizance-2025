import { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const { token, isLoggedIn } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!isLoggedIn || !token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // In a real app, you would fetch user data from your API
        // const response = await api.get('/users/me', {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        // setUser(response.data);

        // Mock user data for demonstration
        setUser({
          id: 1,
          username: 'Kaushal',
          email: 'kaushal@example.com',
          role: 'Employer', // or 'Freelancer'
          avatar: '',
          unreadMessages: 3,
          unreadNotifications: 5,
          createdAt: new Date().toISOString()
        });
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [token, isLoggedIn]);

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      // In a real app, you would make an API call here
      // const response = await api.put('/users/me', profileData, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      
      // For demo purposes:
      setUser({ ...user, ...profileData });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Profile update failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    updateProfile,
    isEmployer: user?.role === 'Employer',
    isFreelancer: user?.role === 'Freelancer'
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
  
export default UserContext;