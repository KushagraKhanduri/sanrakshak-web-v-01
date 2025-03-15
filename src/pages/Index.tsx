
import React, { useEffect } from 'react';
import Header from '../components/Header';
import Dashboard from '../components/Dashboard';
import { useToast } from "@/hooks/use-toast";
import { useTheme } from '../context/ThemeProvider';

const Index = () => {
  const { toast } = useToast();
  const { theme } = useTheme();
  const isLight = theme === 'light';
  
  useEffect(() => {
    // Welcome toast on initial load
    toast({
      title: "System Online",
      description: "Sanrakshak emergency response platform activated",
      duration: 3000,
    });
  }, [toast]);

  return (
    <div className={`w-full min-h-screen bg-background text-foreground flex flex-col`}>
      <Header emergency={true} />
      
      <main className="w-full pt-20 pb-16 min-h-screen flex-grow">
        <Dashboard />
      </main>
      
      <footer className={`w-full py-6 ${isLight ? "border-t border-gray-200 backdrop-blur-sm bg-white/30" : "border-t border-border backdrop-blur-sm bg-background/30"}`}>
        <div className="w-full px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <span className="text-sm text-muted-foreground">
                Sanrakshak • Emergency Response System
              </span>
            </div>
            
            <div className="text-center md:text-right">
              <span className="text-xs text-muted-foreground">
                This system is for emergency use • Always follow official guidance
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
