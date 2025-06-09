
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Shield, BookOpen, Users, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [learnerEmail, setLearnerEmail] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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

    const success = await login(learnerEmail, undefined, 'learner');
    if (success) {
      navigate('/learner');
      toast({
        title: "Welcome!",
        description: "Successfully signed in via SSO",
      });
    } else {
      toast({
        title: "Login Failed",
        description: "Unable to authenticate via SSO",
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

    const success = await login(adminEmail, adminPassword, 'admin');
    if (success) {
      navigate('/admin');
      toast({
        title: "Welcome Admin!",
        description: "Successfully logged in to admin portal",
      });
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid email or password",
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
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-4">
              <BookOpen className="h-8 w-8 mx-auto mb-2" />
              <h3 className="font-semibold">Interactive Courses</h3>
              <p className="text-sm opacity-80">Engaging security training content</p>
            </div>
            <div className="p-4">
              <Award className="h-8 w-8 mx-auto mb-2" />
              <h3 className="font-semibold">Certifications</h3>
              <p className="text-sm opacity-80">Industry-recognized credentials</p>
            </div>
            <div className="p-4">
              <Users className="h-8 w-8 mx-auto mb-2" />
              <h3 className="font-semibold">Team Management</h3>
              <p className="text-sm opacity-80">Comprehensive admin tools</p>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="w-full max-w-md mx-auto animate-fade-in">
          <Card className="shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Welcome to AvoCop</CardTitle>
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
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loading}
                    >
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
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loading}
                    >
                      {loading ? "Signing in..." : "Sign in"}
                    </Button>
                  </form>
                  <p className="text-sm text-muted-foreground text-center">
                    Use demo credentials: admin@avocop.com / admin123
                  </p>
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
