
import React, { useState } from 'react';
import { MessageCircle, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AvoBot from './AvoBot';
import AvoAssistant from './AvoAssistant';

interface AIFloatingActionsProps {
  userRole: 'admin' | 'learner';
}

const AIFloatingActions: React.FC<AIFloatingActionsProps> = ({ userRole }) => {
  const [avoBotOpen, setAvoBotOpen] = useState(false);
  const [avoAssistantOpen, setAvoAssistantOpen] = useState(false);

  return (
    <>
      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-40">
        <Button
          onClick={() => setAvoAssistantOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-primary to-accent shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
          title="AVO Assistant - AI Helper"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
        
        <Button
          onClick={() => setAvoBotOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-accent to-primary shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
          title="AVO Bot - Security Expert"
        >
          <Bot className="h-6 w-6" />
        </Button>
      </div>

      {/* AVO Bot Modal */}
      <AvoBot
        isOpen={avoBotOpen}
        onClose={() => setAvoBotOpen(false)}
      />

      {/* AVO Assistant Modal */}
      <AvoAssistant
        isOpen={avoAssistantOpen}
        onClose={() => setAvoAssistantOpen(false)}
      />
    </>
  );
};

export default AIFloatingActions;
