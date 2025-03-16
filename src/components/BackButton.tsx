
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useTheme } from '../context/ThemeProvider';

interface BackButtonProps {
  className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ className }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { theme } = useTheme();
  const isLight = theme === 'light';
  
  const handleGoBack = () => {
    const returnTo = searchParams.get('returnTo');
    if (returnTo) {
      navigate(`/${returnTo}`);
    } else {
      // Navigate based on user role
      const authUser = localStorage.getItem('authUser');
      if (authUser) {
        const user = JSON.parse(authUser);
        // Navigate to dashboard which will show the appropriate view based on role
        navigate('/dashboard');
      } else {
        // Default to dashboard for unauthenticated users
        navigate('/dashboard');
      }
    }
  };
  
  return (
    <button
      onClick={handleGoBack}
      className={cn(
        'flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors',
        isLight ? 'hover:bg-gray-100' : 'hover:bg-white/10',
        className
      )}
      aria-label="Go back"
    >
      <ArrowLeft size={16} />
      <span className="text-sm font-medium">Back</span>
    </button>
  );
};

export default BackButton;
