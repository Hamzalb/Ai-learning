'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Brain, MessageSquare, TrendingUp, GraduationCap, Globe, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { teacherAPI } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

interface Student {
  _id: string;
  name: string;
  email: string;
  xp: number;
  streak: number;
  quizCount: number;
  chatCount: number;
  createdAt: string;
}

interface TeacherDashboard {
  studentCount: number;
  quizCount: number;
  totalChats: number;
  topStudents: Student[];
}

interface Quiz {
  _id: string;
  title: string;
  subject: string;
  difficulty: string;
  questionCount: number;
  isPublic: boolean;
  createdAt: string;
}

export default function TeacherPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [dashboard, setDashboard] = useState<TeacherDashboard | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'overview' | 'students' | 'quizzes'>('overview');
  const [publishing, setPublishing] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.role !== 'teacher' && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    if (!user || (user.role !== 'teacher' && user.role !== 'admin')) return;
    Promise.all([
      teacherAPI.getDashboard(),
      teacherAPI.getStudents(),
      teacherAPI.getQuizzes()
    ]).then(([dash, studs, quiz]) => {
      setDashboard(dash.data.data);
      setStudents(studs.data.data.students || []);
      setQuizzes(quiz.data.data.quizzes || []);
    }).catch(() => toast.error('فشل تحميل بيانات الأستاذ'))
      .finally(() => setLoading(false));
  }, [user]);

  const handlePublish = async (quizId: string) => {
    setPublishing(quizId);
    try {
      await teacherAPI.publishQuiz(quizId);
      setQuizzes(prev => prev.map(q => q._id === quizId ? { ...q, isPublic: true } : q));
      toast.success('تم نشر الاختبار');
    } catch {
      toast.error('فشل نشر الاختبار');
    } finally {
      setPublishing(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-4 md:p-8 space-y-6">
          <div className="h-8 w-56 bg-secondary rounded-xl animate-pulse" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <div key={i} className="glass-card h-28 animate-pulse" />)}
          </div>
          <div className="glass-card h-64 animate-pulse" />
        </div>
      </DashboardLayout>
    );
  }

  if (!user || (user.role !== 'teacher' && user.role !== 'admin')) return null;

  const stats = [
    { icon: Users, label: 'الطلاب', value: dashboard?.studentCount || 0, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { icon: Brain, label: 'الاختبارات', value: dashboard?.quizCount || 0, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { icon: MessageSquare, label: 'المحادثات', value: dashboard?.totalChats || 0, color: 'text-green-400', bg: 'bg-green-400/10' },
  ];

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-primary" /> لوحة الأستاذ
          </h1>
          <p className="text-muted-foreground text-sm mt-1">إدارة الطلاب والاختبارات</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {stats.map(({ icon: Icon, label, value, color, bg }) => (
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

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border">
          {(['overview', 'students', 'quizzes'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-all -mb-px ${
                tab === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {{ overview: 'نظرة عامة', students: 'الطلاب', quizzes: 'الاختبارات' }[t]}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === 'overview' && dashboard?.topStudents && (
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" /> أفضل الطلاب</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboard.topStudents.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-6">لا يوجد طلاب بعد</p>
                ) : dashboard.topStudents.map((s, i) => (
                  <div key={s._id} className="flex items-center gap-4 p-3 rounded-xl bg-secondary/50">
                    <span className={`text-lg font-bold w-6 text-center ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-orange-500' : 'text-muted-foreground'}`}>
                      {i + 1}
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {s.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-primary">{s.xp} XP</p>
                      <p className="text-xs text-muted-foreground">{s.streak} يوم</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Students Tab */}
        {tab === 'students' && (
          <Card>
            <CardHeader><CardTitle>قائمة الطلاب ({students.length})</CardTitle></CardHeader>
            <CardContent>
              {students.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">لا يوجد طلاب مسجلون بعد</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-muted-foreground text-xs border-b border-border">
                        <th className="text-right pb-3 font-medium">الاسم</th>
                        <th className="text-right pb-3 font-medium">XP</th>
                        <th className="text-right pb-3 font-medium">Streak</th>
                        <th className="text-right pb-3 font-medium">اختبارات</th>
                        <th className="text-right pb-3 font-medium">محادثات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {students.map(s => (
                        <motion.tr key={s._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-secondary/30 transition-colors">
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {s.name?.charAt(0)?.toUpperCase() || 'U'}
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{s.name}</p>
                                <p className="text-xs text-muted-foreground">{s.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 text-primary font-semibold">{s.xp}</td>
                          <td className="py-3 text-orange-400">{s.streak}d</td>
                          <td className="py-3 text-muted-foreground">{s.quizCount || 0}</td>
                          <td className="py-3 text-muted-foreground">{s.chatCount || 0}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Quizzes Tab */}
        {tab === 'quizzes' && (
          <Card>
            <CardHeader><CardTitle>جميع الاختبارات ({quizzes.length})</CardTitle></CardHeader>
            <CardContent>
              {quizzes.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">لا توجد اختبارات بعد</p>
              ) : (
                <div className="space-y-3">
                  {quizzes.map(q => (
                    <div key={q._id} className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/30 transition-all">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{q.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{q.subject} • {q.difficulty} • {q.questionCount} أسئلة</p>
                      </div>
                      {q.isPublic ? (
                        <div className="flex items-center gap-1.5 text-green-400 text-xs font-medium">
                          <Globe className="w-3.5 h-3.5" />
                          منشور
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePublish(q._id)}
                          isLoading={publishing === q._id}
                          className="text-xs"
                        >
                          <Globe className="w-3.5 h-3.5 ml-1" />
                          نشر
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
