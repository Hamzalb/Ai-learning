'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Brain, FileText, BookOpen, Zap, ArrowLeft,
  Star, Users, Globe, CheckCircle, MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

const features = [
  {
    icon: MessageSquare,
    title: 'مساعد ذكي بالعربية',
    desc: 'اسأل أي سؤال واحصل على شرح مفصل باللغة العربية أو اللهجة اللبنانية',
    color: 'from-blue-500 to-blue-700'
  },
  {
    icon: FileText,
    title: 'رفع الملفات وتحليلها',
    desc: 'ارفع كتبك ومذكراتك وسيقرأها الذكاء الاصطناعي ويشرحها لك',
    color: 'from-purple-500 to-purple-700'
  },
  {
    icon: Brain,
    title: 'اختبارات تلقائية',
    desc: 'ينشئ الذكاء الاصطناعي اختبارات من دروسك بشكل تلقائي',
    color: 'from-green-500 to-green-700'
  },
  {
    icon: Globe,
    title: 'شرح بالعامية اللبنانية',
    desc: 'اشرح لي بالعامية! الذكاء الاصطناعي يشرح بطريقتك أنت',
    color: 'from-orange-500 to-orange-700'
  }
];

const stats = [
  { value: '10,000+', label: 'طالب لبناني' },
  { value: '50,000+', label: 'اختبار منجز' },
  { value: '100,000+', label: 'سؤال تم الإجابة عليه' },
  { value: '4.9/5', label: 'تقييم الطلاب' }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-hidden" dir="rtl">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-foreground">منصة التعلم الذكية</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">تسجيل الدخول</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">ابدأ مجاناً</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
          <div className="absolute top-40 left-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              <span>مدعوم بالذكاء الاصطناعي GPT-4</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              ادرس أذكى مش{' '}
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                أكتر
              </span>
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              منصة التعلم الذكية المصممة للطالب اللبناني. اسأل بالعربية أو العامية، ارفع ملفاتك، واحصل على اختبارات وملخصات بثوانٍ.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="gap-2 text-base">
                  ابدأ التعلم مجاناً
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="text-base">
                  عندي حساب
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-border/50">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl font-bold gradient-text">{stat.value}</div>
              <div className="text-muted-foreground text-sm mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              كل شي بحتاجه الطالب اللبناني
            </h2>
            <p className="text-muted-foreground text-lg">
              من الشرح إلى الاختبار، كل خطوة في تعلمك مدعومة بالذكاء الاصطناعي
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="glass-card p-6 hover:border-primary/30 transition-colors group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card p-12 border-primary/20"
          >
            <div className="flex justify-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">
              انضم لآلاف الطلاب اللبنانيين
            </h2>
            <p className="text-muted-foreground mb-8 text-lg">
              ابدأ رحلتك التعليمية اليوم. مجاناً، بالعربية، وبالذكاء الاصطناعي.
            </p>
            <Link href="/register">
              <Button size="lg" className="text-base gap-2">
                <CheckCircle className="w-5 h-5" />
                إنشاء حساب مجاناً
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <span className="text-muted-foreground text-sm">منصة التعلم الذكية اللبنانية © 2025</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground text-sm">صنع بـ ❤️ للطالب اللبناني</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
