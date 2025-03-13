
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import AnimatedTransition from '@/components/AnimatedTransition';
import { Bell, Moon, Volume2, MapPin, Shield, AlertTriangle, Save, User } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useTheme } from '../context/ThemeProvider';

interface SettingsState {
  notifications: boolean;
  darkMode: boolean;
  sound: boolean;
  location: boolean;
  dataProtection: boolean;
  emergencyAlerts: boolean;
  profileVisibility: 'public' | 'private' | 'contacts';
  language: string;
}

const Settings = () => {
  const [user, setUser] = useState<any>(null);
  const [settings, setSettings] = useState<SettingsState>({
    notifications: true,
    darkMode: true,
    sound: true,
    location: true,
    dataProtection: true,
    emergencyAlerts: true,
    profileVisibility: 'public',
    language: 'en'
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  
  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('authUser');
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        
        // Load settings from localStorage if available
        const storedSettings = localStorage.getItem(`settings_${parsedUser.id}`);
        if (storedSettings) {
          setSettings(JSON.parse(storedSettings));
        }
        
        // Simulate loading
        setTimeout(() => {
          setIsLoading(false);
        }, 800);
      } catch (e) {
        console.error("Error parsing user data:", e);
        // Clear invalid data
        localStorage.removeItem('authUser');
        redirectToLogin();
      }
    } else {
      redirectToLogin();
    }
  }, []);
  
  // Separate function to handle redirection to login
  const redirectToLogin = () => {
    toast({
      title: "Authentication Required",
      description: "Please sign in to access settings",
    });
    navigate('/login');
  };
  
  // Update theme when settings darkMode changes
  useEffect(() => {
    if (!isLoading && user) {
      setTheme(settings.darkMode ? 'dark' : 'light');
    }
  }, [settings.darkMode, setTheme, isLoading, user]);
  
  const handleSettingToggle = (setting: keyof SettingsState) => {
    if (typeof settings[setting] === 'boolean') {
      setSettings(prev => ({
        ...prev,
        [setting]: !prev[setting]
      }));
    }
  };
  
  const handleProfileVisibilityChange = (value: 'public' | 'private' | 'contacts') => {
    setSettings(prev => ({
      ...prev,
      profileVisibility: value
    }));
  };
  
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings(prev => ({
      ...prev,
      language: e.target.value
    }));
  };
  
  const saveSettings = () => {
    if (user) {
      localStorage.setItem(`settings_${user.id}`, JSON.stringify(settings));
      
      // Apply theme based on darkMode setting
      setTheme(settings.darkMode ? 'dark' : 'light');
      
      toast({
        title: "Settings Saved",
        description: "Your preferences have been updated",
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-6 bg-white/10 rounded w-48 mb-4"></div>
            <div className="h-4 bg-white/10 rounded w-64 mb-3"></div>
            <div className="h-4 bg-white/10 rounded w-32"></div>
          </div>
        </div>
      </div>
    );
  }
  
  // Return null if no user is found (will redirect in useEffect)
  if (!user) return null;
  
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header title="Settings" />
      
      <AnimatedTransition>
        <main className="pt-20 pb-16 min-h-screen">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2">Settings</h1>
                <p className="text-muted-foreground">Customize your experience and preferences</p>
              </div>
              
              <div className="glass-dark border border-border rounded-xl p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <User size={18} className="mr-2" />
                  Account Settings
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Profile Visibility</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        onClick={() => handleProfileVisibilityChange('public')}
                        className={`p-3 rounded-lg border text-center ${
                          settings.profileVisibility === 'public'
                            ? 'border-white bg-white/10'
                            : 'border-white/10 hover:border-white/30'
                        }`}
                      >
                        <span className="block font-medium">Public</span>
                        <span className="text-xs text-gray-400 mt-1">Visible to everyone</span>
                      </button>
                      <button
                        onClick={() => handleProfileVisibilityChange('contacts')}
                        className={`p-3 rounded-lg border text-center ${
                          settings.profileVisibility === 'contacts'
                            ? 'border-white bg-white/10'
                            : 'border-white/10 hover:border-white/30'
                        }`}
                      >
                        <span className="block font-medium">Contacts</span>
                        <span className="text-xs text-gray-400 mt-1">Visible to contacts</span>
                      </button>
                      <button
                        onClick={() => handleProfileVisibilityChange('private')}
                        className={`p-3 rounded-lg border text-center ${
                          settings.profileVisibility === 'private'
                            ? 'border-white bg-white/10'
                            : 'border-white/10 hover:border-white/30'
                        }`}
                      >
                        <span className="block font-medium">Private</span>
                        <span className="text-xs text-gray-400 mt-1">Only visible to you</span>
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="language" className="block text-sm font-medium mb-2">Language</label>
                    <select
                      id="language"
                      value={settings.language}
                      onChange={handleLanguageChange}
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-3 focus:ring-1 focus:ring-white/30 focus:outline-none"
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                      <option value="ja">日本語</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="glass-dark border border-border rounded-xl p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Notification Preferences</h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Bell size={18} className="mr-3 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Push Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive alerts even when app is closed</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={settings.notifications}
                        onChange={() => handleSettingToggle('notifications')}
                      />
                      <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:bg-background"></div>
                    </label>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <AlertTriangle size={18} className="mr-3 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Emergency Alerts</p>
                        <p className="text-sm text-muted-foreground">Critical safety and emergency information</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={settings.emergencyAlerts}
                        onChange={() => handleSettingToggle('emergencyAlerts')}
                      />
                      <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:bg-background"></div>
                    </label>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Volume2 size={18} className="mr-3 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Sound Alerts</p>
                        <p className="text-sm text-muted-foreground">Play sound for notifications and alerts</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={settings.sound}
                        onChange={() => handleSettingToggle('sound')}
                      />
                      <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:bg-background"></div>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="glass-dark border border-border rounded-xl p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Privacy & Location</h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <MapPin size={18} className="mr-3 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Location Services</p>
                        <p className="text-sm text-muted-foreground">Allow app to access your location</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={settings.location}
                        onChange={() => handleSettingToggle('location')}
                      />
                      <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:bg-background"></div>
                    </label>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Shield size={18} className="mr-3 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Data Protection</p>
                        <p className="text-sm text-muted-foreground">Encrypt personal data and communications</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={settings.dataProtection}
                        onChange={() => handleSettingToggle('dataProtection')}
                      />
                      <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:bg-background"></div>
                    </label>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Moon size={18} className="mr-3 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Dark Mode</p>
                        <p className="text-sm text-muted-foreground">Toggle between light and dark theme</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={settings.darkMode}
                        onChange={() => handleSettingToggle('darkMode')}
                      />
                      <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:bg-background"></div>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mb-8">
                <button
                  onClick={saveSettings}
                  className="flex items-center space-x-2 bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Save size={18} />
                  <span>Save Changes</span>
                </button>
              </div>
              
              <div className="glass-dark border border-destructive/10 bg-destructive/5 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-destructive mb-3">Danger Zone</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  These actions are permanent and cannot be undone
                </p>
                
                <div className="flex flex-wrap gap-3">
                  <button className="px-4 py-2 border border-destructive/30 text-destructive rounded-lg hover:bg-destructive/10 transition-colors">
                    Delete All Data
                  </button>
                  <button className="px-4 py-2 border border-destructive/30 text-destructive rounded-lg hover:bg-destructive/10 transition-colors">
                    Reset Settings
                  </button>
                  <button className="px-4 py-2 border border-destructive/30 text-destructive rounded-lg hover:bg-destructive/10 transition-colors">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </AnimatedTransition>
    </div>
  );
};

export default Settings;
