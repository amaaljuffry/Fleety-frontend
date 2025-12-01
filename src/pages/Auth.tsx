import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { authAPI } from "@/api/client";
import { Car } from "lucide-react";
import { validateSignup, validateLogin, type SignupFormData, type LoginFormData, type ValidationErrors } from "@/schemas/auth";
import { useSubscription } from "@/contexts/SubscriptionContext";

export default function SignupPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();
  const { setSubscriptionData } = useSubscription();
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(() => {
    return searchParams.get('tab') === 'signin';
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors<SignupFormData>>({});
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    full_name: "",
  });

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'signin') {
      setIsLogin(true);
    } else if (tab === 'signup') {
      setIsLogin(false);
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name as keyof ValidationErrors<SignupFormData>]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let validation;
    if (isLogin) {
      validation = validateLogin({
        email: formData.email,
        password: formData.password,
      });
    } else {
      validation = validateSignup({
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
    }

    if (!validation.success) {
      setErrors(validation.errors as ValidationErrors<SignupFormData>);
      toast({
        title: "Validation Error",
        description: "Please fix the errors below",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      if (isLogin) {
        // Use AuthContext login method
        await login(formData.email, formData.password);
      } else {
        // For signup, still use authAPI directly then manually call login
        const response = await authAPI.signup(
          formData.email,
          formData.password,
          formData.full_name
        );
        
        // After signup, log them in using AuthContext
        await login(formData.email, formData.password);
      }
      
      toast({
        title: "Success",
        description: isLogin ? "Logged in successfully" : "Account created successfully"
      });

      // Redirect to welcome dashboard for new signups, regular dashboard for logins
      if (isLogin) {
        navigate("/dashboard");
      } else {
        sessionStorage.setItem('isNewUser', 'true');
        navigate("/welcome");
      }
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : (isLogin ? "Login failed" : "Signup failed");
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header with Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img src="/FL_Logo.svg" alt="Fleety Logo" className="h-16 w-16" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 font-sans">Fleety</h1>
          <p className="text-gray-600 mt-1 font-sans">Vehicle Maintenance</p>
        </div>

        {/* Auth Card */}
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-sans">
              {isLogin ? "Welcome Back" : "Create Account"}
            </CardTitle>
            <CardDescription className="font-sans">
              {isLogin 
                ? "Sign in to your Fleety account" 
                : "Start managing your vehicle maintenance"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name - Only on Signup */}
              {!isLogin && (
                <div className="space-y-2">
                  <label htmlFor="full_name" className="text-sm font-medium text-gray-700 font-sans">
                    Full Name
                  </label>
                  <Input
                    id="full_name"
                    name="full_name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.full_name}
                    onChange={handleChange}
                    disabled={loading}
                    className={`border-gray-300 ${errors.full_name ? 'border-red-500' : ''}`}
                  />
                  {errors.full_name && <p className="text-sm text-red-500">{errors.full_name[0]}</p>}
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700 font-sans">
                  Email Address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  className={`border-gray-300 ${errors.email ? 'border-red-500' : ''}`}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email[0]}</p>}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700 font-sans">
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  className={`border-gray-300 ${errors.password ? 'border-red-500' : ''}`}
                />
                {errors.password && <p className="text-sm text-red-500">{errors.password[0]}</p>}
              </div>

              {/* Confirm Password - Only on Signup */}
              {!isLogin && (
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 font-sans">
                    Confirm Password
                  </label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={loading}
                    className={`border-gray-300 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  />
                  {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword[0]}</p>}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-black hover:bg-gray-900 text-white font-semibold py-2 font-sans"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⚡</span>
                    {isLogin ? "Signing in..." : "Creating account..."}
                  </>
                ) : (
                  isLogin ? "Sign In" : "Create Account"
                )}
              </Button>
            </form>

            {/* Toggle Form */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 font-sans">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setFormData({
                      email: "",
                      password: "",
                      confirmPassword: "",
                      full_name: "",
                    });
                    setErrors({});
                  }}
                  disabled={loading}
                  className="text-black hover:text-gray-800 font-semibold underline"
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </p>
            </div>

            {/* Info Box */}
            
          </CardContent>
        </Card>

        {/* Features */}

      </div>
    </div>
  );
}
