
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Shield, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [learnerEmail, setLearnerEmail] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const { login, loading, isDemoMode } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Input validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 8;
  };

  const handleLearnerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!learnerEmail) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }

    if (!validateEmail(learnerEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    const success = await login(learnerEmail, undefined, 'learner');
    if (success) {
      navigate('/learner');
      toast({
        title: "Welcome!",
        description: "Successfully signed in via SSO"
      });
    } else {
      toast({
        title: "Login Failed",
        description: "Unable to authenticate. Please check your email or try again later.",
        variant: "destructive"
      });
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!adminEmail || !adminPassword) {
      toast({
        title: "Error",
        description: "Please enter both email and password",
        variant: "destructive"
      });
      return;
    }

    if (!validateEmail(adminEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    if (!validatePassword(adminPassword)) {
      toast({
        title: "Invalid Password",
        description: "Password must be at least 8 characters long",
        variant: "destructive"
      });
      return;
    }

    const success = await login(adminEmail, adminPassword, 'admin');
    if (success) {
      navigate('/admin');
      toast({
        title: "Welcome Admin!",
        description: "Successfully logged in to admin portal"
      });
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid credentials or too many failed attempts. Please try again later.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding */}
        <div className="text-center lg:text-left text-white animate-fade-in">
          <div className="flex items-center justify-center lg:justify-start mb-6">
            <Shield className="h-12 w-12 mr-3" />
            <h1 className="text-4xl font-bold">AvoCop</h1>
          </div>
          <h2 className="text-2xl font-semibold mb-4">Learning Management System</h2>
          <p className="text-lg opacity-90 mb-8">
            Empowering organizations with comprehensive information security training and certification management.
          </p>
        </div>

        {/* Right side - Login Form */}
        <div className="w-full max-w-md mx-auto animate-fade-in">
          {isDemoMode && (
            <Alert className="mb-4 border-warning bg-warning/10">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-warning-foreground">
                <strong>Demo Mode:</strong> This application is running in demo mode with mock authentication. 
                Not suitable for production use.
              </AlertDescription>
            </Alert>
          )}
          
          <Card className="shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-normal">Welcome to AvoCop</CardTitle>
              <CardDescription>Sign in to your learning portal</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="learner" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="learner">Learner</TabsTrigger>
                  <TabsTrigger value="admin">Admin</TabsTrigger>
                </TabsList>
                
                <TabsContent value="learner" className="space-y-4">
                  <form onSubmit={handleLearnerLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="learner-email">Email Address</Label>
                      <Input 
                        id="learner-email" 
                        type="email" 
                        placeholder="your.email@company.com" 
                        value={learnerEmail} 
                        onChange={(e) => setLearnerEmail(e.target.value)} 
                        required 
                        maxLength={254}
                        autoComplete="email"
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Signing in..." : "Sign in with SSO"}
                    </Button>
                  </form>
                  <p className="text-sm text-muted-foreground text-center">
                    Single Sign-On authentication for learners
                  </p>
                </TabsContent>
                
                <TabsContent value="admin" className="space-y-4">
                  <form onSubmit={handleAdminLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="admin-email">Email Address</Label>
                      <Input 
                        id="admin-email" 
                        type="email" 
                        placeholder="admin@company.com" 
                        value={adminEmail} 
                        onChange={(e) => setAdminEmail(e.target.value)} 
                        required 
                        maxLength={254}
                        autoComplete="email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin-password">Password</Label>
                      <Input 
                        id="admin-password" 
                        type="password" 
                        placeholder="Enter your password" 
                        value={adminPassword} 
                        onChange={(e) => setAdminPassword(e.target.value)} 
                        required 
                        minLength={8}
                        maxLength={128}
                        autoComplete="current-password"
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Signing in..." : "Sign in"}
                    </Button>
                  </form>
                  {isDemoMode && (
                    <div className="text-sm text-center p-3 bg-muted/20 rounded border border-warning/20">
                      <p className="text-muted-foreground">
                        <strong>Demo credentials:</strong> admin@avocop.com / admin123
                      </p>
                      <p className="text-xs text-warning mt-1">
                        ⚠️ Remove hardcoded credentials before production deployment
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
