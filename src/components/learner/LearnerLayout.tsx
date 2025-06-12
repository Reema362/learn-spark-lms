
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { BookOpen, Award, HelpCircle, LogOut, Menu, X, Trophy } from 'lucide-react';
import { useState } from 'react';
import AIFloatingActions from '@/components/shared/AIFloatingActions';

const LearnerLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { path: '/learner/courses', icon: BookOpen, label: 'My Courses' },
    { path: '/learner/gamification', icon: Trophy, label: 'Gamification' },
    { path: '/learner/certifications', icon: Award, label: 'Certifications' },
    { path: '/learner/help', icon: HelpCircle, label: 'Help & Support' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        dark:bg-gray-900
      `}>
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
              <img 
                src="/lovable-uploads/c1be4ea5-1c8c-461b-a36c-a2dc54ee21bb.png" 
                alt="AVO Automation Logo" 
                className="h-7 w-7 object-contain"
              />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AvoCop
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                  ${isActive(item.path) 
                    ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg' 
                    : 'text-foreground hover:bg-muted hover:scale-105'
                  }
                `}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center shadow-lg">
              <span className="text-sm font-semibold text-white">
                {user?.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
              <span className="inline-block px-2 py-1 text-xs bg-accent text-accent-foreground rounded-full mt-1">
                Learner
              </span>
            </div>
          </div>
          <Button
            onClick={logout}
            variant="outline"
            size="sm"
            className="w-full justify-start hover:bg-destructive hover:text-destructive-foreground transition-colors"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-card/95 backdrop-blur-sm border-b border-border px-6 py-4 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-semibold text-foreground">
              {menuItems.find(item => isActive(item.path))?.label || 'Learning Portal'}
            </h1>
            <div className="flex items-center space-x-2">
              <div className="hidden sm:block text-sm text-muted-foreground">
                Welcome, {user?.name}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 bg-gradient-to-br from-background via-background to-muted/20">
          {children}
        </main>
      </div>

      {/* AI Floating Actions */}
      <AIFloatingActions userRole="learner" />
    </div>
  );
};

export default LearnerLayout;
