import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/api/client";

export default function LoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "Email and password are required",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      await login(formData.email, formData.password);
      
      toast({
        title: "Success",
        description: "Logged in successfully"
      });

      navigate("/dashboard");
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : "Invalid email or password";
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!forgotEmail) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }

    setForgotLoading(true);

    try {
      await apiRequest("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: forgotEmail }),
      });

      toast({
        title: "Success",
        description: "Check your email for password reset instructions"
      });

      setShowForgotPassword(false);
      setForgotEmail("");
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to send reset email";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setForgotLoading(false);
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

        {/* Forgot Password Modal */}
        {showForgotPassword && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-sans">Reset Password</CardTitle>
                <CardDescription className="font-sans">
                  Enter your email address and we'll send you a link to reset your password
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="forgot-email" className="text-sm font-medium text-gray-700 font-sans">
                      Email Address
                    </label>
                    <Input
                      id="forgot-email"
                      type="email"
                      placeholder="john@example.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      disabled={forgotLoading}
                      className="border-gray-300"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 font-sans"
                      onClick={() => {
                        setShowForgotPassword(false);
                        setForgotEmail("");
                      }}
                      disabled={forgotLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-black hover:bg-gray-900 text-white font-semibold font-sans"
                      disabled={forgotLoading}
                    >
                      {forgotLoading ? "Sending..." : "Send Reset Link"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Login Card */}
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-sans">Welcome Back</CardTitle>
            <CardDescription className="font-sans">
              Sign in to your Fleety account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  autoComplete="email"
                  className="border-gray-300"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="password" className="text-sm font-medium text-gray-700 font-sans">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-xs text-gray-600 hover:text-gray-900 font-sans hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  autoComplete="current-password"
                  className="border-gray-300"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-black hover:bg-gray-900 text-white font-semibold py-2 font-sans"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⚡</span>
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 font-sans">
                Don't have an account?{" "}
                <Link
                  to="/auth?tab=signup"
                  className="text-black hover:text-gray-800 font-semibold underline"
                >
                  Sign up
                </Link>
              </p>
            </div>

            
            
          </CardContent>
        </Card>

        {/* Features */}
        
      </div>
    </div>
  );
}
