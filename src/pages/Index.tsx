
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        // Redirect based on user role
        switch (user.role) {
          case 'entrepreneur':
            navigate('/entrepreneur');
            break;
          case 'investor':
            navigate('/investor');
            break;
          case 'mentor':
          case 'auditor':
          case 'patent_officer':
            navigate('/collaborator');
            break;
          default:
            navigate('/');
        }
      } else {
        // Redirect to landing page if not authenticated
        window.location.href = '/';
      }
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return null;
};

export default Index;
