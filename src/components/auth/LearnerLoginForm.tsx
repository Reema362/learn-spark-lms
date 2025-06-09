
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
      <p className="text-sm text-muted-foreground text-center">
        🔐 Secure Single Sign-On authentication for learners
      </p>
    </form>
  );
};

export default LearnerLoginForm;
