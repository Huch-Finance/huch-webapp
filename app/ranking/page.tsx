"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/organism/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Trophy,
  Medal,
  Award,
  ChevronUp,
  AlertTriangle,
  Wallet,
} from "lucide-react";
import { Footer } from "@/components/organism/footer";
import { useAuth } from "@/hooks/use-auth";
import { SteamAuthButton } from "@/components/auth/steam-auth-button";
import { LoadingOverlay } from "@/components/loading/loading-overlay";

// Mocked leaderboard data
const LEADERBOARD = [
  {
    id: 1,
    steamId: "76561198055988469",
    steamUser: "xXDragonSlayerXx",
    points: 1250,
    badge: "Gold",
    steamAvatar: "/avatars/crown-pixel.webp",
  },
  {
    id: 2,
    steamId: "76561198055988470",
    steamUser: "HeadshotQueen",
    points: 1120,
    badge: "Gold",
    steamAvatar: "/avatars/purple-eye.jpeg",
  },
  {
    id: 3,
    steamId: "76561198055988471",
    steamUser: "NinjaDefuser",
    points: 980,
    badge: "Gold",
    steamAvatar: "/avatars/balaclava.jpeg",
  },
  {
    id: 4,
    steamId: "76561198055988472",
    steamUser: "AWPmaster2000",
    points: 850,
    badge: "Silver",
    steamAvatar: "/avatars/rabbit-warrior.png",
  },
  {
    id: 5,
    steamId: "76561198055988473",
    steamUser: "FragMachine",
    points: 720,
    badge: "Silver",
    steamAvatar: "/avatars/psyoch.jpeg",
  },
  {
    id: 6,
    steamId: "76561198055988474",
    steamUser: "ClutchKing",
    points: 680,
    badge: "Silver",
    steamAvatar: "/avatars/totoro.png",
  },
  {
    id: 7,
    steamId: "76561198055988475",
    steamUser: "SprayControl",
    points: 550,
    badge: "Bronze",
    steamAvatar:
      "https://preview.redd.it/a-steam-avatar-disappeared-from-my-account-v0-lm50a5y65gse1.png?width=184&format=png&auto=webp&s=749833429c70e19910caf0d993cb56bb54219f1c",
  },
  {
    id: 8,
    steamId: "76561198055988476",
    steamUser: "BombPlanter",
    points: 490,
    badge: "Bronze",
    steamAvatar:
      "https://cdn4.iconfinder.com/data/icons/steampunk-vintage-metal-steam/100/steampunk_male_vintage_avatar_metal_steam-512.png",
  },
  {
    id: 9,
    steamId: "76561198055988477",
    steamUser: "SmokeThrow",
    points: 420,
    badge: "Bronze",
    steamAvatar:
      "https://i.pinimg.com/564x/55/1f/ff/551fff636303fb8a696c213736ddc09e.jpg",
  },
  {
    id: 10,
    steamId: "76561198055988478",
    steamUser: "FlashBang",
    points: 380,
    badge: "Bronze",
    steamAvatar:
      "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/f5b8366a-d1b6-4447-b0b0-e1ba61bbb5ad/d8c9e4k-d80c27fa-1eef-43c0-b0d3-c0f87070b6f5.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcL2Y1YjgzNjZhLWQxYjYtNDQ0Ny1iMGIwLWUxYmE2MWJiYjVhZFwvZDhjOWU0ay1kODBjMjdmYS0xZWVmLTQzYzAtYjBkMy1jMGY4NzA3MGI2ZjUucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.4p6W32n2zeZauo15oUp--WLTbi-a_LvuRlmPgKH4FTY",
  },
];

interface LeaderboardUser {
  id: string;
  steamId: string | null;
  steamUser: string | null;
  steamAvatar: string | null;
  points: number;
  rank: number;
  badges: string[];
}

interface LeaderboardResponse {
  leaderboard: LeaderboardUser[];
  user: LeaderboardUser & { steamLinked: boolean };
  userStatus: string;
}

