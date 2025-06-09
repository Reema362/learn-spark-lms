
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Play, Pause, Edit, Target, Users, Calendar, Upload } from 'lucide-react';
import { useCampaigns, useCreateCampaign, useUpdateCampaign } from '@/hooks/useDatabase';

const CampaignManagement = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    description: '',
    status: 'draft',
    start_date: '',
    end_date: '',
    target_audience: [],
    tags: []
  });

  const { data: campaigns, isLoading } = useCampaigns();
  const createCampaignMutation = useCreateCampaign();
  const updateCampaignMutation = useUpdateCampaign();

  const handleCreateCampaign = async () => {
    if (!newCampaign.name) return;

    try {
      await createCampaignMutation.mutateAsync(newCampaign);
      setIsCreateOpen(false);
      setNewCampaign({
        name: '',
        description: '',
        status: 'draft',
        start_date: '',
        end_date: '',
        target_audience: [],
        tags: []
      });
    } catch (error) {
      console.error('Error creating campaign:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-success text-success-foreground">Active</Badge>;
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'paused':
        return <Badge variant="default" className="bg-warning text-warning-foreground">Paused</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-info text-info-foreground">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading campaigns...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Campaign Management</h2>
          <p className="text-muted-foreground">Create and manage learning campaigns</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Campaign</DialogTitle>
              <DialogDescription>Set up a new learning campaign for your organization</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Campaign Name</Label>
                <Input
                  id="name"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                  placeholder="e.g., Q1 Security Training"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newCampaign.description}
                  onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                  placeholder="Describe the campaign objectives..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="datetime-local"
                    value={newCampaign.start_date}
                    onChange={(e) => setNewCampaign({ ...newCampaign, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="datetime-local"
                    value={newCampaign.end_date}
                    onChange={(e) => setNewCampaign({ ...newCampaign, end_date: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={newCampaign.status} onValueChange={(value) => setNewCampaign({ ...newCampaign, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateCampaign} disabled={createCampaignMutation.isPending}>
                  {createCampaignMutation.isPending ? 'Creating...' : 'Create Campaign'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="stats-card">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-primary">{campaigns?.filter(c => c.status === 'active').length || 0}</div>
            <div className="text-sm text-muted-foreground">Active Campaigns</div>
          </CardContent>
        </Card>
        <Card className="stats-card">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-success">{campaigns?.length || 0}</div>
            <div className="text-sm text-muted-foreground">Total Campaigns</div>
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
            <div className="text-2xl font-bold text-accent">{campaigns?.filter(c => c.status === 'draft').length || 0}</div>
            <div className="text-sm text-muted-foreground">Scheduled</div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle>All Campaigns</CardTitle>
          <CardDescription>Manage your learning campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaigns?.map((campaign) => (
              <div key={campaign.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-lg">{campaign.name}</h3>
                      {getStatusBadge(campaign.status || 'draft')}
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
                    {campaign.status === 'draft' && (
                      <Button size="sm" variant="outline">
                        <Play className="h-4 w-4 mr-2" />
                        Start
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Assets
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </div>

                {/* Campaign Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  {campaign.start_date && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Start: {new Date(campaign.start_date).toLocaleDateString()}</span>
                    </div>
                  )}
                  {campaign.end_date && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>End: {new Date(campaign.end_date).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>0 enrolled</span>
                  </div>
                  <div className="flex items-center">
                    <Target className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>0 completed</span>
                  </div>
                </div>

                {/* Target Audience & Tags */}
                {(campaign.target_audience?.length || campaign.tags?.length) && (
                  <div className="space-y-2">
                    {campaign.target_audience?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">Target Audience:</h4>
                        <div className="flex flex-wrap gap-1">
                          {campaign.target_audience.map((audience, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">{audience}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {campaign.tags?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">Tags:</h4>
                        <div className="flex flex-wrap gap-1">
                          {campaign.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Assets */}
                {campaign.campaign_assets?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Campaign Assets:</h4>
                    <div className="flex flex-wrap gap-2">
                      {campaign.campaign_assets.map((asset) => (
                        <Badge key={asset.id} variant="outline" className="text-xs">
                          {asset.file_name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CampaignManagement;
