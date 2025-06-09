
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Key, Settings, Plus, Edit, Trash2 } from 'lucide-react';

const IAMManagement = () => {
  const roles = [
    {
      id: 1,
      name: "Super Admin",
      description: "Full system access and management capabilities",
      permissions: ["user_management", "course_management", "system_settings", "analytics", "iam_management"],
      userCount: 2,
      color: "destructive"
    },
    {
      id: 2,
      name: "Learning Administrator",
      description: "Manage courses, users, and learning campaigns",
      permissions: ["course_management", "user_management", "campaign_management", "analytics"],
      userCount: 5,
      color: "primary"
    },
    {
      id: 3,
      name: "Content Creator",
      description: "Create and edit course content",
      permissions: ["course_management", "content_library"],
      userCount: 8,
      color: "info"
    },
    {
      id: 4,
      name: "Support Agent",
      description: "Handle learner queries and support tickets",
      permissions: ["support_management", "user_view"],
      userCount: 12,
      color: "accent"
    }
  ];

  const policies = [
    {
      id: 1,
      name: "Course Management Policy",
      description: "Allows creation, editing, and deletion of courses",
      resources: ["courses", "course_content", "assessments"],
      actions: ["create", "read", "update", "delete"],
      assignedRoles: 3
    },
    {
      id: 2,
      name: "User Administration Policy",
      description: "Manage user accounts and group assignments",
      resources: ["users", "groups", "enrollments"],
      actions: ["create", "read", "update", "delete"],
      assignedRoles: 2
    },
    {
      id: 3,
      name: "Analytics Access Policy",
      description: "View learning analytics and generate reports",
      resources: ["analytics", "reports"],
      actions: ["read", "export"],
      assignedRoles: 4
    }
  ];

  const adminUsers = [
    {
      id: 1,
      name: "Alice Johnson",
      email: "alice.johnson@company.com",
      role: "Super Admin",
      lastLogin: "2024-01-12",
      status: "active"
    },
    {
      id: 2,
      name: "Bob Wilson",
      email: "bob.wilson@company.com",
      role: "Learning Administrator",
      lastLogin: "2024-01-11",
      status: "active"
    },
    {
      id: 3,
      name: "Carol Davis",
      email: "carol.davis@company.com",
      role: "Content Creator",
      lastLogin: "2024-01-10",
      status: "inactive"
    }
  ];

  const getRoleBadge = (color: string) => {
    const variants: any = {
      destructive: "destructive",
      primary: "default",
      info: "default",
      accent: "default"
    };
    return variants[color] || "secondary";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-success text-success-foreground">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Identity & Access Management</h2>
          <p className="text-muted-foreground">Manage roles, permissions, and access policies</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Create Policy
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Role
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="stats-card">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-primary">27</div>
            <div className="text-sm text-muted-foreground">Admin Users</div>
          </CardContent>
        </Card>
        <Card className="stats-card">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-info">8</div>
            <div className="text-sm text-muted-foreground">Roles Defined</div>
          </CardContent>
        </Card>
        <Card className="stats-card">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-accent">15</div>
            <div className="text-sm text-muted-foreground">Active Policies</div>
          </CardContent>
        </Card>
        <Card className="stats-card">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-success">94%</div>
            <div className="text-sm text-muted-foreground">Compliance Score</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Roles Management */}
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
              {roles.map((role) => (
                <div key={role.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold">{role.name}</h3>
                        <Badge variant={getRoleBadge(role.color)}>{role.userCount} users</Badge>
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
                      {role.permissions.map((permission, index) => (
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

        {/* Policies Management */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Key className="h-5 w-5 mr-2 text-accent" />
              Access Policies
            </CardTitle>
            <CardDescription>Define access control policies</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {policies.map((policy) => (
                <div key={policy.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold">{policy.name}</h3>
                      <p className="text-sm text-muted-foreground">{policy.description}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-medium mb-1">Resources:</h4>
                      <div className="space-y-1">
                        {policy.resources.map((resource, index) => (
                          <Badge key={index} variant="outline" className="text-xs mr-1">
                            {resource}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Actions:</h4>
                      <div className="space-y-1">
                        {policy.actions.map((action, index) => (
                          <Badge key={index} variant="secondary" className="text-xs mr-1">
                            {action}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Assigned to {policy.assignedRoles} roles
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Admin Users */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-info" />
              Admin Users
            </CardTitle>
            <CardDescription>Manage administrative user accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {adminUsers.map((user) => (
                <div key={user.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium">{user.name}</h4>
                        {getStatusBadge(user.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground">Role: {user.role}</p>
                    </div>
                    <Button size="sm" variant="outline">
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Last login: {new Date(user.lastLogin).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Settings */}
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
            
            <Button variant="outline" className="w-full">
              <Settings className="h-4 w-4 mr-2" />
              Configure Security Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IAMManagement;
