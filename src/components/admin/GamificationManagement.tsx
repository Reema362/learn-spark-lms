
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
import { Plus, Play, Trophy, Users, Clock, Target, Edit, Eye, Gamepad2 } from 'lucide-react';
import { useGames, useGameBadges, useCreateGame, useLeaderboard, useUserGameStats } from '@/hooks/useDatabase';

const GamificationManagement = () => {
  const [isCreateGameOpen, setIsCreateGameOpen] = useState(false);
  const [newGame, setNewGame] = useState({
    title: '',
    description: '',
    game_type: 'mcq',
    difficulty: 'easy',
    topic: 'phishing',
    time_limit_seconds: 300,
    questions: [],
    passing_score: 70
  });

  const { data: games, isLoading: gamesLoading } = useGames();
  const { data: badges, isLoading: badgesLoading } = useGameBadges();
  const { data: leaderboard } = useLeaderboard();
  const { data: userStats } = useUserGameStats();
  const createGameMutation = useCreateGame();

  const handleCreateGame = async () => {
    if (!newGame.title || !newGame.topic) return;

    try {
      await createGameMutation.mutateAsync(newGame);
      setIsCreateGameOpen(false);
      setNewGame({
        title: '',
        description: '',
        game_type: 'mcq',
        difficulty: 'easy',
        topic: 'phishing',
        time_limit_seconds: 300,
        questions: [],
        passing_score: 70
      });
    } catch (error) {
      console.error('Error creating game:', error);
    }
  };

  const gameTopics = [
    { value: 'phishing', label: 'Phishing Awareness' },
    { value: 'password_safety', label: 'Password Safety' },
    { value: 'social_engineering', label: 'Social Engineering' },
    { value: 'two_factor_auth', label: 'Two-Factor Authentication' },
    { value: 'data_handling', label: 'Data Handling' }
  ];

  const gameTypes = [
    { value: 'mcq', label: 'Multiple Choice Quiz' },
    { value: 'drag_drop', label: 'Drag & Drop' },
    { value: 'scenario', label: 'Scenario-Based Challenge' }
  ];

  const getBadgeColor = (tier: string) => {
    switch (tier) {
      case 'gold': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'silver': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'bronze': return 'bg-orange-100 text-orange-800 border-orange-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'hard': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (gamesLoading || badgesLoading) {
    return <div className="flex items-center justify-center h-64">Loading gamification data...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Gamification Management</h2>
          <p className="text-muted-foreground">Manage security awareness games and badges</p>
        </div>
        <Dialog open={isCreateGameOpen} onOpenChange={setIsCreateGameOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Game
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Security Game</DialogTitle>
              <DialogDescription>Design a new information security awareness game</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Game Title</Label>
                  <Input
                    id="title"
                    value={newGame.title}
                    onChange={(e) => setNewGame({ ...newGame, title: e.target.value })}
                    placeholder="e.g., Phishing Detective Challenge"
                  />
                </div>
                <div>
                  <Label htmlFor="topic">Security Topic</Label>
                  <Select 
                    value={newGame.topic} 
                    onValueChange={(value) => setNewGame({ ...newGame, topic: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {gameTopics.map((topic) => (
                        <SelectItem key={topic.value} value={topic.value}>
                          {topic.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="game_type">Game Type</Label>
                  <Select 
                    value={newGame.game_type} 
                    onValueChange={(value) => setNewGame({ ...newGame, game_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {gameTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select 
                    value={newGame.difficulty} 
                    onValueChange={(value) => setNewGame({ ...newGame, difficulty: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="time_limit">Time Limit (seconds)</Label>
                  <Input
                    id="time_limit"
                    type="number"
                    value={newGame.time_limit_seconds}
                    onChange={(e) => setNewGame({ ...newGame, time_limit_seconds: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newGame.description}
                  onChange={(e) => setNewGame({ ...newGame, description: e.target.value })}
                  placeholder="Describe the game objectives and rules..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateGameOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateGame} disabled={createGameMutation.isPending}>
                  {createGameMutation.isPending ? 'Creating...' : 'Create Game'}
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
            <div className="text-2xl font-bold text-primary">{games?.length || 0}</div>
            <div className="text-sm text-muted-foreground">Total Games</div>
          </CardContent>
        </Card>
        <Card className="stats-card">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-success">{badges?.length || 0}</div>
            <div className="text-sm text-muted-foreground">Available Badges</div>
          </CardContent>
        </Card>
        <Card className="stats-card">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-info">{userStats?.length || 0}</div>
            <div className="text-sm text-muted-foreground">Game Sessions</div>
          </CardContent>
        </Card>
        <Card className="stats-card">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-accent">{leaderboard?.length || 0}</div>
            <div className="text-sm text-muted-foreground">Active Players</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="games" className="space-y-6">
        <TabsList>
          <TabsTrigger value="games">Games Library</TabsTrigger>
          <TabsTrigger value="badges">Badge System</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="stats">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="games" className="space-y-6">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Gamepad2 className="h-5 w-5 mr-2" />
                Security Awareness Games
              </CardTitle>
              <CardDescription>Interactive games to test and improve security knowledge</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {games?.map((game: any) => (
                  <Card key={game.id} className="game-card hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-lg">{game.title}</h3>
                          <Badge variant={game.is_active ? "default" : "secondary"}>
                            {game.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Topic:</span>
                            <Badge variant="outline">{game.topic?.replace('_', ' ')}</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Type:</span>
                            <span className="text-sm">{game.game_type?.toUpperCase()}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Difficulty:</span>
                            <Badge className={getDifficultyColor(game.difficulty)}>
                              {game.difficulty}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Time Limit:</span>
                            <span className="text-sm flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {Math.floor(game.time_limit_seconds / 60)}m
                            </span>
                          </div>
                        </div>

                        {game.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {game.description}
                          </p>
                        )}

                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Play className="h-3 w-3 mr-1" />
                            Play
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3" />
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

        <TabsContent value="badges" className="space-y-6">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="h-5 w-5 mr-2" />
                Achievement Badges
              </CardTitle>
              <CardDescription>Recognition system for top performers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {badges?.map((badge: any) => (
                  <Card key={badge.id} className="badge-card">
                    <CardContent className="p-6 text-center">
                      <div className="space-y-4">
                        <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                          <Trophy className="h-8 w-8 text-white" />
                        </div>
                        
                        <div>
                          <h3 className="font-semibold">{badge.name}</h3>
                          <p className="text-sm text-muted-foreground">{badge.description}</p>
                        </div>

                        <div className="space-y-2">
                          <Badge className={getBadgeColor(badge.tier)}>
                            {badge.tier?.toUpperCase()} TIER
                          </Badge>
                          <div className="text-xs text-muted-foreground">
                            Topic: {badge.topic?.replace('_', ' ')}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Top Performers
              </CardTitle>
              <CardDescription>Leading players in security awareness games</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaderboard?.map((entry: any, index: number) => (
                  <div key={entry.user_id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center space-x-4">
                      <div className="font-bold text-lg text-muted-foreground">
                        #{index + 1}
                      </div>
                      <div>
                        <div className="font-medium">
                          {entry.profiles?.first_name} {entry.profiles?.last_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Best Score: {entry.score}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">{entry.score}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>Game Analytics</CardTitle>
              <CardDescription>Performance metrics and engagement statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">Analytics dashboard coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GamificationManagement;
