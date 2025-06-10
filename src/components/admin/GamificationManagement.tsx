
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trophy, Target, Clock, Users, Star, Award, Edit, Trash2 } from 'lucide-react';
import { useGames, useGameBadges, useCreateGame, useUserGameStats, useLeaderboard } from '@/hooks/useDatabase';

const GamificationManagement = () => {
  const [isCreateGameDialogOpen, setIsCreateGameDialogOpen] = useState(false);
  const [newGame, setNewGame] = useState({
    title: '',
    description: '',
    game_type: 'quiz',
    difficulty: 'easy' as 'easy' | 'medium' | 'hard',
    topic: '',
    time_limit_seconds: 300,
    questions: [] as any[],
    passing_score: 70
  });

  const { data: games = [], isLoading: gamesLoading } = useGames();
  const { data: badges = [], isLoading: badgesLoading } = useGameBadges();
  const { data: leaderboard = [], isLoading: leaderboardLoading } = useLeaderboard();
  const createGame = useCreateGame();

  const handleCreateGame = async () => {
    try {
      await createGame.mutateAsync(newGame);
      setIsCreateGameDialogOpen(false);
      setNewGame({
        title: '',
        description: '',
        game_type: 'quiz',
        difficulty: 'easy',
        topic: '',
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
        return <Badge variant="outline">Easy</Badge>;
      case 'medium':
        return <Badge>Medium</Badge>;
      case 'hard':
        return <Badge variant="destructive">Hard</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const gameStats = {
    total: games.length,
    quiz: games.filter(game => game.game_type === 'quiz').length,
    challenge: games.filter(game => game.game_type === 'challenge').length
  };

  if (gamesLoading || badgesLoading || leaderboardLoading) {
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
          <h2 className="text-3xl font-bold">Gamification Management</h2>
          <p className="text-muted-foreground">Manage games, badges, and leaderboards</p>
        </div>
        <Dialog open={isCreateGameDialogOpen} onOpenChange={setIsCreateGameDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Game
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Game</DialogTitle>
              <DialogDescription>
                Add a new game to the platform
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newGame.title}
                    onChange={(e) => setNewGame(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Cybersecurity Quiz"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="topic">Topic</Label>
                  <Input
                    id="topic"
                    value={newGame.topic}
                    onChange={(e) => setNewGame(prev => ({ ...prev, topic: e.target.value }))}
                    placeholder="Phishing Awareness"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newGame.description}
                  onChange={(e) => setNewGame(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="A quiz to test your knowledge on cybersecurity"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="game_type">Game Type</Label>
                  <Select value={newGame.game_type} onValueChange={(value: any) => setNewGame(prev => ({ ...prev, game_type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quiz">Quiz</SelectItem>
                      <SelectItem value="challenge">Challenge</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select value={newGame.difficulty} onValueChange={(value: any) => setNewGame(prev => ({ ...prev, difficulty: value }))}>
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
              </div>
              <div className="grid gap-2">
                <Label htmlFor="time_limit_seconds">Time Limit (seconds)</Label>
                <Input
                  id="time_limit_seconds"
                  type="number"
                  value={newGame.time_limit_seconds}
                  onChange={(e) => setNewGame(prev => ({ ...prev, time_limit_seconds: parseInt(e.target.value) }))}
                  placeholder="300"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="passing_score">Passing Score (%)</Label>
                <Input
                  id="passing_score"
                  type="number"
                  value={newGame.passing_score}
                  onChange={(e) => setNewGame(prev => ({ ...prev, passing_score: parseInt(e.target.value) }))}
                  placeholder="70"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateGameDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateGame} disabled={createGame.isPending}>
                {createGame.isPending ? 'Creating...' : 'Create Game'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="stats-card">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-primary">{gameStats.total}</div>
            <div className="text-sm text-muted-foreground">Total Games</div>
          </CardContent>
        </Card>
        <Card className="stats-card">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-secondary">{gameStats.quiz}</div>
            <div className="text-sm text-muted-foreground">Quizzes</div>
          </CardContent>
        </Card>
        <Card className="stats-card">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-success">{gameStats.challenge}</div>
            <div className="text-sm text-muted-foreground">Challenges</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different gamification sections */}
      <Tabs defaultValue="games" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="games">Games List</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="games" className="space-y-4">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>All Games</CardTitle>
              <CardDescription>Manage individual game settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {games.map((game: any) => (
                  <div key={game.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold">
                            {game.title}
                          </h3>
                          {getDifficultyBadge(game.difficulty)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {game.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Topic: {game.topic}
                        </p>
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

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Type:</span>
                        <span className="ml-1">{game.game_type}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Time Limit:</span>
                        <span className="ml-1">{game.time_limit_seconds}s</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Passing Score:</span>
                        <span className="ml-1">{game.passing_score}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {games.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No games found.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="badges">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>All Badges</CardTitle>
              <CardDescription>Manage individual badge settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {badges.map((badge: any) => (
                  <div key={badge.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold">
                            {badge.name}
                          </h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {badge.description}
                        </p>
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
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {badges.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No badges found.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="leaderboard">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>Leaderboard</CardTitle>
              <CardDescription>View top performing users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaderboard.map((entry: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold">
                            {entry.profiles.first_name} {entry.profiles.last_name}
                          </h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Score: {entry.total_score}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {leaderboard.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No leaderboard entries found.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GamificationManagement;
