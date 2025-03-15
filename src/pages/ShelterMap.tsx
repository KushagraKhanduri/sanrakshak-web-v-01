
import React from 'react';
import Header from '../components/Header';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeProvider';
import { Button } from '@/components/ui/button';

const ShelterMap = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isLight = theme === 'light';
  
  const handleGoBack = () => {
    navigate('/dashboard');
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Header title="Shelter Map" />
      
      <main className="pt-20 pb-16 min-h-screen">
        <div className="container mx-auto px-4">
          <Button 
            onClick={handleGoBack}
            variant="ghost"
            className={`mb-4 flex items-center gap-1.5 ${
              isLight ? 'hover:bg-gray-100' : 'hover:bg-white/10'
            }`}
            aria-label="Go back to dashboard"
          >
            <ArrowLeft size={16} />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </Button>
          
          <div className="bg-black/20 border border-white/10 rounded-xl overflow-hidden h-[70vh]">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d117756.07676855968!2d79.94600543036132!3d23.16175785!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sin!4v1616661901026!5m2!1sen!2sin" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Emergency Shelters Map"
              className="w-full h-full"
            />
          </div>
          
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Nearby Shelters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="border border-white/10 bg-black/20 rounded-xl p-4">
                <h3 className="font-medium mb-2">Jabalpur High School</h3>
                <p className="text-sm text-gray-400 mb-2">123 Main Street, Jabalpur</p>
                <div className="text-xs text-gray-500">
                  <p>Capacity: 250 people</p>
                  <p>Status: Open (78% full)</p>
                  <p>Amenities: Food, Water, Medical, Power</p>
                </div>
              </div>
              
              <div className="border border-white/10 bg-black/20 rounded-xl p-4">
                <h3 className="font-medium mb-2">Jabalpur Community Center</h3>
                <p className="text-sm text-gray-400 mb-2">456 Oak Avenue, Jabalpur</p>
                <div className="text-xs text-gray-500">
                  <p>Capacity: 180 people</p>
                  <p>Status: Open (45% full)</p>
                  <p>Amenities: Food, Water, Power</p>
                </div>
              </div>
              
              <div className="border border-white/10 bg-black/20 rounded-xl p-4">
                <h3 className="font-medium mb-2">Riverside Church</h3>
                <p className="text-sm text-gray-400 mb-2">789 River Road, Jabalpur</p>
                <div className="text-xs text-gray-500">
                  <p>Capacity: 120 people</p>
                  <p>Status: Open (92% full)</p>
                  <p>Amenities: Food, Water, Power, Pet Friendly</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ShelterMap;
