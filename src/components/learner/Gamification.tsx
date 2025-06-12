
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Shield, Target, Brain, Award, Star, Play, Clock, Users, CheckCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const Gamification = () => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [gameResults, setGameResults] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const [userStats, setUserStats] = useState({
    gamesPlayed: 5,
    gamesPassed: 3,
    averageScore: 78,
    badges: ['Phishing Hunter', 'Password Guardian', 'Security Expert']
  });
  const { toast } = useToast();

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
      timeLimit: 2,
      questions: [
        {
          question: "Which of these email characteristics is MOST likely to indicate a phishing attempt?",
          options: [
            "The email comes from your bank's official domain",
            "The email asks you to click a link to 'verify your account urgently'", 
            "The email is addressed to you by name",
            "The email has proper grammar and spelling"
          ],
          correct: 1
        },
        {
          question: "What should you do if you receive a suspicious email asking for personal information?",
          options: [
            "Reply with the requested information",
            "Click the link to see if it's legitimate",
            "Delete the email and contact the organization directly through official channels",
            "Forward it to all your contacts to warn them"
          ],
          correct: 2
        },
        {
          question: "Which domain is MOST likely to be a phishing attempt?",
          options: [
            "bank-official.com",
            "your-bank.com",
            "yourbank.com",
            "yourbankofficial.net"
          ],
          correct: 3
        }
      ]
    },
    {
      id: 'password-strength',
      title: 'Password Security Master',
      description: 'Test your knowledge about creating and managing strong passwords.',
      icon: Target,
      difficulty: 'Intermediate',
      topic: 'password',
      gameType: 'quiz',
      passingScore: 75,
      timeLimit: 3,
      questions: [
        {
          question: "Which password is the STRONGEST?",
          options: [
            "Password123!",
            "p@ssw0rd",
            "Tr0ub4dor&3",
            "MyD0g$N@me2024!Random"
          ],
          correct: 3
        },
        {
          question: "What is the BEST practice for password management?",
          options: [
            "Use the same strong password for all accounts",
            "Write passwords down on sticky notes",
            "Use a password manager with unique passwords for each account",
            "Change passwords every week"
          ],
          correct: 2
        },
        {
          question: "What makes two-factor authentication (2FA) effective?",
          options: [
            "It uses longer passwords",
            "It requires something you know AND something you have",
            "It automatically generates passwords",
            "It encrypts your password"
          ],
          correct: 1
        }
      ]
    },
    {
      id: 'social-engineering',
      title: 'Social Engineering Defense',
      description: 'Learn to recognize and counter social engineering attacks and manipulation tactics.',
      icon: Brain,
      difficulty: 'Advanced',
      topic: 'social-engineering',
      gameType: 'scenario',
      passingScore: 80,
      timeLimit: 4,
      questions: [
        {
          question: "A caller claims to be from IT support and urgently needs your password to 'fix a security issue'. What should you do?",
          options: [
            "Provide the password since it's urgent",
            "Ask them to verify their identity first, then provide the password",
            "Hang up and call your IT department directly using a known number",
            "Give them a fake password to test if they're legitimate"
          ],
          correct: 2
        },
        {
          question: "You receive a USB drive in the mail with no sender information. What should you do?",
          options: [
            "Plug it into your work computer to see what's on it",
            "Take it to IT security immediately without plugging it in",
            "Plug it into a personal computer instead",
            "Share it with colleagues to see if anyone recognizes it"
          ],
          correct: 1
        },
        {
          question: "Someone tailgates behind you into a secure building. What should you do?",
          options: [
            "Ignore them since they probably work here",
            "Politely ask them to show their badge or use their own access card",
            "Hold the door open to be courteous",
            "Confront them aggressively"
          ],
          correct: 1
        }
      ]
    },
    {
      id: 'data-protection',
      title: 'Data Protection Challenge',
      description: 'Master data classification, handling, and protection best practices.',
      icon: Shield,
      difficulty: 'Intermediate',
      topic: 'data-protection',
      gameType: 'quiz',
      passingScore: 70,
      timeLimit: 3,
      questions: [
        {
          question: "What is the MOST secure way to share confidential business documents?",
          options: [
            "Email with password protection",
            "Encrypted file sharing platform with access controls",
            "USB drive hand delivery",
            "Cloud storage with public link"
          ],
          correct: 1
        },
        {
          question: "When working remotely, what should you do with sensitive documents on your desk?",
          options: [
            "Leave them out for easy access",
            "Cover them with other papers",
            "Lock them away when not actively using them",
            "Take pictures for backup"
          ],
          correct: 2
        },
        {
          question: "What should you do before disposing of old hard drives?",
          options: [
            "Just delete the files",
            "Format the drive",
            "Use secure data wiping or physical destruction",
            "Remove the drive labels"
          ],
          correct: 2
        }
      ]
    }
  ];

  const leaderboardData = [
    { name: 'Alex Rodriguez', score: 98, badge: 'Security Master' },
    { name: 'Sarah Johnson', score: 95, badge: 'Phishing Expert' },
    { name: 'Mike Davis', score: 92, badge: 'Data Guardian' },
    { name: 'Emma Wilson', score: 89, badge: 'Password Pro' },
    { name: 'You', score: userStats.averageScore, badge: 'Security Learner' }
  ];

  // Timer effect
  useEffect(() => {
    if (gameStarted && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameStarted && timeLeft === 0) {
      handleGameComplete();
    }
  }, [timeLeft, gameStarted]);

  const handlePlayGame = (game: any) => {
    setSelectedGame(game.id);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setAnswers([]);
    setTimeLeft(game.timeLimit * 60);
    setGameStarted(true);
    setGameResults(null);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    const game = availableGames.find(g => g.id === selectedGame);
    if (!game) return;

    const newAnswers = [...answers, selectedAnswer || -1];
    setAnswers(newAnswers);

    // Calculate score
    if (selectedAnswer === game.questions[currentQuestion].correct) {
      setScore(score + 1);
    }

    if (currentQuestion + 1 < game.questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      handleGameComplete();
    }
  };

  const handleGameComplete = () => {
    const game = availableGames.find(g => g.id === selectedGame);
    if (!game) return;

    const finalScore = Math.round((score / game.questions.length) * 100);
    const passed = finalScore >= game.passingScore;
    const timeTaken = (game.timeLimit * 60) - timeLeft;

    setGameResults({
      gameId: game.id,
      score: finalScore,
      passed,
      game,
      timeTaken
    });

    // Update user stats
    setUserStats(prev => ({
      ...prev,
      gamesPlayed: prev.gamesPlayed + 1,
      gamesPassed: passed ? prev.gamesPassed + 1 : prev.gamesPassed,
      averageScore: Math.round((prev.averageScore + finalScore) / 2)
    }));

    // Award badge if passed and first time
    if (passed && !userStats.badges.includes(game.title.split(' ')[0] + ' Master')) {
      const newBadge = game.title.split(' ')[0] + ' Master';
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
        description: `You scored ${finalScore}% and passed ${game.title}!`,
      });
    } else {
      toast({
        title: "Keep Learning!",
        description: `You scored ${finalScore}%. Try again to improve your score!`,
        variant: "destructive"
      });
    }
    
    setGameStarted(false);
    setSelectedGame(null);
  };

  const resetGame = () => {
    setGameResults(null);
    setSelectedGame(null);
    setGameStarted(false);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setAnswers([]);
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

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Game Playing Interface
  if (gameStarted && selectedGame) {
    const game = availableGames.find(g => g.id === selectedGame);
    if (!game) return null;

    const question = game.questions[currentQuestion];
    
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Card className="border-primary">
          <CardHeader className="text-center">
            <div className="flex justify-between items-center mb-4">
              <Badge variant="outline">{game.title}</Badge>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className={`font-mono ${timeLeft < 30 ? 'text-destructive' : ''}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
            <CardTitle>Question {currentQuestion + 1} of {game.questions.length}</CardTitle>
            <Progress value={((currentQuestion + 1) / game.questions.length) * 100} className="mt-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-6">{question.question}</h3>
              <div className="space-y-3">
                {question.options.map((option, index) => (
                  <Button
                    key={index}
                    variant={selectedAnswer === index ? "default" : "outline"}
                    className="w-full p-4 h-auto text-left justify-start"
                    onClick={() => handleAnswerSelect(index)}
                  >
                    <span className="mr-3 font-semibold">{String.fromCharCode(65 + index)}.</span>
                    {option}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex justify-between items-center pt-6">
              <div className="text-sm text-muted-foreground">
                Score: {score}/{currentQuestion + (selectedAnswer !== null ? 1 : 0)}
              </div>
              <Button 
                onClick={handleNextQuestion}
                disabled={selectedAnswer === null}
              >
                {currentQuestion + 1 === game.questions.length ? 'Complete Game' : 'Next Question'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            <div className="flex gap-2 justify-center">
              <Button onClick={resetGame}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Play Another Game
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handlePlayGame(gameResults.game)}
              >
                Retry This Game
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Games */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {availableGames.map((game) => {
          const IconComponent = getGameIcon(game.gameType, game.topic);
          
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
                  <span>Questions: {game.questions.length}</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>Pass: {game.passingScore}%</span>
                  </div>
                </div>

                <Button 
                  onClick={() => handlePlayGame(game)}
                  disabled={gameStarted}
                  className="w-full"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Game
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
