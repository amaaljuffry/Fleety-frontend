import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Plus, CheckCircle2, Calendar, AlertCircle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAuthToken } from '@/api/client';
import { capitalizeWords } from '@/lib/utils';

interface User {
  id: string;
  email: string;
  full_name: string;
}

const WelcomeDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    // Check if user just signed up (flag in session storage)
    const isNewUserFlag = sessionStorage.getItem('isNewUser');
    if (isNewUserFlag === 'true') {
      setIsNewUser(true);
      sessionStorage.removeItem('isNewUser'); // Clear flag
    }

    // Get user info from token
    const token = getAuthToken();
    if (token) {
      try {
        // Decode token to get user info (basic JWT decode)
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const decoded = JSON.parse(jsonPayload);
        
        // Try to get full user data from localStorage or use token data
        const storedUser = localStorage.getItem('user_info');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.log('Could not decode user from token');
      }
    }
  }, []);

  const features = [
    {
      icon: Car,
      title: 'Add Your First Vehicle',
      description: 'Start by adding your vehicle details to begin tracking maintenance',
      action: () => navigate('/vehicles/new'),
      actionLabel: 'Add Vehicle',
      color: 'bg-gray-100 text-black',
    },
    {
      icon: Calendar,
      title: 'Set Service Reminders',
      description: 'Get notified about upcoming maintenance based on date or mileage',
      action: () => navigate('/vehicles/new'),
      actionLabel: 'Get Started',
      color: 'bg-gray-100 text-black',
    },
    {
      icon: CheckCircle2,
      title: 'Track Maintenance',
      description: 'Log all your vehicle maintenance and repairs in one place',
      action: () => navigate('/vehicles/new'),
      actionLabel: 'Learn More',
      color: 'bg-gray-100 text-black',
    },
    {
      icon: TrendingUp,
      title: 'Monitor Costs',
      description: 'Keep track of all your maintenance expenses and identify patterns',
      action: () => navigate('/vehicles/new'),
      actionLabel: 'View Dashboard',
      color: 'bg-gray-100 text-black',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-12">
        {/* Welcome Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-br from-black to-gray-800 rounded-full">
              <Car className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
            Welcome{user ? `, ${capitalizeWords(user.full_name)}!` : ' to Fleety'}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your personal vehicle maintenance companion is ready to help you stay on top of your
            car's health and reduce unexpected repairs.
          </p>
        </div>

        {/* Getting Started Card */}
        <Card className="mb-12 border-gray-300 bg-gray-50/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-black" />
              <CardTitle>Let's Get Started</CardTitle>
            </div>
            <CardDescription>Follow these simple steps to set up your vehicle tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-black text-white font-bold">
                    1
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Add Your First Vehicle</h3>
                  <p className="text-sm text-muted-foreground">Click the button below to add your vehicle details</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-black text-white font-bold">
                    2
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Log Past Maintenance</h3>
                  <p className="text-sm text-muted-foreground">Add your vehicle's maintenance history</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-black text-white font-bold">
                    3
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Set Up Reminders</h3>
                  <p className="text-sm text-muted-foreground">Get notified about upcoming service needs</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">What You Can Do</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Card key={idx} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className={`p-3 rounded-lg ${feature.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>
                    <CardTitle className="mt-4">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={feature.action}
                      variant="outline"
                      className="w-full"
                    >
                      {feature.actionLabel}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Key Benefits */}
        <Card className="mb-12 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 text-white">
          <CardHeader>
            <CardTitle className="text-white">Why Use Fleety?</CardTitle>
            <CardDescription className="text-slate-300">
              Keep your vehicles running smoothly with intelligent maintenance tracking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-2xl font-bold text-black mb-2">📊</div>
                <h4 className="font-semibold mb-1">Complete History</h4>
                <p className="text-sm text-slate-300">
                  Track every service, repair, and expense in one centralized location
                </p>
              </div>
              <div>
                <div className="text-2xl font-bold text-black mb-2">🔔</div>
                <h4 className="font-semibold mb-1">Smart Reminders</h4>
                <p className="text-sm text-slate-300">
                  Never miss important maintenance with customizable date and mileage reminders
                </p>
              </div>
              <div>
                <div className="text-2xl font-bold text-black mb-2">💰</div>
                <h4 className="font-semibold mb-1">Save Money</h4>
                <p className="text-sm text-slate-300">
                  Proactive maintenance prevents expensive repairs and extends vehicle life
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Button */}
        <div className="text-center">
          <Button
            size="lg"
            onClick={() => navigate('/vehicles/new')}
            className="bg-gradient-to-r from-black to-gray-900 hover:from-gray-900 hover:to-black text-white"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Your First Vehicle Now
          </Button>
        </div>

        {/* Skip for now */}
        <div className="text-center mt-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="text-muted-foreground"
          >
            View Dashboard →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeDashboard;
