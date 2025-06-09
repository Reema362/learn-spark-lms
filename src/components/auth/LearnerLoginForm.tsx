
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const LearnerLoginForm: React.FC = () => {
  const [learnerEmail, setLearnerEmail] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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
    }
  };

  return (
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
      <div className="text-sm text-center p-4 bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg border border-muted">
        <p className="text-muted-foreground mb-1">
          <strong>🔐 SSO Authentication</strong>
        </p>
        <p className="text-muted-foreground text-xs">
          Enter any valid email address to simulate SSO login
        </p>
      </div>
    </form>
  );
};

export default LearnerLoginForm;
