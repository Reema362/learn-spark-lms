
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Edit, Trash2, Users, UserCheck, Mail, Upload, RefreshCw } from 'lucide-react';
import { useUsers, useCreateUser } from '@/hooks/useDatabase';
import CSVUpload from './CSVUpload';

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'user' as 'admin' | 'user',
    department: ''
  });

  const { data: users = [], isLoading: usersLoading, refetch: refetchUsers } = useUsers();
  const createUser = useCreateUser();

  // Filter users based on search and role - show ALL users by default
  const filteredUsers = users.filter((user: any) => {
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
    const email = (user.email || '').toLowerCase();
    const department = (user.department || '').toLowerCase();
    
    const matchesSearch = searchTerm === '' || 
                         fullName.includes(searchTerm.toLowerCase()) ||
                         email.includes(searchTerm.toLowerCase()) ||
                         department.includes(searchTerm.toLowerCase());
    
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    
    return matchesSearch && matchesRole;
  });

  const handleCreateUser = async () => {
    try {
      console.log('Creating user from UI:', newUser);
      await createUser.mutateAsync(newUser);
      setIsCreateDialogOpen(false);
      setNewUser({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        role: 'user',
        department: ''
      });
      // Automatically refresh the user list after creating a new user
      await refetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleRefresh = async () => {
    console.log('Manually refreshing user list...');
    await refetchUsers();
  };

  const getStatusBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="destructive">Admin</Badge>;
      case 'user':
        return <Badge variant="secondary">User</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  // Calculate statistics from all users (not filtered)
  const userStats = {
    total: users.length,
    admins: users.filter((u: any) => u.role === 'admin').length,
    users: users.filter((u: any) => u.role === 'user').length
  };

  if (usersLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">User Management</h2>
          <p className="text-muted-foreground">Manage users and organize them into groups</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Add a new user to the platform
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    value={newUser.first_name}
                    onChange={(e) => setNewUser(prev => ({ ...prev, first_name: e.target.value }))}
                    placeholder="John"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={newUser.last_name}
                    onChange={(e) => setNewUser(prev => ({ ...prev, last_name: e.target.value }))}
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="john.doe@company.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter password"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={newUser.role} onValueChange={(value: any) => setNewUser(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={newUser.department}
                    onChange={(e) => setNewUser(prev => ({ ...prev, department: e.target.value }))}
                    placeholder="IT Security"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateUser} disabled={createUser.isPending}>
                {createUser.isPending ? 'Creating...' : 'Create User'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="stats-card">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-primary">{userStats.total}</div>
            <div className="text-sm text-muted-foreground">Total Users</div>
          </CardContent>
        </Card>
        <Card className="stats-card">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-destructive">{userStats.admins}</div>
            <div className="text-sm text-muted-foreground">Admins</div>
          </CardContent>
        </Card>
        <Card className="stats-card">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-green-600">{userStats.users}</div>
            <div className="text-sm text-muted-foreground">Users</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different user management sections */}
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">User List</TabsTrigger>
          <TabsTrigger value="bulk-upload">Bulk Upload</TabsTrigger>
          <TabsTrigger value="games">Security Games</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="space-y-4">
          {/* Filters and Refresh Button */}
          <div className="flex gap-4 items-center">
            <div className="flex items-center space-x-2 flex-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name, email, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={usersLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${usersLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Users List */}
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>All Users ({filteredUsers.length} of {users.length})</CardTitle>
              <CardDescription>
                Displaying all users from the profiles table
                {searchTerm || selectedRole !== 'all' ? ' (filtered)' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredUsers.map((user: any) => (
                  <div key={user.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold">
                            {user.first_name || 'N/A'} {user.last_name || 'N/A'}
                          </h3>
                          {getStatusBadge(user.role)}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground mb-1">
                          <Mail className="h-4 w-4 mr-2" />
                          {user.email || 'No email'}
                        </div>
                        {user.department && (
                          <p className="text-xs text-muted-foreground">
                            Department: {user.department}
                          </p>
                        )}
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
                        <span className="text-muted-foreground">User ID:</span>
                        <span className="ml-1 font-mono text-xs">
                          {user.id ? user.id.substring(0, 8) + '...' : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Role:</span>
                        <span className="ml-1">{user.role || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Created:</span>
                        <span className="ml-1">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Status:</span>
                        <span className="ml-1 text-green-600">Active</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchTerm || selectedRole !== 'all' 
                  ? 'No users found matching your search criteria.' 
                  : users.length === 0 
                    ? 'No users found. Try uploading users or creating them manually.'
                    : 'No users match the current filters.'}
              </p>
              {(searchTerm || selectedRole !== 'all') && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedRole('all');
                  }}
                  className="mt-2"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="bulk-upload">
          <CSVUpload />
        </TabsContent>

        <TabsContent value="games">
          <Card>
            <CardHeader>
              <CardTitle>Security Games Access</CardTitle>
              <CardDescription>
                Games and gamification features will be available in the dedicated Security Games section
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Security games and badge systems are managed separately to provide focused learning experiences.
              </p>
              <Button variant="outline">
                Go to Security Games
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserManagement;
