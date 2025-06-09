
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Shield, Target, Brain, Award, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DatabaseService } from '@/services/database';

const SecurityGames = () => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [gameResults, setGameResults] = useState<any>(null);
  const { toast } = useToast();

  const securityGames = [
    {
      id: 'phishing-quiz',
      title: 'Phishing Detection Challenge',
      description: 'Identify phishing emails and protect your organization',
      icon: Shield,
      difficulty: 'Beginner',
      points: 100,
      badge: 'Phishing Hunter'
    },
    {
      id: 'password-strength',
      title: 'Password Security Master',
      description: 'Create and evaluate strong passwords',
      icon: Target,
      difficulty: 'Intermediate',
      points: 150,
      badge: 'Password Guardian'
    },
    {
      id: 'social-engineering',
      title: 'Social Engineering Defense',
      description: 'Recognize and counter social engineering attacks',
      icon: Brain,
      difficulty: 'Advanced',
      points: 200,
      badge: 'Security Analyst'
    }
  ];

  const handlePlayGame = async (gameId: string) => {
    setSelectedGame(gameId);
    
    // Simulate game play
    setTimeout(() => {
      const score = Math.floor(Math.random() * 100) + 1;
      const game = securityGames.find(g => g.id === gameId);
      
      setGameResults({
        gameId,
        score,
        passed: score >= 70,
        game
      });

      if (score >= 70) {
        toast({
          title: "Congratulations!",
          description: `You scored ${score}% and earned the ${game?.badge} badge!`,
        });
        
        // Award badge (in real implementation)
        // DatabaseService.awardBadge(userId, badgeId);
      } else {
        toast({
          title: "Good Try!",
          description: `You scored ${score}%. Try again to earn your badge!`,
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

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Information Security Games</h2>
        <p className="text-muted-foreground">Test your security knowledge and earn badges!</p>
      </div>

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
              <div className="text-lg">
                {gameResults.passed ? (
                  <Badge variant="default" className="bg-success">
                    <Award className="h-4 w-4 mr-1" />
                    {gameResults.game.badge} Earned!
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    Keep Practicing!
                  </Badge>
                )}
              </div>
            </div>
            <Button onClick={resetGame}>Play Another Game</Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {securityGames.map((game) => {
          const IconComponent = game.icon;
          const isPlaying = selectedGame === game.id;
          
          return (
            <Card key={game.id} className="dashboard-card hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
                  <IconComponent className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">{game.title}</CardTitle>
                <CardDescription>{game.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <Badge variant="outline">{game.difficulty}</Badge>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">{game.points} pts</span>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-2">Badge Reward:</div>
                  <Badge variant="secondary">{game.badge}</Badge>
                </div>

                <Button 
                  onClick={() => handlePlayGame(game.id)}
                  disabled={isPlaying || selectedGame !== null}
                  className="w-full"
                >
                  {isPlaying ? 'Playing...' : 'Start Game'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
          <CardDescription>Top security champions this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: 'Alice Johnson', badges: 5, points: 850 },
              { name: 'Bob Smith', badges: 4, points: 720 },
              { name: 'Carol Davis', badges: 3, points: 680 }
            ].map((player, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded border">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <span className="font-medium">{player.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Award className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">{player.badges}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">{player.points}</span>
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

export default SecurityGames;
