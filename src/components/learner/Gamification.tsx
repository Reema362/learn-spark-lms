
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Shield, Target, Brain, Award, Star, Play, Clock, Users, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Gamification = () => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [gameResults, setGameResults] = useState<any>(null);
  const [userStats, setUserStats] = useState({
    gamesPlayed: 5,
    gamesPassed: 3,
    averageScore: 78,
    badges: ['Phishing Hunter', 'Password Guardian']
  });
  const { toast } = useToast();

  // Sample games data with immediate availability
  const availableGames = [
    {
      id: 'phishing-quiz',
      title: 'Phishing Detection Challenge',
      description: 'Learn to identify suspicious emails and protect your organization from phishing attacks.',
      icon: Shield,
      difficulty: 'Beginner',
      topic: 'phishing',
      gameType: 'quiz',
      passingScore: 70,
      timeLimit: 5,
      questions: [
        {
          question: "Which of these emails is likely a phishing attempt?",
          options: ["Email from your bank asking for account verification", "Internal company newsletter", "Meeting invitation from a colleague", "Password reset from a service you use"],
          correct: 0
        },
        {
          question: "What should you do if you receive a suspicious email?",
          options: ["Click links to investigate", "Forward it to friends", "Report it to IT security", "Reply asking for more information"],
          correct: 2
        }
      ]
    },
    {
      id: 'password-strength',
      title: 'Password Security Master',
      description: 'Create and evaluate strong passwords to protect your digital accounts.',
      icon: Target,
      difficulty: 'Intermediate',
      topic: 'password',
      gameType: 'interactive',
      passingScore: 75,
      timeLimit: 7,
      questions: [
        {
          question: "Which password is strongest?",
          options: ["password123", "P@ssw0rd!", "MyD0g$N@me2024!", "12345678"],
          correct: 2
        },
        {
          question: "How often should you change your password?",
          options: ["Never", "Every day", "When compromised or every 90 days", "Every year"],
          correct: 2
        }
      ]
    },
    {
      id: 'social-engineering',
      title: 'Social Engineering Defense',
      description: 'Recognize and counter social engineering attacks and manipulation tactics.',
      icon: Brain,
      difficulty: 'Advanced',
      topic: 'social-engineering',
      gameType: 'scenario',
      passingScore: 80,
      timeLimit: 10,
      questions: [
        {
          question: "A stranger calls claiming to be from IT support asking for your password. What do you do?",
          options: ["Give them the password", "Ask for their employee ID and verify", "Hang up and call IT directly", "Ask them to prove they work there"],
          correct: 2
        }
      ]
    },
    {
      id: 'data-protection',
      title: 'Data Protection Quiz',
      description: 'Learn about data classification, handling, and protection best practices.',
      icon: Shield,
      difficulty: 'Intermediate',
      topic: 'data-protection',
      gameType: 'quiz',
      passingScore: 70,
      timeLimit: 6,
      questions: [
        {
          question: "What is the most secure way to share sensitive documents?",
          options: ["Email attachment", "USB drive", "Encrypted secure file sharing", "Print and hand deliver"],
          correct: 2
        }
      ]
    }
  ];

  const leaderboardData = [
    { name: 'John Smith', score: 95, badge: 'Security Expert' },
    { name: 'Sarah Johnson', score: 89, badge: 'Phishing Hunter' },
    { name: 'Mike Davis', score: 85, badge: 'Password Guardian' },
    { name: 'Emma Wilson', score: 82, badge: 'Data Protector' },
    { name: 'You', score: userStats.averageScore, badge: 'Learner' }
  ];

  const handlePlayGame = async (game: any) => {
    setSelectedGame(game.id);
    
    // Simulate game play with random score
    setTimeout(() => {
      const score = Math.floor(Math.random() * 40) + 60; // 60-100 range
      const passed = score >= game.passingScore;
      const timeTaken = Math.floor(Math.random() * (game.timeLimit * 60)) + 60;
      
      setGameResults({
        gameId: game.id,
        score,
        passed,
        game,
        timeTaken
      });

      // Update user stats
      setUserStats(prev => ({
        ...prev,
        gamesPlayed: prev.gamesPlayed + 1,
        gamesPassed: passed ? prev.gamesPassed + 1 : prev.gamesPassed,
        averageScore: Math.round((prev.averageScore + score) / 2)
      }));

      // Award badge if passed and first time
      if (passed && !userStats.badges.includes(game.title.split(' ')[0] + ' Expert')) {
        const newBadge = game.title.split(' ')[0] + ' Expert';
        setUserStats(prev => ({
          ...prev,
          badges: [...prev.badges, newBadge]
        }));
        
        toast({
          title: "🏆 Badge Earned!",
          description: `You've earned the "${newBadge}" badge!`,
        });
      }

      if (passed) {
        toast({
          title: "🎉 Congratulations!",
          description: `You scored ${score}% and passed ${game.title}!`,
        });
      } else {
        toast({
          title: "Keep Learning!",
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
    const icons: { [key: string]: any } = {
      'phishing': Shield,
      'password': Target,
      'social-engineering': Brain,
      'data-protection': Shield
    };
    return icons[topic] || Trophy;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Gamification</h2>
        <p className="text-muted-foreground">Learn cybersecurity through interactive challenges and games!</p>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{userStats.gamesPlayed}</div>
              <div className="text-sm text-muted-foreground">Games Played</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{userStats.gamesPassed}</div>
              <div className="text-sm text-muted-foreground">Games Passed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{userStats.averageScore}%</div>
              <div className="text-sm text-muted-foreground">Average Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{userStats.badges.length}</div>
              <div className="text-sm text-muted-foreground">Badges Earned</div>
            </div>
          </div>
          
          {/* Badges Display */}
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Your Badges:</h4>
            <div className="flex flex-wrap gap-2">
              {userStats.badges.map((badge, index) => (
                <Badge key={index} variant="secondary" className="bg-yellow-100 text-yellow-800">
                  <Award className="h-3 w-3 mr-1" />
                  {badge}
                </Badge>
              ))}
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
                    <CheckCircle className="h-4 w-4 mr-1" />
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
        {availableGames.map((game) => {
          const IconComponent = getGameIcon(game.gameType, game.topic);
          const isPlaying = selectedGame === game.id;
          
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
                    <span>{game.timeLimit}min</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span>Topic: {game.topic}</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>Pass: {game.passingScore}%</span>
                  </div>
                </div>

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
                      Start Game
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
            {leaderboardData.map((player, index) => (
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
                  <span className="font-medium">{player.name}</span>
                  {player.name === 'You' && (
                    <Badge variant="secondary" className="text-xs">You</Badge>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-xs">{player.badge}</Badge>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">{player.score}%</span>
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

export default Gamification;
