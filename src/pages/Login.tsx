
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Shield, Sun, Moon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/context/ThemeContext";

const Login = () => {
  const [learnerEmail, setLearnerEmail] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const { login, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
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
        description: "Invalid credentials. Please check your email and password.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/90 to-accent flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Theme toggle button */}
      <Button
        onClick={toggleTheme}
        variant="outline"
        size="sm"
        className="fixed top-4 right-4 z-50 bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
      >
        {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </Button>

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left side - Enhanced Branding */}
        <div className="text-center lg:text-left text-white animate-fade-in">
          <div className="flex items-center justify-center lg:justify-start mb-6">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mr-4 shadow-2xl">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                AvoCop
              </h1>
              <p className="text-white/60 text-sm">Powered by AI</p>
            </div>
          </div>
          <h2 className="text-3xl font-semibold mb-4 leading-tight">
            Next-Generation Learning Management System
          </h2>
          <p className="text-lg opacity-90 mb-8 leading-relaxed">
            Empowering organizations with comprehensive information security training, 
            AI-powered assistance, and certification management.
          </p>
        </div>

        {/* Right side - Enhanced Login Form */}
        <div className="w-full max-w-md mx-auto animate-fade-in">
          <Card className="shadow-2xl bg-card/95 backdrop-blur-sm border-0">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-3xl font-normal bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Welcome to AvoCop
              </CardTitle>
              <CardDescription className="text-base">
                Sign in to your intelligent learning portal
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <Tabs defaultValue="learner" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="learner" className="text-sm">Learner Portal</TabsTrigger>
                  <TabsTrigger value="admin" className="text-sm">Admin Portal</TabsTrigger>
                </TabsList>
                
                <TabsContent value="learner" className="space-y-4">
                  <form onSubmit={handleLearnerLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="learner-email" className="text-sm font-medium">Email Address</Label>
                      <Input 
                        id="learner-email" 
                        type="email" 
                        placeholder="your.email@company.com" 
                        value={learnerEmail} 
                        onChange={(e) => setLearnerEmail(e.target.value)} 
                        required 
                        maxLength={254}
                        autoComplete="email"
                        className="h-11"
                      />
                    </div>
                    <Button type="submit" className="w-full h-11 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90" disabled={loading}>
                      {loading ? "Signing in..." : "🚀 Sign in with SSO"}
                    </Button>
                  </form>
                  <p className="text-sm text-muted-foreground text-center">
                    🔐 Secure Single Sign-On authentication for learners
                  </p>
                </TabsContent>
                
                <TabsContent value="admin" className="space-y-4">
                  <form onSubmit={handleAdminLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="admin-email" className="text-sm font-medium">Email Address</Label>
                      <Input 
                        id="admin-email" 
                        type="email" 
                        placeholder="admin@company.com" 
                        value={adminEmail} 
                        onChange={(e) => setAdminEmail(e.target.value)} 
                        required 
                        maxLength={254}
                        autoComplete="email"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin-password" className="text-sm font-medium">Password</Label>
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
                        className="h-11"
                      />
                    </div>
                    <Button type="submit" className="w-full h-11 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90" disabled={loading}>
                      {loading ? "Signing in..." : "🔑 Admin Sign in"}
                    </Button>
                  </form>
                  <div className="text-sm text-center p-4 bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg border border-muted">
                    <p className="text-muted-foreground mb-1">
                      <strong>Demo credentials:</strong>
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Email: admin@avocop.com | Password: admin123
                    </p>
                  </div>
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
