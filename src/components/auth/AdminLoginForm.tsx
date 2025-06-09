
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const AdminLoginForm: React.FC = () => {
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 8;
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
    }
  };

  return (
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
      <div className="text-sm text-center p-4 bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg border border-muted">
        <p className="text-muted-foreground mb-1">
          <strong>Test Admin Credentials:</strong>
        </p>
        <p className="text-muted-foreground text-xs mb-1">
          Email: naveen.v1@slksoftware.com | Password: SecurePass123!
        </p>
        <p className="text-muted-foreground text-xs">
          Email: reema.jain@slksoftware.com | Password: SecurePass123!
        </p>
      </div>
    </form>
  );
};

export default AdminLoginForm;
