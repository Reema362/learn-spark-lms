
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GamePad2, Trophy, Users, Play, Plus, Star, Clock, Target } from 'lucide-react';
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
  const { data: leaderboard, isLoading: leaderboardLoading } = useLeaderboard();
  const { data: userStats, isLoading: statsLoading } = useUserGameStats();
  const createGameMutation = useCreateGame();

  const handleCreateGame = async () => {
    if (!newGame.title || !newGame.questions.length) return;

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

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Easy</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Medium</Badge>;
      case 'hard':
        return <Badge variant="destructive">Hard</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getBadgeTierBadge = (tier: string) => {
    switch (tier) {
      case 'bronze':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Bronze</Badge>;
      case 'silver':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Silver</Badge>;
      case 'gold':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Gold</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  if (gamesLoading || badgesLoading || leaderboardLoading || statsLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
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
              <DialogDescription>Design a new interactive security awareness game</DialogDescription>
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
                  <Select value={newGame.topic} onValueChange={(value) => setNewGame({ ...newGame, topic: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="phishing">Phishing Awareness</SelectItem>
                      <SelectItem value="password_safety">Password Safety</SelectItem>
                      <SelectItem value="social_engineering">Social Engineering</SelectItem>
                      <SelectItem value="two_factor_auth">Two-Factor Authentication</SelectItem>
                      <SelectItem value="data_handling">Data Handling</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newGame.description}
                  onChange={(e) => setNewGame({ ...newGame, description: e.target.value })}
                  placeholder="Describe what this game teaches..."
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="game_type">Game Type</Label>
                  <Select value={newGame.game_type} onValueChange={(value) => setNewGame({ ...newGame, game_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mcq">Multiple Choice Quiz</SelectItem>
                      <SelectItem value="drag_drop">Drag & Drop</SelectItem>
                      <SelectItem value="scenario">Scenario Based</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select value={newGame.difficulty} onValueChange={(value) => setNewGame({ ...newGame, difficulty: value })}>
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
            <div className="text-sm text-muted-foreground">Active Games</div>
          </CardContent>
        </Card>
        <Card className="stats-card">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-success">{userStats?.totalGamesPlayed || 0}</div>
            <div className="text-sm text-muted-foreground">Games Played</div>
          </CardContent>
        </Card>
        <Card className="stats-card">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-info">{badges?.length || 0}</div>
            <div className="text-sm text-muted-foreground">Available Badges</div>
          </CardContent>
        </Card>
        <Card className="stats-card">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-accent">{userStats?.totalBadgesEarned || 0}</div>
            <div className="text-sm text-muted-foreground">Badges Earned</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="games" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="games">Games Library</TabsTrigger>
          <TabsTrigger value="badges">Badge System</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="games" className="space-y-6">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <GamePad2 className="h-5 w-5 mr-2 text-primary" />
                Security Games Library
              </CardTitle>
              <CardDescription>Interactive security awareness games</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {games?.map((game) => (
                  <Card key={game.id} className="game-card hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-lg">{game.title}</h3>
                          {getDifficultyBadge(game.difficulty || 'easy')}
                        </div>
                        <p className="text-sm text-muted-foreground">{game.description}</p>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                            <span>{Math.floor((game.time_limit_seconds || 0) / 60)}m</span>
                          </div>
                          <div className="flex items-center">
                            <Target className="h-4 w-4 mr-1 text-muted-foreground" />
                            <span>{game.passing_score}%</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Badge variant="outline" className="text-xs">
                            {game.topic?.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <Badge variant="secondary" className="text-xs ml-2">
                            {game.game_type?.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <Button className="w-full" size="sm">
                          <Play className="h-4 w-4 mr-2" />
                          Play Game
                        </Button>
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
                <Trophy className="h-5 w-5 mr-2 text-accent" />
                Badge System
              </CardTitle>
              <CardDescription>Achievement badges for security awareness</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {badges?.map((badge) => (
                  <Card key={badge.id} className="badge-card">
                    <CardContent className="p-6 text-center">
                      <div className="space-y-4">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                          <Trophy className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{badge.name}</h3>
                          <p className="text-sm text-muted-foreground">{badge.description}</p>
                        </div>
                        <div className="flex justify-center space-x-2">
                          {getBadgeTierBadge(badge.tier)}
                          <Badge variant="outline" className="text-xs">
                            {badge.topic?.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {badge.criteria && typeof badge.criteria === 'object' && (
                            <div>
                              Min Score: {(badge.criteria as any).min_score}% | 
                              Max Time: {Math.floor((badge.criteria as any).max_time / 60)}m
                            </div>
                          )}
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
                <Users className="h-5 w-5 mr-2 text-info" />
                Leaderboard
              </CardTitle>
              <CardDescription>Top performing users in security games</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaderboard?.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium">
                          {entry.profiles?.first_name} {entry.profiles?.last_name}
                        </h4>
                        <p className="text-sm text-muted-foreground">Security Champion</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{entry.score}</div>
                      <div className="text-sm text-muted-foreground">points</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle>Game Performance</CardTitle>
                <CardDescription>Overview of game engagement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Average Score</span>
                    <span className="font-bold">{Math.round(userStats?.averageScore || 0)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Games Completed</span>
                    <span className="font-bold">{userStats?.totalGamesPlayed || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Badges Earned</span>
                    <span className="font-bold">{userStats?.totalBadgesEarned || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle>Popular Topics</CardTitle>
                <CardDescription>Most played security topics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Phishing Awareness</span>
                    <Badge variant="outline">85%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Password Safety</span>
                    <Badge variant="outline">72%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Social Engineering</span>
                    <Badge variant="outline">68%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Two-Factor Auth</span>
                    <Badge variant="outline">54%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GamificationManagement;
