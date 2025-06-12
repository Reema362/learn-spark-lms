
import React from 'react';

const LoginBranding: React.FC = () => {
  return (
    <div className="text-center lg:text-left text-white animate-fade-in">
      <div className="flex items-center justify-center lg:justify-start mb-6">
        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mr-4 shadow-2xl">
          <img 
            src="/lovable-uploads/69bbb4e9-b332-463e-8fc2-574961155f4a.png" 
            alt="AVO Automation Logo" 
            className="h-10 w-10 object-contain"
          />
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
  );
};

export default LoginBranding;
