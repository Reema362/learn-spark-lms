
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Shield, Users, Activity, Edit, Eye, UserCheck, Lock } from 'lucide-react';
import { useRoles, useUserRoles, useAuditLogs, useUsers } from '@/hooks/useDatabase';

const IAMManagement = () => {
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: []
  });

  const { data: roles, isLoading: rolesLoading } = useRoles();
  const { data: userRoles, isLoading: userRolesLoading } = useUserRoles();
  const { data: auditLogs, isLoading: auditLoading } = useAuditLogs();
  const { data: users } = useUsers();

  const availablePermissions = [
    'user_management',
    'course_management', 
    'campaign_management',
    'escalation_management',
    'template_management',
    'iam_management',
    'analytics_view',
    'system_admin'
  ];

  const handleCreateRole = async () => {
    if (!newRole.name) return;
    
    console.log('Creating role:', newRole);
    // Implementation would go here
    setIsCreateRoleOpen(false);
    setNewRole({ name: '', description: '', permissions: [] });
  };

  const getPermissionBadge = (permission: string) => {
    const colors = {
      user_management: 'bg-blue-100 text-blue-800',
      course_management: 'bg-green-100 text-green-800',
      campaign_management: 'bg-purple-100 text-purple-800',
      escalation_management: 'bg-red-100 text-red-800',
      template_management: 'bg-yellow-100 text-yellow-800',
      iam_management: 'bg-indigo-100 text-indigo-800',
      analytics_view: 'bg-pink-100 text-pink-800',
      system_admin: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge variant="outline" className={colors[permission as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {permission.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  if (rolesLoading || userRolesLoading || auditLoading) {
    return <div className="flex items-center justify-center h-64">Loading IAM data...</div>;
  }

  const rolesArray = Array.isArray(roles) ? roles : [];
  const userRolesArray = Array.isArray(userRoles) ? userRoles : [];
  const auditLogsArray = Array.isArray(auditLogs) ? auditLogs : [];
  const usersArray = Array.isArray(users) ? users : [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Identity & Access Management</h2>
          <p className="text-muted-foreground">Manage users, roles, and permissions</p>
        </div>
        <Dialog open={isCreateRoleOpen} onOpenChange={setIsCreateRoleOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Role
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
              <DialogDescription>Define a new role with specific permissions</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Role Name</Label>
                <Input
                  id="name"
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  placeholder="e.g., Security Manager"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newRole.description}
                  onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  placeholder="Describe the role responsibilities..."
                  className="min-h-[100px]"
                />
              </div>

              <div>
                <Label>Permissions</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {availablePermissions.map((permission) => (
                    <div key={permission} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={permission}
                        checked={newRole.permissions.includes(permission)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewRole({
                              ...newRole,
                              permissions: [...newRole.permissions, permission]
                            });
                          } else {
                            setNewRole({
                              ...newRole,
                              permissions: newRole.permissions.filter(p => p !== permission)
                            });
                          }
                        }}
                        className="rounded"
                      />
                      <label htmlFor={permission} className="text-sm">
                        {permission.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateRoleOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateRole}>Create Role</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="stats-card">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-primary">{usersArray.length}</div>
            <div className="text-sm text-muted-foreground">Total Users</div>
          </CardContent>
        </Card>
        <Card className="stats-card">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-success">{rolesArray.length}</div>
            <div className="text-sm text-muted-foreground">Defined Roles</div>
          </CardContent>
        </Card>
        <Card className="stats-card">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-info">{userRolesArray.length}</div>
            <div className="text-sm text-muted-foreground">Role Assignments</div>
          </CardContent>
        </Card>
        <Card className="stats-card">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-accent">{auditLogsArray.length}</div>
            <div className="text-sm text-muted-foreground">Audit Entries</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="roles" className="space-y-6">
        <TabsList>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="assignments">User Assignments</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-6">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                System Roles
              </CardTitle>
              <CardDescription>Manage roles and their permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rolesArray.map((role: any) => (
                  <Card key={role.id} className="role-card hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-lg">{role.name}</h3>
                          <Badge variant="outline">
                            {Array.isArray(role.permissions) ? role.permissions.length : 0} permissions
                          </Badge>
                        </div>

                        {role.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {role.description}
                          </p>
                        )}

                        <div>
                          <div className="text-xs text-muted-foreground mb-2">Permissions:</div>
                          <div className="flex flex-wrap gap-1">
                            {(Array.isArray(role.permissions) ? role.permissions : []).slice(0, 3).map((permission: string) => (
                              <span key={permission} className="text-xs px-2 py-1 bg-muted rounded">
                                {permission.replace('_', ' ')}
                              </span>
                            ))}
                            {Array.isArray(role.permissions) && role.permissions.length > 3 && (
                              <span className="text-xs px-2 py-1 bg-muted rounded">
                                +{role.permissions.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-6">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserCheck className="h-5 w-5 mr-2" />
                User Role Assignments
              </CardTitle>
              <CardDescription>Manage user access and role assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userRolesArray.map((assignment: any) => (
                  <div key={assignment.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                        {assignment.profiles?.first_name?.[0]}{assignment.profiles?.last_name?.[0]}
                      </div>
                      <div>
                        <div className="font-medium">
                          {assignment.profiles?.first_name} {assignment.profiles?.last_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {assignment.profiles?.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">
                        {assignment.roles?.name}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(assignment.assigned_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Audit Logs
              </CardTitle>
              <CardDescription>System access and modification history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditLogsArray.map((log: any) => (
                  <div key={log.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
                        <Lock className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium">{log.action}</div>
                        <div className="text-sm text-muted-foreground">
                          {log.resource_type} {log.resource_id && `• ${log.resource_id}`}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          by {log.profiles?.first_name} {log.profiles?.last_name}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">
                        {new Date(log.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(log.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IAMManagement;
