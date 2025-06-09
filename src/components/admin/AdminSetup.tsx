
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/context/AuthContext';

const AdminSetup = () => {
  const { createAdminUsers } = useAuth();

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Setup Admin Users</CardTitle>
        <CardDescription>
          Create the initial admin users for the platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This will create admin accounts for:
          </p>
          <ul className="text-sm space-y-1">
            <li>• naveen.v1@slksoftware.com</li>
            <li>• reema.jain@slksoftware.com</li>
          </ul>
          <p className="text-xs text-muted-foreground">
            Password: SecurePass123!
          </p>
          <Button onClick={createAdminUsers} className="w-full">
            Create Admin Users
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminSetup;
