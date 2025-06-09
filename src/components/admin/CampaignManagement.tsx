
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Play, Pause, Edit, Target, Users, Calendar } from 'lucide-react';

const CampaignManagement = () => {
  const campaigns = [
    {
      id: 1,
      name: "Q1 Security Awareness",
      description: "Quarterly security training for all employees",
      status: "active",
      startDate: "2024-01-01",
      endDate: "2024-03-31",
      enrollments: 1156,
      completions: 847,
      courses: ["Cybersecurity Fundamentals", "Phishing Awareness"],
      targetGroups: ["All Employees"],
      progress: 73,
      priority: "high"
    },
    {
      id: 2,
      name: "Management Security Training",
      description: "Advanced security training for management team",
      status: "active",
      startDate: "2024-01-15",
      endDate: "2024-02-15",
      enrollments: 45,
      completions: 32,
      courses: ["Incident Response", "Risk Management"],
      targetGroups: ["Management"],
      progress: 71,
      priority: "medium"
    },
    {
      id: 3,
      name: "New Hire Onboarding",
      description: "Security training for new employees",
      status: "scheduled",
      startDate: "2024-02-01",
      endDate: "2024-12-31",
      enrollments: 0,
      completions: 0,
      courses: ["Security Basics", "Company Policies"],
      targetGroups: ["New Hires"],
      progress: 0,
      priority: "medium"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-success text-success-foreground">Active</Badge>;
      case 'scheduled':
        return <Badge variant="default" className="bg-info text-info-foreground">Scheduled</Badge>;
      case 'completed':
        return <Badge variant="outline">Completed</Badge>;
      case 'paused':
        return <Badge variant="default" className="bg-warning text-warning-foreground">Paused</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High Priority</Badge>;
      case 'medium':
        return <Badge variant="default" className="bg-warning text-warning-foreground">Medium Priority</Badge>;
      case 'low':
        return <Badge variant="outline">Low Priority</Badge>;
      default:
        return <Badge variant="secondary">Normal</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Campaign Management</h2>
          <p className="text-muted-foreground">Create and manage learning campaigns</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="stats-card">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-primary">8</div>
            <div className="text-sm text-muted-foreground">Active Campaigns</div>
          </CardContent>
        </Card>
        <Card className="stats-card">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-success">1,284</div>
            <div className="text-sm text-muted-foreground">Total Enrollments</div>
          </CardContent>
        </Card>
        <Card className="stats-card">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-info">73%</div>
            <div className="text-sm text-muted-foreground">Average Completion</div>
          </CardContent>
        </Card>
        <Card className="stats-card">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-accent">3</div>
            <div className="text-sm text-muted-foreground">Scheduled</div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Performance Overview */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle>Campaign Performance Overview</CardTitle>
          <CardDescription>Track progress across all active campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {campaigns.filter(c => c.status === 'active').map((campaign) => (
              <div key={campaign.id} className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{campaign.name}</span>
                  <span className="text-sm text-muted-foreground">{campaign.progress}%</span>
                </div>
                <Progress value={campaign.progress} className="h-3" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{campaign.completions} of {campaign.enrollments} completed</span>
                  <span>Due: {new Date(campaign.endDate).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Campaigns List */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle>All Campaigns</CardTitle>
          <CardDescription>Manage your learning campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-lg">{campaign.name}</h3>
                      {getStatusBadge(campaign.status)}
                      {getPriorityBadge(campaign.priority)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{campaign.description}</p>
                  </div>
                  <div className="flex space-x-2">
                    {campaign.status === 'active' && (
                      <Button size="sm" variant="outline">
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                      </Button>
                    )}
                    {campaign.status === 'scheduled' && (
                      <Button size="sm" variant="outline">
                        <Play className="h-4 w-4 mr-2" />
                        Start
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </div>

                {/* Progress Bar for Active Campaigns */}
                {campaign.status === 'active' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Campaign Progress</span>
                      <span>{campaign.progress}%</span>
                    </div>
                    <Progress value={campaign.progress} className="h-2" />
                  </div>
                )}

                {/* Campaign Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Start: {new Date(campaign.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>End: {new Date(campaign.endDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{campaign.enrollments} enrolled</span>
                  </div>
                  <div className="flex items-center">
                    <Target className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{campaign.completions} completed</span>
                  </div>
                </div>

                {/* Assigned Courses */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Assigned Courses:</h4>
                  <div className="flex flex-wrap gap-2">
                    {campaign.courses.map((course, index) => (
                      <Badge key={index} variant="outline">{course}</Badge>
                    ))}
                  </div>
                </div>

                {/* Target Groups */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Target Groups:</h4>
                  <div className="flex flex-wrap gap-2">
                    {campaign.targetGroups.map((group, index) => (
                      <Badge key={index} variant="secondary">{group}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CampaignManagement;