export default function Classement() {
  const [activeTab, setActiveTab] = useState("top10");
  const [apiData, setApiData] = useState<LeaderboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { profile, isAuthenticated, isLoading: authLoading, login } = useAuth();

  // Fetch leaderboard data from API
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("http://localhost:3333/api/leaderboard", {
          headers: {
            "Content-Type": "application/json",
            "X-Privy-Id": localStorage.getItem("privy:id") || "",
          },
        });

        if (response.ok) {
          const data: LeaderboardResponse = await response.json();
          console.log("Leaderboard data:", data);
          console.log("Leaderboard users:", data.leaderboard?.map(user => ({
            id: user.id,
            steamUser: user.steamUser,
            username: (user as any).username,
            steamAvatar: user.steamAvatar,
            points: user.points
          })));
          console.log("Current user data:", data.user);
          setApiData(data);
        } else {
          console.error(
            "Failed to fetch leaderboard data:",
            response.statusText,
          );
          // Pas de fallback pour le moment, on garde null
          setApiData(null);
        }
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
        setApiData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  // Détermine si l'utilisateur est connecté (utilise uniquement l'état local de Privy car l'API peut être incorrecte)
  const isUserConnected = isAuthenticated;

  // Détermine si l'utilisateur a un compte Steam lié (vérifie uniquement le profil local)
  const hasSteamLinked = profile?.steamId !== null;

  // Recherche l'utilisateur dans le leaderboard si l'API n'a pas renvoyé les données utilisateur
  const currentUser =
    apiData?.user ||
    (apiData?.leaderboard && profile?.id
      ? apiData.leaderboard.find((user) => user.id === profile.id)
      : null);

  // Détermine le badge de l'utilisateur en fonction de ses points
  const getUserBadge = (points: number) => {
    if (points >= 1000) return "Gold";
    if (points >= 500) return "Silver";
    return "Bronze";
  };

  // Détermine le prochain badge de l'utilisateur
  const getNextBadge = (currentBadge: string) => {
    if (currentBadge === "Bronze") return "Silver";
    if (currentBadge === "Silver") return "Gold";
    return "Gold"; // Déjà au niveau maximum
  };

  // Calcule les points nécessaires pour le prochain badge
  const getPointsToNextBadge = (points: number) => {
    if (points >= 1000) return 0; // Déjà au niveau maximum
    if (points >= 500) return 1000 - points; // Pour atteindre Gold
    return 500 - points; // Pour atteindre Silver
  };

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case "Gold":
        return "text-yellow-400";
      case "Silver":
        return "text-gray-300";
      case "Bronze":
        return "text-amber-600";
      default:
        return "text-gray-400";
    }
  };

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case "Gold":
        return <Trophy className={`${getBadgeColor(badge)}`} />;
      case "Silver":
        return <Medal className={`${getBadgeColor(badge)}`} />;
      case "Bronze":
        return <Award className={`${getBadgeColor(badge)}`} />;
      default:
        return <Award className="text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-white">
      <main className="flex-1 flex flex-col items-center justify-center">
        <section className="pt-16 pb-16 px-2 sm:px-4 flex-1 w-full">
          <div className="mx-auto w-full max-w-[830px]">
            <div className="text-left mb-6">
              <h1 className="text-3xl font-bold text-[#E1E1F5] font-poppins">
                Ranking
              </h1>
            </div>

            {/* Tabs */}
            <div className="flex justify-center mb-8">
              <div className="bg-card rounded-lg p-1 flex">
                <button
                  className={`px-4 py-2 rounded-md transition-colors ${
                    activeTab === "top10"
                      ? "bg-[#5D5FEF] text-white font-bold"
                      : "text-gray-400 hover:text-white"
                  }`}
                  onClick={() => setActiveTab("top10")}
                >
                  Top 10
                </button>
                <button
                  className={`px-4 py-2 rounded-md transition-colors ${
                    activeTab === "rewards"
                      ? "bg-[#5D5FEF] text-white font-bold"
                      : "text-gray-400 hover:text-white"
                  }`}
                  onClick={() => setActiveTab("rewards")}
                >
                  Rewards
                </button>
              </div>
            </div>

            {/* Top 10 Tab */}
            {activeTab === "top10" && (
              <div className="animate-appear">
                {/* User Progress Card */}
                <Card className="relative mb-8 bg-[#0F0F2A] border-[#FFFFFF] bg-opacity-70 border-opacity-10 shadow-md rounded-lg overflow-hidden">
                  {/* Grain texture overlay */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 z-5 opacity-[.05]"
                    style={{
                      backgroundImage: "url('/grainbg.avif')",
                      backgroundRepeat: "repeat",
                    }}
                  />
                  {/* Masque pour utilisateur non connecté */}
                  {!isUserConnected && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30 flex flex-col items-center justify-center rounded-lg p-4">
                      <AlertTriangle
                        size={32}
                        className="text-yellow-500 mb-2"
                      />
                      <h3 className="text-lg font-medium text-white mb-1 text-center font-poppins">
                        Authentication Required
                      </h3>
                      <p className="text-sm text-gray-300 text-center mb-4 font-poppins">
                        Connect your wallet to view your ranking and earn
                        points.
                      </p>
                      <Button
                        className="bg-[#5D5FEF] hover:bg-[#4A4CDF] text-white"
                        onClick={() => login()}
                      >
                        <Wallet size={16} className="mr-2" />
                        Connect Wallet
                      </Button>
                    </div>
                  )}

                  {/* Masque pour utilisateur sans Steam */}
                  {isUserConnected && !hasSteamLinked && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30 flex flex-col items-center justify-center rounded-lg p-4">
                      <AlertTriangle
                        size={32}
                        className="text-yellow-500 mb-2"
                      />
                      <h3 className="text-lg font-medium text-white mb-1 text-center font-poppins">
                        Steam Account Required
                      </h3>
                      <p className="text-sm text-gray-300 text-center mb-4 font-poppins">
                        Connect your Steam account to participate in the ranking
                        system.
                      </p>
                      <div className="scale-110">
                        <SteamAuthButton />
                      </div>
                    </div>
                  )}

                  {/* Card content wrapper */}
                  <div className="relative z-20">
                    <CardHeader className="bg-muted py-4">
                      <CardTitle className="text-lg flex items-center justify-between">
                        <span className="font-poppins">Your Ranking</span>
                        {isUserConnected && hasSteamLinked && currentUser && (
                          <span className="text-[#5D5FEF] font-bold font-poppins">
                            #{currentUser.rank || 1}
                          </span>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                    {isUserConnected && hasSteamLinked && currentUser && (
                      <>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 rounded-full bg-muted overflow-hidden flex-shrink-0">
                            <img
                              src={
                                currentUser.steamAvatar ||
                                profile?.avatar ||
                                "/avatars/logo-black.svg"
                              }
                              alt={
                                currentUser.steamUser ||
                                profile?.username ||
                                "User"
                              }
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="font-bold font-poppins">
                              {currentUser.steamUser || "Steam User"}
                            </h3>
                            <div className="flex items-center gap-1">
                              {getBadgeIcon(getUserBadge(currentUser.points))}
                              <span
                                className={`text-sm ${getBadgeColor(getUserBadge(currentUser.points))}`}
                              >
                                {getUserBadge(currentUser.points)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-auto text-right">
                            <div className="text-2xl font-bold text-[#5D5FEF] font-poppins">
                              {currentUser.points}
                            </div>
                            <div className="text-sm text-gray-400 font-poppins">points</div>
                          </div>
                        </div>

                        {/* Progress bar */}
                        {getPointsToNextBadge(currentUser.points) > 0 && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400 font-poppins">
                                Progress to{" "}
                                {getNextBadge(getUserBadge(currentUser.points))}
                              </span>
                              <span className="text-[#5D5FEF] font-poppins">
                                {currentUser.points}/
                                {currentUser.points +
                                  getPointsToNextBadge(currentUser.points)}
                              </span>
                            </div>
                            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="absolute top-0 left-0 h-full bg-[#5D5FEF]"
                                style={{
                                  width: `${(currentUser.points / (currentUser.points + getPointsToNextBadge(currentUser.points))) * 100}%`,
                                }}
                              ></div>
                            </div>
                            <p className="text-sm text-center font-poppins">
                              You need{" "}
                              <span className="text-[#5D5FEF] font-bold font-poppins">
                                {getPointsToNextBadge(currentUser.points)} pts
                              </span>{" "}
                              to reach the{" "}
                              {getNextBadge(getUserBadge(currentUser.points))}{" "}
                              League
                            </p>
                          </div>
                        )}

                        {/* Max level message */}
                        {getPointsToNextBadge(currentUser.points) === 0 && (
                          <div className="p-3 bg-[#5D5FEF]/10 border border-[#5D5FEF]/30 rounded-lg text-center">
                            <p className="text-sm font-poppins">
                              Congratulations! You've reached the highest league
                              level.
                            </p>
                          </div>
                        )}
                      </>
                    )}
                    </CardContent>
                  </div>
                </Card>

                {/* Leaderboard Table */}
                <Card className="relative bg-[#0F0F2A] border-[#FFFFFF] bg-opacity-70 border-opacity-10 shadow-md rounded-lg overflow-hidden">
                  {/* Grain texture overlay */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 z-5 opacity-[.05]"
                    style={{
                      backgroundImage: "url('/grainbg.avif')",
                      backgroundRepeat: "repeat",
                    }}
                  />
                  {/* Card content wrapper */}
                  <div className="relative z-20">
                    <CardHeader className="py-4 px-6">
                      <CardTitle className="font-poppins">Top 10 Champions</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-muted text-left">
                          <tr>
                            <th className="py-3 px-6 font-poppins">Rank</th>
                            <th className="py-3 px-6 font-poppins">Player</th>
                            <th className="py-3 px-6 font-poppins">Badge</th>
                            <th className="py-3 px-6 text-right font-poppins">Points</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-muted">
                          {/* Afficher les données de l'API si disponibles, sinon utiliser les données mockées */}
                          {(apiData?.leaderboard || LEADERBOARD)
                            .filter(player => player.steamId) // Filtrer uniquement les utilisateurs avec Steam
                            .map((player, index) => {
                              // Déterminer le badge en fonction des points pour les données de l'API
                              const badge =
                                "badge" in player
                                  ? player.badge
                                  : getUserBadge(player.points);
                              // Utiliser prioritairement steamUser depuis la DB
                              const username = player.steamUser || `Steam User ${index + 1}`;
                              // Déterminer l'avatar
                              const avatar =
                                "avatar" in player
                                  ? player.avatar
                                  : player.steamAvatar ||
                                    "/avatars/logo-black.svg";

                              return (
                                <tr
                                  key={player.id}
                                  className="hover:bg-muted/50 transition-colors"
                                >
                                  <td className="py-4 px-6 font-bold font-poppins">
                                    {index === 0 ? (
                                      <span className="text-yellow-400">1</span>
                                    ) : index === 1 ? (
                                      <span className="text-gray-300">2</span>
                                    ) : index === 2 ? (
                                      <span className="text-amber-600">3</span>
                                    ) : (
                                      index + 1
                                    )}
                                  </td>
                                  <td className="py-4 px-6">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-muted overflow-hidden">
                                        <img
                                          src={avatar as string}
                                          alt={username}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                      <span className="font-poppins">{username}</span>
                                    </div>
                                  </td>
                                  <td className="py-4 px-6">
                                    <div className="flex items-center gap-1">
                                      {getBadgeIcon(badge)}
                                      <span
                                        className={`${getBadgeColor(badge)}`}
                                      >
                                        {badge}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="py-4 px-6 text-right font-bold font-poppins">
                                    {player.points}
                                  </td>
                                </tr>
                              );
                            },
                          )}

                          {/* Message si aucune donnée n'est disponible */}
                          {(apiData?.leaderboard?.filter(p => p.steamId)?.length === 0 || 
                            (!apiData?.leaderboard && LEADERBOARD.filter(p => p.steamId).length === 0)) && (
                              <tr>
                                <td
                                  colSpan={4}
                                  className="py-8 text-center text-gray-400 font-poppins"
                                >
                                  No Steam-connected users in ranking yet
                                </td>
                              </tr>
                            )}
                        </tbody>
                      </table>
                    </div>
                    </CardContent>
                  </div>
                </Card>
              </div>
            )}

            {/* Rewards Tab */}
            {activeTab === "rewards" && (
              <div className="animate-appear">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Bronze Tier */}
                  <Card className="relative border-amber-600/30 bg-[#0F0F2A] bg-opacity-70 border-opacity-10 shadow-md rounded-lg overflow-hidden hover:border-amber-600 transition-colors">
                    {/* Grain texture overlay */}
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 z-5 opacity-[.05]"
                      style={{
                        backgroundImage: "url('/grainbg.avif')",
                        backgroundRepeat: "repeat",
                      }}
                    />
                    {/* Card content wrapper */}
                    <div className="relative z-20">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex flex-col items-center gap-2 text-center">
                          <Award className="text-amber-600" />
                          <span className="font-poppins">Bronze League</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                      <div className="space-y-4">
                        <div className="text-center py-2">
                          <span className="text-2xl font-bold font-poppins">0 - 500</span>
                          <p className="text-sm text-gray-400 font-poppins">points</p>
                        </div>

                        {/* Center the block, but left-align the lines */}
                        <div className="flex flex-col items-center">
                          <div className="flex flex-col w-max text-left space-y-2">
                            <div className="flex items-center gap-2">
                              <ChevronUp className="text-[#5D5FEF]" />
                              <span className="font-poppins">Access to standard loans</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <ChevronUp className="text-[#5D5FEF]" />
                              <span className="font-poppins">Standard interest rates</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <ChevronUp className="text-[#5D5FEF]" />
                              <span className="font-poppins">Exclusive badges</span>
                            </div>
                          </div>
                        </div>

                        {apiData?.user &&
                          getUserBadge(apiData.user.points) === "Bronze" && (
                            <div className="py-2 px-3 bg-amber-600/20 rounded-md text-center text-sm font-poppins">
                              Your current level
                            </div>
                          )}
                      </div>
                      </CardContent>
                    </div>
                  </Card>

                  {/* Silver Tier */}
                  <Card className="relative border-gray-300/30 bg-[#0F0F2A] bg-opacity-70 border-opacity-10 shadow-md rounded-lg overflow-hidden hover:border-gray-300 transition-colors">
                    {/* Grain texture overlay */}
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 z-5 opacity-[.05]"
                      style={{
                        backgroundImage: "url('/grainbg.avif')",
                        backgroundRepeat: "repeat",
                      }}
                    />
                    {/* Card content wrapper */}
                    <div className="relative z-20">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex flex-col items-center gap-2 text-center">
                          <Medal className="text-gray-300" />
                          <span className="font-poppins">Silver League</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                      <div className="space-y-4">
                        <div className="text-center py-2">
                          <span className="text-2xl font-bold font-poppins">500 - 1000</span>
                          <p className="text-sm text-gray-400 font-poppins">points</p>
                        </div>

                        {/* Center the block, but left-align the lines */}
                        <div className="flex flex-col items-center">
                          <div className="flex flex-col w-max text-left space-y-2">
                            <div className="flex items-center gap-2">
                              <ChevronUp className="text-[#5D5FEF]" />
                              <span className="font-poppins">5% discount on interest rates</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <ChevronUp className="text-[#5D5FEF]" />
                              <span className="font-poppins">Access to premium loans</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <ChevronUp className="text-[#5D5FEF]" />
                              <span className="font-poppins">1% cashback on repayments</span>
                            </div>
                          </div>
                        </div>

                        {apiData?.user &&
                          getUserBadge(apiData.user.points) === "Silver" && (
                            <div className="py-2 px-3 bg-gray-300/20 rounded-md text-center text-sm font-poppins">
                              Your current level
                            </div>
                          )}
                      </div>
                      </CardContent>
                    </div>
                  </Card>

                  {/* Gold Tier */}
                  <Card className="relative border-yellow-400/30 bg-[#0F0F2A] bg-opacity-70 border-opacity-10 shadow-md rounded-lg overflow-hidden hover:border-yellow-400 transition-colors">
                    {/* Grain texture overlay */}
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 z-5 opacity-[.05]"
                      style={{
                        backgroundImage: "url('/grainbg.avif')",
                        backgroundRepeat: "repeat",
                      }}
                    />
                    {/* Card content wrapper */}
                    <div className="relative z-20">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex flex-col items-center gap-2 text-center">
                          <Trophy className="text-yellow-400" />
                          <span className="font-poppins">Gold League</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                      <div className="space-y-4">
                        <div className="text-center py-2">
                          <span className="text-2xl font-bold font-poppins">1000+</span>
                          <p className="text-sm text-gray-400 font-poppins">points</p>
                        </div>

                        {/* Center the block, but left-align the lines */}
                        <div className="flex flex-col items-center">
                          <div className="flex flex-col w-max text-left space-y-2">
                            <div className="flex items-center gap-2">
                              <ChevronUp className="text-[#5D5FEF]" />
                              <span className="font-poppins">Free skin every month</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <ChevronUp className="text-[#5D5FEF]" />
                              <span className="font-poppins">10% discount on interest rates</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <ChevronUp className="text-[#5D5FEF]" />
                              <span className="font-poppins">Access to exclusive events</span>
                            </div>
                          </div>
                        </div>

                        {apiData?.user &&
                          getUserBadge(apiData.user.points) === "Gold" && (
                            <div className="py-2 px-3 bg-yellow-400/20 rounded-md text-center text-sm font-poppins">
                              Your current level
                            </div>
                          )}
                      </div>
                      </CardContent>
                    </div>
                  </Card>
                </div>

                <div className="mt-8 text-center">
                  <Button className="bg-[#5D5FEF] hover:bg-[#4A4CDF] text-white font-bold font-poppins">
                    <Trophy className="mr-2" />
                    Borrow to earn points
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
