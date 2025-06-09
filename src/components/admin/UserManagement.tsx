
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Upload, Search, Edit, Trash2, Users, UserCheck } from 'lucide-react';

const UserManagement = () => {
  const users = [
    {
      id: 1,
      name: "John Smith",
      email: "john.smith@company.com",
      department: "IT Security",
      role: "Employee",
      status: "active",
      enrollments: 4,
      completions: 2,
      lastLogin: "2024-01-12",
      joinDate: "2023-11-15"
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah.johnson@company.com",
      department: "Human Resources",
      role: "Manager",
      status: "active",
      enrollments: 3,
      completions: 3,
      lastLogin: "2024-01-11",
      joinDate: "2023-10-20"
    },
    {
      id: 3,
      name: "Mike Chen",
      email: "mike.chen@company.com",
      department: "Finance",
      role: "Employee",
      status: "inactive",
      enrollments: 2,
      completions: 0,
      lastLogin: "2023-12-15",
      joinDate: "2023-12-01"
    }
  ];

  const groups = [
    { name: "IT Security Team", members: 45, courses: 6 },
    { name: "Management", members: 12, courses: 4 },
    { name: "HR Department", members: 8, courses: 3 },
    { name: "Finance Team", members: 23, courses: 5 }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-success text-success-foreground">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">User Management</h2>
          <p className="text-muted-foreground">Manage users and organize them into groups</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Bulk Upload
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="stats-card">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-primary">1,284</div>
            <div className="text-sm text-muted-foreground">Total Users</div>
          </CardContent>
        </Card>
        <Card className="stats-card">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-success">1,156</div>
            <div className="text-sm text-muted-foreground">Active Users</div>
          </CardContent>
        </Card>
        <Card className="stats-card">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-info">16</div>
            <div className="text-sm text-muted-foreground">Groups</div>
          </CardContent>
        </Card>
        <Card className="stats-card">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-accent">89%</div>
            <div className="text-sm text-muted-foreground">Engagement Rate</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users List */}
        <div className="lg:col-span-2">
          <Card className="dashboard-card">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>All Users</CardTitle>
                  <CardDescription>Manage individual user accounts</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search users..." className="w-64" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold">{user.name}</h3>
                          {getStatusBadge(user.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground">{user.department} • {user.role}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Enrolled:</span>
                        <span className="ml-1 font-medium">{user.enrollments}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Completed:</span>
                        <span className="ml-1 font-medium text-success">{user.completions}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last Login:</span>
                        <span className="ml-1">{new Date(user.lastLogin).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Joined:</span>
                        <span className="ml-1">{new Date(user.joinDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Groups Management */}
        <div>
          <Card className="dashboard-card">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Groups</CardTitle>
                  <CardDescription>Organize users into departments</CardDescription>
                </div>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Group
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {groups.map((group, index) => (
                  <div key={index} className="border rounded-lg p-3 space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">{group.name}</h4>
                      <Button size="sm" variant="ghost">
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {group.members} members
                      </div>
                      <div className="flex items-center">
                        <UserCheck className="h-4 w-4 mr-1" />
                        {group.courses} courses
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Bulk Actions */}
          <Card className="dashboard-card mt-6">
            <CardHeader>
              <CardTitle>Bulk Actions</CardTitle>
              <CardDescription>Perform actions on multiple users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Upload className="h-4 w-4 mr-2" />
                Upload CSV File
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <UserCheck className="h-4 w-4 mr-2" />
                Assign Courses
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Create Group
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
