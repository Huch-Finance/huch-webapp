"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/organism/navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Medal, Crown, Star, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Footer } from "@/components/organism/footer";

interface LeaderboardUser {
  id: string;
  steamUser?: string;
  username?: string;
  steamAvatar?: string;
  points: number;
  rank?: number;
}

interface LeaderboardResponse {
  leaderboard: LeaderboardUser[];
  user?: LeaderboardUser;
}

export default function Classement() {
  const [activeTab, setActiveTab] = useState("top10");
  const [apiData, setApiData] = useState<LeaderboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { profile, isAuthenticated, isLoading: authLoading, login, getPrivyAccessToken } = useAuth();

  // Fetch leaderboard data from API
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        const token = await getPrivyAccessToken();
        if (!token) {
          setApiData(null);
          return;
        }
        const response = await fetch("http://localhost:3333/api/leaderboard", {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
        });
        if (response.ok) {
          const data: LeaderboardResponse = await response.json();
          setApiData(data);
        } else {
          setApiData(null);
        }
      } catch (error) {
        setApiData(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
  }, []); // tableau vide = une seule fois au montage

  const isUserConnected = isAuthenticated;
  const hasSteamLinked = profile?.steamId !== null;

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <Star className="w-5 h-5 text-gray-500" />;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return "text-yellow-500";
    if (rank === 2) return "text-gray-400";
    if (rank === 3) return "text-amber-600";
    return "text-gray-500";
  };

  const formatPoints = (points: number) => {
    if (points >= 1000000) {
      return `${(points / 1000000).toFixed(1)}M`;
    }
    if (points >= 1000) {
      return `${(points / 1000).toFixed(1)}K`;
    }
    return points.toString();
  };

  const getCurrentUserRank = () => {
    if (!apiData?.user || !apiData?.leaderboard) return null;
    const userIndex = apiData.leaderboard.findIndex(user => user.id === apiData.user?.id);
    return userIndex !== -1 ? userIndex + 1 : null;
  };

  const currentUserRank = getCurrentUserRank();

  if (authLoading) {
    return (
      <div className="flex flex-col min-h-screen text-white">
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5D5FEF] mx-auto mb-4"></div>
            <p>Chargement...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!isUserConnected) {
    return (
      <div className="flex flex-col min-h-screen text-white">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Trophy className="w-16 h-16 text-[#5D5FEF] mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Classement</h2>
            <p className="text-gray-400 mb-6">
              Connectez-vous pour voir le classement des joueurs
            </p>
            <Button onClick={login} className="bg-[#5D5FEF] hover:bg-[#4A4CDF]">
              Se connecter
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen text-white">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center py-12">
        <div className="w-full max-w-xl space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2 flex items-center justify-center">
              <Trophy className="mr-3 text-[#5D5FEF]" />
              Classement
            </h1>
            <p className="text-gray-400">
              Découvrez les meilleurs joueurs de la plateforme
            </p>
          </div>

          {!hasSteamLinked && (
            <Card className="border border-neutral-800 bg-neutral-900">
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-12 h-12 text-[#5D5FEF] mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Liez votre compte Steam</h3>
                <p className="text-gray-400 mb-4">
                  Pour apparaître dans le classement, vous devez lier votre compte Steam
                </p>
                <Button className="bg-[#5D5FEF] hover:bg-[#4A4CDF]">
                  Lier Steam
                </Button>
              </CardContent>
            </Card>
          )}

          {currentUserRank && (
            <Card className="border border-neutral-800 bg-neutral-900">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="mr-2 text-[#5D5FEF]" />
                  Votre Position
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getRankIcon(currentUserRank)}
                    <span className={`text-lg font-semibold ${getRankColor(currentUserRank)}`}>
                      #{currentUserRank}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Points</p>
                    <p className="text-lg font-bold text-[#5D5FEF]">
                      {apiData?.user?.points ? formatPoints(apiData.user.points) : "0"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="top10">Top 10</TabsTrigger>
              <TabsTrigger value="all">Tous les joueurs</TabsTrigger>
            </TabsList>

            <TabsContent value="top10" className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5D5FEF] mx-auto mb-4"></div>
                  <p>Chargement du classement...</p>
                </div>
              ) : apiData?.leaderboard ? (
                <div className="space-y-3">
                  {apiData.leaderboard.slice(0, 10).map((user, index) => (
                    <Card key={user.id} className="border border-neutral-800 bg-neutral-900">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {getRankIcon(index + 1)}
                            <span className={`font-semibold ${getRankColor(index + 1)}`}>
                              #{index + 1}
                            </span>
                            <div className="flex items-center space-x-2">
                              {user.steamAvatar && (
                                <img
                                  src={user.steamAvatar}
                                  alt={user.username || user.steamUser || "User"}
                                  className="w-8 h-8 rounded-full"
                                />
                              )}
                              <span className="font-medium">
                                {user.username || user.steamUser || "Joueur"}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-400">Points</p>
                            <p className="text-lg font-bold text-[#5D5FEF]">
                              {formatPoints(user.points)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border border-neutral-800 bg-neutral-900">
                  <CardContent className="p-6 text-center">
                    <p className="text-gray-400">Aucun joueur dans le classement</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="all" className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5D5FEF] mx-auto mb-4"></div>
                  <p>Chargement du classement...</p>
                </div>
              ) : apiData?.leaderboard ? (
                <div className="space-y-3">
                  {apiData.leaderboard.map((user, index) => (
                    <Card key={user.id} className="border border-neutral-800 bg-neutral-900">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {getRankIcon(index + 1)}
                            <span className={`font-semibold ${getRankColor(index + 1)}`}>
                              #{index + 1}
                            </span>
                            <div className="flex items-center space-x-2">
                              {user.steamAvatar && (
                                <img
                                  src={user.steamAvatar}
                                  alt={user.username || user.steamUser || "User"}
                                  className="w-8 h-8 rounded-full"
                                />
                              )}
                              <span className="font-medium">
                                {user.username || user.steamUser || "Joueur"}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-400">Points</p>
                            <p className="text-lg font-bold text-[#5D5FEF]">
                              {formatPoints(user.points)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border border-neutral-800 bg-neutral-900">
                  <CardContent className="p-6 text-center">
                    <p className="text-gray-400">Aucun joueur dans le classement</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
