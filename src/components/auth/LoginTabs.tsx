
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LearnerLoginForm from './LearnerLoginForm';
import AdminLoginForm from './AdminLoginForm';

const LoginTabs: React.FC = () => {
  return (
    <Tabs defaultValue="learner" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="learner" className="text-sm">Learner Portal</TabsTrigger>
        <TabsTrigger value="admin" className="text-sm">Admin Portal</TabsTrigger>
      </TabsList>
      
      <TabsContent value="learner" className="space-y-4">
        <LearnerLoginForm />
      </TabsContent>
      
      <TabsContent value="admin" className="space-y-4">
        <AdminLoginForm />
      </TabsContent>
    </Tabs>
  );
};

export default LoginTabs;
