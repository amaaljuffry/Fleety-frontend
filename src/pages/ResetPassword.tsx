import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { apiRequest } from "@/api/client";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  // Validate token exists
  useEffect(() => {
    if (!token) {
      setValidating(false);
      setIsValidToken(false);
      toast({
        title: "Error",
        description: "Invalid or missing reset token",
        variant: "destructive"
      });
    } else {
      setIsValidToken(true);
      setValidating(false);
    }
  }, [token, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.password || !formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Please enter and confirm your new password",
        variant: "destructive"
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const data = await apiRequest("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({
          token,
          new_password: formData.password,
        }),
      });

      toast({
        title: "Success",
        description: "Your password has been reset successfully"
      });

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to reset password";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600">Validating reset link...</p>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-sans">Invalid Reset Link</CardTitle>
            <CardDescription className="font-sans">
              This password reset link is invalid or has expired
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-sm text-gray-600 mb-4 font-sans">
              Please request a new password reset from the login page.
            </p>
            <Button
              onClick={() => navigate("/login")}
              className="w-full bg-black hover:bg-gray-900 text-white font-semibold font-sans"
            >
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header with Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img src="/FL_Logo.svg" alt="Fleety Logo" className="h-16 w-16" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 font-sans">Fleety</h1>
          <p className="text-gray-600 mt-1 font-sans">Reset Your Password</p>
        </div>

        {/* Reset Password Card */}
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-sans">Create New Password</CardTitle>
            <CardDescription className="font-sans">
              Enter your new password below
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700 font-sans">
                  New Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter new password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  className="border-gray-300"
                />
                <p className="text-xs text-gray-500 font-sans">
                  At least 6 characters
                </p>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 font-sans">
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
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
                    Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>

            {/* Back to Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 font-sans">
                Remember your password?{" "}
                <button
                  onClick={() => navigate("/login")}
                  className="text-black hover:text-gray-800 font-semibold underline"
                >
                  Sign in
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
