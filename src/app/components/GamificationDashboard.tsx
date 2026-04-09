import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Trophy, Award, Shield, Star, Zap, Target, Medal, Crown } from 'lucide-react';
import { getGamificationUserStats, getGamificationRankings } from '../lib/apiLocal';
import { useTranslation } from 'react-i18next';

interface UserBadges {
  userId: string;
  badges: Array<{
    badgeId: string;
    awardedAt: string;
    reason: string;
  }>;
  points: number;
  level: number;
}

interface Ranking {
  name: string;
  score: number;
  avoided: number;
  failed: number;
}

const getBadgeInfo = (t: any): Record<string, { name: string; icon: any; color: string; description: string }> => ({
  'first-campaign': {
    name: t('gamification.badges.firstCampaign.name'),
    icon: Zap,
    color: 'text-blue-600',
    description: t('gamification.badges.firstCampaign.desc'),
  },
  'perfect-month': {
    name: t('gamification.badges.perfectMonth.name'),
    icon: Shield,
    color: 'text-green-600',
    description: t('gamification.badges.perfectMonth.desc'),
  },
  'eagle-eye': {
    name: t('gamification.badges.eagleEye.name'),
    icon: Target,
    color: 'text-yellow-600',
    description: t('gamification.badges.eagleEye.desc'),
  },
  'master-trainer': {
    name: t('gamification.badges.masterTrainer.name'),
    icon: Award,
    color: 'text-purple-600',
    description: t('gamification.badges.masterTrainer.desc'),
  },
  'champion': {
    name: t('gamification.badges.champion.name'),
    icon: Crown,
    color: 'text-orange-600',
    description: t('gamification.badges.champion.desc'),
  },
});

export function GamificationDashboard() {
  const { t } = useTranslation();
  const badgesData = getBadgeInfo(t);
  const [userBadges, setUserBadges] = useState<UserBadges | null>(null);
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGamificationData();
  }, []);

  const fetchGamificationData = async () => {
    setLoading(true);
    try {
      const [badgesResult, rankingsResult] = await Promise.allSettled([
        getGamificationUserStats(),
        getGamificationRankings('department'),
      ]);

      if (badgesResult.status === 'fulfilled') {
        setUserBadges(badgesResult.value);
      }
      if (rankingsResult.status === 'fulfilled') {
        setRankings(rankingsResult.value.rankings || []);
      }
    } catch (error) {
      console.error('Error fetching gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNextLevelPoints = (currentLevel: number) => {
    return currentLevel * 500;
  };

  const getCurrentLevelProgress = (points: number, level: number) => {
    const currentLevelPoints = (level - 1) * 500;
    const nextLevelPoints = level * 500;
    const progress = ((points - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t('gamification.title')}</h2>
        <p className="text-muted-foreground">
          {t('gamification.subtitle')}
        </p>
      </div>

      {/* User Stats */}
      {userBadges && (
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{t('gamification.stats.level', { level: userBadges.level })}</CardTitle>
                  <CardDescription>
                    {t('gamification.stats.points', { current: userBadges.points, next: (getNextLevelPoints(userBadges.level) - userBadges.points) })}
                  </CardDescription>
                </div>
                <div className="p-4 bg-primary/10 rounded-full">
                  <Trophy className="h-8 w-8 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Progress
                value={getCurrentLevelProgress(userBadges.points, userBadges.level)}
                className="h-3"
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-2">
                <span>{t('gamification.stats.level', { level: userBadges.level })}</span>
                <span>{t('gamification.stats.level', { level: userBadges.level + 1 })}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('gamification.achievements.title')}</CardTitle>
              <CardDescription>{t('gamification.achievements.desc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="text-5xl font-bold text-primary">
                    {userBadges.badges.length}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {t('gamification.achievements.unlocked', { total: Object.keys(badgesData).length })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Badges */}
      <Card>
        <CardHeader>
          <CardTitle>{t('gamification.badges.title')}</CardTitle>
          <CardDescription>
            {t('gamification.badges.desc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(badgesData).map(([badgeId, badgeInfo]) => {
              const earned = userBadges?.badges.find(b => b.badgeId === badgeId);
              const Icon = badgeInfo.icon;

              return (
                <div
                  key={badgeId}
                  className={`p-4 rounded-lg border transition-all ${
                    earned
                      ? 'bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 shadow-sm'
                      : 'bg-muted/30 border-muted opacity-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-3 rounded-full ${
                      earned ? 'bg-primary/10' : 'bg-muted'
                    }`}>
                      <Icon className={`h-6 w-6 ${earned ? badgeInfo.color : 'text-muted-foreground'}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{badgeInfo.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {badgeInfo.description}
                      </p>
                      {earned && (
                        <p className="text-xs text-primary mt-2">
                          {t('gamification.badges.earnedOn', { date: new Date(earned.awardedAt).toLocaleDateString('pt-BR') })}
                        </p>
                      )}
                      {!earned && (
                        <Badge variant="secondary" className="mt-2">{t('gamification.badges.locked')}</Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Rankings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Medal className="h-5 w-5 text-yellow-600" />
            {t('gamification.rankings.title')}
          </CardTitle>
          <CardDescription>
            {t('gamification.rankings.desc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rankings.slice(0, 10).map((rank, index) => {
              const medals = ['🥇', '🥈', '🥉'];
              const medal = index < 3 ? medals[index] : `${index + 1}º`;
              const isTop3 = index < 3;

              return (
                <div
                  key={rank.name}
                  className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                    isTop3
                      ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-200 dark:border-yellow-900'
                      : 'bg-muted/30 border-muted'
                  }`}
                >
                  <div className={`text-3xl font-bold w-12 text-center ${
                    isTop3 ? 'animate-pulse' : ''
                  }`}>
                    {medal}
                  </div>

                  <div className="flex-1">
                    <h4 className="font-semibold">{rank.name}</h4>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Shield className="h-4 w-4 text-green-600" />
                        {t('gamification.rankings.avoided', { count: rank.avoided })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="h-4 w-4 text-red-600" />
                        {t('gamification.rankings.failed', { count: rank.failed })}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {rank.score}
                    </div>
                    <div className="text-xs text-muted-foreground">{t('gamification.rankings.points')}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {rankings.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t('gamification.rankings.empty')}</p>
              <p className="text-sm mt-2">{t('gamification.rankings.emptyHint')}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Challenge Cards */}
      <Card>
        <CardHeader>
          <CardTitle>{t('gamification.challenges.title')}</CardTitle>
          <CardDescription>
            {t('gamification.challenges.desc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg border bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-900">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Star className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">{t('gamification.challenges.createCampaign.title')}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t('gamification.challenges.reward', { points: 150 })}
                  </p>
                  <Progress value={33} className="mt-3" />
                  <p className="text-xs text-muted-foreground mt-1">{t('gamification.challenges.progress', { current: 1, total: 3 })}</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg border bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-900">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-600 rounded-lg">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">{t('gamification.challenges.avoidPhishing.title')}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t('gamification.challenges.reward', { points: 200 })}
                  </p>
                  <Progress value={70} className="mt-3" />
                  <p className="text-xs text-muted-foreground mt-1">{t('gamification.challenges.progress', { current: 7, total: 10 })}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
