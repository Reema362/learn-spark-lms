
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
import { Shield, Users, Key, Settings, Plus, Edit, Trash2, History } from 'lucide-react';
import { useRoles, useUserRoles, useAuditLogs, useUsers } from '@/hooks/useDatabase';

const IAMManagement = () => {
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  const [isAssignRoleOpen, setIsAssignRoleOpen] = useState(false);
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: []
  });

  const { data: roles, isLoading: rolesLoading } = useRoles();
  const { data: userRoles, isLoading: userRolesLoading } = useUserRoles();
  const { data: auditLogs, isLoading: auditLoading } = useAuditLogs();
  const { data: users, isLoading: usersLoading } = useUsers();

  const availablePermissions = [
    'user_management',
    'course_management',
    'campaign_management',
    'escalation_management',
    'template_management',
    'iam_management',
    'analytics',
    'system_settings',
    'audit_logs'
  ];

  const getRoleBadge = (roleName: string) => {
    const colors = {
      'Super Admin': 'destructive',
      'Admin': 'default',
      'Manager': 'default',
      'User': 'secondary'
    };
    return colors[roleName] || 'secondary';
  };

  if (rolesLoading || userRolesLoading || auditLoading || usersLoading) {
    return <div className="flex items-center justify-center h-64">Loading IAM data...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Identity & Access Management</h2>
          <p className="text-muted-foreground">Manage roles, permissions, and access policies</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isAssignRoleOpen} onOpenChange={setIsAssignRoleOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Assign Role
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Role to User</DialogTitle>
                <DialogDescription>Grant access privileges to a user</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Select User</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users?.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.first_name} {user.last_name} - {user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Select Role</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles?.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAssignRoleOpen(false)}>Cancel</Button>
                  <Button>Assign Role</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
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
                <DialogDescription>Define a new access role with specific permissions</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="roleName">Role Name</Label>
                  <Input
                    id="roleName"
                    value={newRole.name}
                    onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                    placeholder="e.g., Content Manager"
                  />
                </div>
                <div>
                  <Label htmlFor="roleDescription">Description</Label>
                  <Textarea
                    id="roleDescription"
                    value={newRole.description}
                    onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                    placeholder="Describe the role's responsibilities..."
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
                        />
                        <Label htmlFor={permission} className="text-sm">
                          {permission.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateRoleOpen(false)}>Cancel</Button>
                  <Button>Create Role</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="stats-card">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-primary">{users?.length || 0}</div>
            <div className="text-sm text-muted-foreground">Total Users</div>
          </CardContent>
        </Card>
        <Card className="stats-card">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-info">{roles?.length || 0}</div>
            <div className="text-sm text-muted-foreground">Roles Defined</div>
          </CardContent>
        </Card>
        <Card className="stats-card">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-accent">{userRoles?.length || 0}</div>
            <div className="text-sm text-muted-foreground">Active Assignments</div>
          </CardContent>
        </Card>
        <Card className="stats-card">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-success">94%</div>
            <div className="text-sm text-muted-foreground">Compliance Score</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="roles" className="space-y-6">
        <TabsList>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="assignments">User Assignments</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="settings">Security Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-6">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2 text-primary" />
                Roles & Permissions
              </CardTitle>
              <CardDescription>Define and manage user roles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {roles?.map((role) => (
                  <div key={role.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold">{role.name}</h3>
                          <Badge variant={getRoleBadge(role.name)}>
                            {userRoles?.filter(ur => ur.role_id === role.id).length || 0} users
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{role.description}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Permissions:</h4>
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(role.permissions) && role.permissions.map((permission, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {permission.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-6">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-info" />
                User Role Assignments
              </CardTitle>
              <CardDescription>Manage user access assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userRoles?.map((assignment) => (
                  <div key={assignment.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium">
                            {assignment.profiles?.first_name} {assignment.profiles?.last_name}
                          </h4>
                          <Badge variant={getRoleBadge(assignment.roles?.name || '')}>
                            {assignment.roles?.name}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{assignment.profiles?.email}</p>
                      </div>
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Assigned: {new Date(assignment.assigned_at).toLocaleDateString()} by{' '}
                      {assignment.assigned_by_profile?.first_name} {assignment.assigned_by_profile?.last_name}
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
                <History className="h-5 w-5 mr-2 text-accent" />
                Audit Logs
              </CardTitle>
              <CardDescription>Track all access and permission changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {auditLogs?.map((log) => (
                  <div key={log.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium">{log.action}</span>
                          <Badge variant="outline" className="text-xs">
                            {log.resource_type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          User: {log.profiles?.first_name} {log.profiles?.last_name} ({log.profiles?.email})
                        </p>
                        {log.details && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Details: {JSON.stringify(log.details)}
                          </div>
                        )}
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        {new Date(log.created_at).toLocaleString()}
                      </div>
                    </div>
                    {log.ip_address && (
                      <div className="text-xs text-muted-foreground">
                        IP: {log.ip_address}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2 text-muted-foreground" />
                Security Settings
              </CardTitle>
              <CardDescription>Configure system security options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="border rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-muted-foreground">Require 2FA for admin users</p>
                  </div>
                  <Badge variant="default" className="bg-success text-success-foreground">Enabled</Badge>
                </div>
              </div>
              
              <div className="border rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Session Timeout</h4>
                    <p className="text-sm text-muted-foreground">Auto-logout after inactivity</p>
                  </div>
                  <span className="text-sm font-medium">30 minutes</span>
                </div>
              </div>
              
              <div className="border rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Audit Logging</h4>
                    <p className="text-sm text-muted-foreground">Track all admin actions</p>
                  </div>
                  <Badge variant="default" className="bg-success text-success-foreground">Active</Badge>
                </div>
              </div>
              
              <div className="border rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Password Policy</h4>
                    <p className="text-sm text-muted-foreground">Minimum 8 characters, special chars required</p>
                  </div>
                  <Badge variant="default" className="bg-success text-success-foreground">Enforced</Badge>
                </div>
              </div>
              
              <Button variant="outline" className="w-full">
                <Settings className="h-4 w-4 mr-2" />
                Configure Security Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IAMManagement;
