
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Shield, Target, Brain, Award, Star, Play, Clock, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGames, useSubmitGameSession, useUserGameStats, useLeaderboard } from '@/hooks/useGamification';
import { useAuth } from '@/context/AuthContext';

const Games = () => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [gameResults, setGameResults] = useState<any>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const { data: games, isLoading: gamesLoading } = useGames();
  const { data: userStats } = useUserGameStats(user?.id);
  const { data: leaderboard } = useLeaderboard();
  const submitGameSession = useSubmitGameSession();

  const gameIcons: { [key: string]: any } = {
    'phishing': Shield,
    'password': Target,
    'social-engineering': Brain,
    'quiz': Trophy
  };

  const handlePlayGame = async (game: any) => {
    setSelectedGame(game.id);
    
    // Simulate game play for demo
    setTimeout(() => {
      const score = Math.floor(Math.random() * 100) + 1;
      const timeTaken = Math.floor(Math.random() * 300) + 60; // 1-5 minutes
      
      setGameResults({
        gameId: game.id,
        score,
        passed: score >= (game.passing_score || 70),
        game,
        timeTaken
      });

      // Submit game session
      submitGameSession.mutate({
        gameId: game.id,
        score,
        timeTaken,
        answers: {} // Mock answers
      });

      if (score >= (game.passing_score || 70)) {
        toast({
          title: "Congratulations!",
          description: `You scored ${score}% and passed ${game.title}!`,
        });
      } else {
        toast({
          title: "Good Try!",
          description: `You scored ${score}%. Try again to improve your score!`,
          variant: "destructive"
        });
      }
      
      setSelectedGame(null);
    }, 3000);
  };

  const resetGame = () => {
    setGameResults(null);
    setSelectedGame(null);
  };

  const getGameIcon = (gameType: string, topic: string) => {
    const IconComponent = gameIcons[gameType] || gameIcons[topic] || Trophy;
    return IconComponent;
  };

  const getUserBestScore = (gameId: string) => {
    if (!userStats) return null;
    const gameSessions = userStats.filter((session: any) => session.game_id === gameId);
    return gameSessions.length > 0 ? Math.max(...gameSessions.map((s: any) => s.score)) : null;
  };

  if (gamesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Security Training Games</h2>
        <p className="text-muted-foreground">Learn cybersecurity through interactive challenges!</p>
      </div>

      {/* User Progress Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Your Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {userStats?.length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Games Played</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {userStats?.filter((s: any) => s.score >= 70).length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Games Passed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {userStats?.length > 0 ? Math.round(userStats.reduce((acc: number, s: any) => acc + s.score, 0) / userStats.length) : 0}%
              </div>
              <div className="text-sm text-muted-foreground">Average Score</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Results Modal */}
      {gameResults && (
        <Card className="border-primary">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              {gameResults.passed ? (
                <Trophy className="h-6 w-6 text-yellow-500" />
              ) : (
                <Target className="h-6 w-6 text-blue-500" />
              )}
              Game Complete!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div>
              <div className="text-4xl font-bold mb-2">{gameResults.score}%</div>
              <Progress value={gameResults.score} className="w-full mb-4" />
              <div className="text-lg">
                {gameResults.passed ? (
                  <Badge variant="default" className="bg-green-600">
                    <Award className="h-4 w-4 mr-1" />
                    Passed!
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    Keep Practicing!
                  </Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                Completed in {Math.floor(gameResults.timeTaken / 60)}m {gameResults.timeTaken % 60}s
              </div>
            </div>
            <Button onClick={resetGame}>Play Another Game</Button>
          </CardContent>
        </Card>
      )}

      {/* Available Games */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games?.map((game: any) => {
          const IconComponent = getGameIcon(game.game_type, game.topic);
          const isPlaying = selectedGame === game.id;
          const bestScore = getUserBestScore(game.id);
          
          return (
            <Card key={game.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
                  <IconComponent className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">{game.title}</CardTitle>
                <CardDescription>{game.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <Badge variant="outline">{game.difficulty}</Badge>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{Math.floor((game.time_limit_seconds || 300) / 60)}min</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span>Topic: {game.topic}</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>Pass: {game.passing_score || 70}%</span>
                  </div>
                </div>

                {bestScore && (
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Your Best Score</div>
                    <div className="text-lg font-bold text-primary">{bestScore}%</div>
                  </div>
                )}

                <Button 
                  onClick={() => handlePlayGame(game)}
                  disabled={isPlaying || selectedGame !== null}
                  className="w-full"
                >
                  {isPlaying ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Playing...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      {bestScore ? 'Play Again' : 'Start Game'}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Leaderboard
          </CardTitle>
          <CardDescription>Top performers this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {leaderboard?.slice(0, 10).map((player: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 rounded border">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    index === 0 ? 'bg-yellow-100 text-yellow-800' :
                    index === 1 ? 'bg-gray-100 text-gray-800' :
                    index === 2 ? 'bg-orange-100 text-orange-800' :
                    'bg-primary/10 text-primary'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="font-medium">
                    {player.profiles?.first_name} {player.profiles?.last_name}
                  </span>
                  {user?.id === player.user_id && (
                    <Badge variant="secondary" className="text-xs">You</Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">{player.score}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Games;
