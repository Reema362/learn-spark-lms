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
import { Plus, Edit, Eye, Play, Upload, Calendar, Users, Target, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useGames, useGameBadges, useCreateGame } from '@/hooks/useDatabase';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const GamificationManagement = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newGame, setNewGame] = useState({
    title: '',
    description: '',
    game_type: 'quiz',
    difficulty: 'easy',
    topic: '',
    time_limit_seconds: 300,
    questions: [],
    passing_score: 70
  });

  const { data: games, isLoading } = useGames();
  const { data: gameBadges, isLoading: isBadgesLoading } = useGameBadges();
  const createGameMutation = useCreateGame();
  const { toast } = useToast();

  const handleCreateGame = async () => {
    if (!newGame.title || !newGame.topic) return;

    try {
      await createGameMutation.mutateAsync(newGame);
      setIsCreateOpen(false);
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
      toast({
        title: "Success",
        description: "Game created successfully",
      });
    } catch (error: any) {
      console.error('Error creating game:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
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

  if (isLoading || isBadgesLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  const gamesArray = Array.isArray(games) ? games : [];
  const badgesArray = Array.isArray(gameBadges) ? gameBadges : [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Gamification Management</h2>
          <p className="text-muted-foreground">Create and manage games and badges</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Game
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Game</DialogTitle>
              <DialogDescription>Design a new security awareness game</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Game Title</Label>
                <Input
                  id="title"
                  value={newGame.title}
                  onChange={(e) => setNewGame({ ...newGame, title: e.target.value })}
                  placeholder="e.g., Phishing Quiz"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newGame.description}
                  onChange={(e) => setNewGame({ ...newGame, description: e.target.value })}
                  placeholder="Describe the game objectives and target audience..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="topic">Topic</Label>
                  <Input
                    id="topic"
                    type="text"
                    value={newGame.topic}
                    onChange={(e) => setNewGame({ ...newGame, topic: e.target.value })}
                    placeholder="e.g., Phishing, Malware, Password Security"
                  />
                </div>
                <div>
                  <Label htmlFor="game_type">Game Type</Label>
                  <Select
                    value={newGame.game_type}
                    onValueChange={(value) => setNewGame({ ...newGame, game_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quiz">Quiz</SelectItem>
                      <SelectItem value="challenge">Challenge</SelectItem>
                      <SelectItem value="simulation">Simulation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select
                    value={newGame.difficulty}
                    onValueChange={(value) => setNewGame({ ...newGame, difficulty: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="time_limit_seconds">Time Limit (seconds)</Label>
                  <Input
                    id="time_limit_seconds"
                    type="number"
                    value={newGame.time_limit_seconds}
                    onChange={(e) => setNewGame({ ...newGame, time_limit_seconds: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="passing_score">Passing Score (%)</Label>
                <Input
                  id="passing_score"
                  type="number"
                  value={newGame.passing_score}
                  onChange={(e) => setNewGame({ ...newGame, passing_score: parseInt(e.target.value) })}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateGame} disabled={createGameMutation.isPending}>
                  {createGameMutation.isPending ? 'Creating...' : 'Create Game'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="stats-card">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-primary">{gamesArray.length}</div>
            <div className="text-sm text-muted-foreground">Total Games</div>
          </CardContent>
        </Card>
        <Card className="stats-card">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-success">{badgesArray.length}</div>
            <div className="text-sm text-muted-foreground">Total Badges</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="games" className="space-y-6">
        <TabsList>
          <TabsTrigger value="games">Games</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
        </TabsList>

        <TabsContent value="games" className="space-y-6">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>Games</CardTitle>
              <CardDescription>Manage your security awareness games</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gamesArray.map((game: any) => (
                  <Card key={game.id} className="campaign-card hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-lg">{game.title}</h3>
                        </div>

                        {game.description && (
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {game.description}
                          </p>
                        )}

                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Target className="h-3 w-3 mr-2" />
                            Topic: {game.topic}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Badge className={getDifficultyColor(game.difficulty)}>
                              {game.difficulty?.toUpperCase()}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline">
                            <Play className="h-3 w-3 mr-1" />
                            Play
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
              <CardTitle>Badges</CardTitle>
              <CardDescription>Manage game badges</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Tier</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {badgesArray.map((badge) => (
                    <TableRow key={badge.id}>
                      <TableCell className="font-medium">{badge.tier}</TableCell>
                      <TableCell>{badge.name}</TableCell>
                      <TableCell>{badge.description}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GamificationManagement;
