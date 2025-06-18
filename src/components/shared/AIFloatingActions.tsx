
import React, { useState } from 'react';
import { Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AvoBot from './AvoBot';

interface AIFloatingActionsProps {
  userRole: 'admin' | 'learner';
}

const AIFloatingActions: React.FC<AIFloatingActionsProps> = ({ userRole }) => {
  const [avoBotOpen, setAvoBotOpen] = useState(false);

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          onClick={() => setAvoBotOpen(true)}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-accent shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
          title="Avo Bot - LMS Assistant"
        >
          <Bot className="h-8 w-8" />
        </Button>
      </div>

      {/* Avo Bot Modal */}
      <AvoBot
        isOpen={avoBotOpen}
        onClose={() => setAvoBotOpen(false)}
      />
    </>
  );
};

export default AIFloatingActions;
