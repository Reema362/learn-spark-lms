
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Bot, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import AvoAssistant from './AvoAssistant';
import AvoBot from './AvoBot';

interface AIFloatingActionsProps {
  userRole: 'admin' | 'learner';
}

const AIFloatingActions: React.FC<AIFloatingActionsProps> = ({ userRole }) => {
  const [showAssistant, setShowAssistant] = useState(false);
  const [showBot, setShowBot] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col space-y-3">
        {/* Theme Toggle */}
        <Button
          onClick={toggleTheme}
          size="sm"
          variant="outline"
          className="w-12 h-12 rounded-full shadow-lg bg-background/95 backdrop-blur-sm border-2"
        >
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </Button>

        {/* Avo Bot */}
        <Button
          onClick={() => setShowBot(true)}
          size="sm"
          className="w-12 h-12 rounded-full shadow-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
        >
          <Bot className="h-5 w-5" />
        </Button>

        {/* Avo Assistant */}
        <Button
          onClick={() => setShowAssistant(true)}
          size="sm"
          className="w-12 h-12 rounded-full shadow-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          <Mic className="h-5 w-5" />
        </Button>
      </div>

      {/* AI Components */}
      <AvoAssistant
        isOpen={showAssistant}
        onClose={() => setShowAssistant(false)}
        userRole={userRole}
      />
      
      <AvoBot
        isOpen={showBot}
        onClose={() => setShowBot(false)}
        userRole={userRole}
      />
    </>
  );
};

export default AIFloatingActions;
