import { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import axiosInstance from '../utils/axiosInstance';

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
        
        const response = await axiosInstance.get('api/auth/me');
        console.log("response: ", response.data);
        setUser(response.data);

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