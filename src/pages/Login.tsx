
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import LoginLayout from '../components/auth/LoginLayout';
import LoginBranding from '../components/auth/LoginBranding';
import LoginTabs from '../components/auth/LoginTabs';

const Login = () => {
  return (
    <LoginLayout>
      {/* Left side - Branding */}
      <LoginBranding />

      {/* Right side - Login Form */}
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
            <LoginTabs />
          </CardContent>
        </Card>
      </div>
    </LoginLayout>
  );
};

export default Login;
