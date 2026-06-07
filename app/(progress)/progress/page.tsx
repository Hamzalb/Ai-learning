'use client';
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, Legend } from 'recharts';
import { TrendingUp, Zap, Flame, Target, Brain, MessageSquare } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { userAPI } from '@/services/api';
import { ProgressSubject, WeeklyActivity } from '@/types';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#f97316', '#84cc16'];

export default function ProgressPage() {
  const [data, setData] = useState<{ subjects: ProgressSubject[]; weekly: WeeklyActivity[]; totalXP: number; level: number; streak: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userAPI.getProgress()
      .then(r => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-4 md:p-8 space-y-6">
          <div className="h-8 w-48 bg-secondary rounded-xl animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <div key={i} className="glass-card h-28 animate-pulse" />)}
          </div>
          <div className="glass-card h-64 animate-pulse" />
        </div>
      </DashboardLayout>
    );
  }

  const xpForLevel = (data?.level || 1) * 100;
  const xpProgress = Math.min(100, ((data?.totalXP || 0) % xpForLevel) / xpForLevel * 100);

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">تقدمك الدراسي</h1>
          <p className="text-muted-foreground text-sm mt-1">تتبع أدائك ونشاطك الأسبوعي</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { icon: Zap, label: 'نقاط XP', value: data?.totalXP || 0, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
            { icon: Target, label: 'المستوى', value: `Level ${data?.level || 1}`, color: 'text-blue-400', bg: 'bg-blue-400/10' },
            { icon: Flame, label: 'الـ Streak', value: `${data?.streak || 0} يوم`, color: 'text-orange-400', bg: 'bg-orange-400/10' }
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <Card key={label}>
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">{label}</p>
                  <p className="text-xl font-bold text-foreground">{value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* XP Progress bar */}
        <Card>
          <CardContent className="p-5">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">التقدم نحو المستوى التالي</span>
              <span className="text-foreground font-medium">{Math.round(xpProgress)}%</span>
            </div>
            <div className="h-3 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-700" style={{ width: `${xpProgress}%` }} />
            </div>
          </CardContent>
        </Card>

        {/* Weekly Activity Chart */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" /> النشاط الأسبوعي</CardTitle></CardHeader>
          <CardContent>
            {data?.weekly && data.weekly.some(d => d.total > 0) ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.weekly} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12 }} />
                  <Bar dataKey="quizzes" name="اختبارات" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="chats" name="محادثات" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                لا يوجد نشاط بعد — ابدأ بمحادثة أو اختبار!
              </div>
            )}
          </CardContent>
        </Card>

        {/* Per Subject */}
        {data?.subjects && data.subjects.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Brain className="w-5 h-5 text-primary" /> الأداء حسب المادة</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {data.subjects.map((s, i) => (
                <div key={s.subject} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground font-medium">{s.subject}</span>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <span className="flex items-center gap-1"><Brain className="w-3 h-3" />{s.quizCount}</span>
                      <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{s.chatCount}</span>
                      {s.quizCount > 0 && <span className="text-primary font-semibold">{s.averageScore}%</span>}
                    </div>
                  </div>
                  {s.quizCount > 0 && (
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${s.averageScore}%`, background: COLORS[i % COLORS.length] }} />
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
