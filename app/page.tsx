'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Brain, FileText, BookOpen, Zap, ArrowLeft,
  Star, Users, Globe, CheckCircle, MessageSquare,
  Sparkles, GraduationCap, BarChart3, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

const features = [
  {
    icon: MessageSquare,
    title: 'مساعد ذكي بالعربية',
    desc: 'اسأل أي سؤال واحصل على شرح مفصل باللغة العربية أو اللهجة اللبنانية',
    gradient: 'from-blue-500 to-cyan-400',
    glow: 'group-hover:shadow-blue-500/20'
  },
  {
    icon: FileText,
    title: 'رفع الملفات وتحليلها',
    desc: 'ارفع كتبك ومذكراتك وسيقرأها الذكاء الاصطناعي ويشرحها لك',
    gradient: 'from-violet-500 to-purple-400',
    glow: 'group-hover:shadow-violet-500/20'
  },
  {
    icon: Brain,
    title: 'اختبارات تلقائية',
    desc: 'ينشئ الذكاء الاصطناعي اختبارات من دروسك بشكل تلقائي',
    gradient: 'from-emerald-500 to-green-400',
    glow: 'group-hover:shadow-emerald-500/20'
  },
  {
    icon: Globe,
    title: 'شرح بالعامية اللبنانية',
    desc: 'اشرح لي بالعامية! الذكاء الاصطناعي يشرح بطريقتك أنت',
    gradient: 'from-amber-500 to-orange-400',
    glow: 'group-hover:shadow-amber-500/20'
  }
];

const stats = [
  { value: '10,000+', label: 'طالب لبناني', icon: Users },
  { value: '50,000+', label: 'اختبار منجز', icon: BarChart3 },
  { value: '100,000+', label: 'سؤال تم الإجابة عليه', icon: MessageSquare },
  { value: '4.9/5', label: 'تقييم الطلاب', icon: Star }
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } }
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-hidden" dir="rtl">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-background/60 backdrop-blur-xl border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/30 transition-shadow">
              <BookOpen className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-bold text-foreground text-lg">LearnAI</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">تسجيل الدخول</Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="shadow-lg shadow-primary/20">ابدأ مجاناً</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-36 pb-24 px-6 relative">
        <div className="absolute inset-0 mesh-gradient" />
        <div className="absolute top-32 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/[0.03] rounded-full blur-[120px]" />

        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 20 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] text-sm font-medium mb-8 backdrop-blur-sm"
            >
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-violet-500">
                <Sparkles className="w-3 h-3 text-white" />
              </span>
              <span className="text-foreground/80">مدعوم بالذكاء الاصطناعي GPT-4</span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-foreground mb-6 leading-[1.1] tracking-tight">
              ادرس أذكى مش{' '}
              <span className="gradient-text">أكتر</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              منصة التعلم الذكية المصممة للطالب اللبناني. اسأل بالعربية أو العامية، ارفع ملفاتك، واحصل على اختبارات وملخصات بثوانٍ.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button size="lg" className="gap-2 text-base shadow-xl shadow-primary/25 px-8">
                    ابدأ التعلم مجاناً
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                </motion.div>
              </Link>
              <Link href="/login">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button variant="outline" size="lg" className="text-base px-8 border-white/[0.08] hover:bg-white/[0.04]">
                    عندي حساب
                  </Button>
                </motion.div>
              </Link>
            </div>
          </motion.div>

          {/* Floating decorative elements */}
          <motion.div
            className="absolute -top-8 right-10 w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/10 to-violet-500/10 border border-white/[0.04] backdrop-blur-sm hidden md:flex items-center justify-center"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <GraduationCap className="w-8 h-8 text-blue-400/60" />
          </motion.div>
          <motion.div
            className="absolute top-16 -left-4 w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-white/[0.04] backdrop-blur-sm hidden md:flex items-center justify-center"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          >
            <Brain className="w-7 h-7 text-purple-400/60" />
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 relative">
        <div className="absolute inset-0 bg-white/[0.01]" />
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              variants={item}
              className="glass-card p-5 text-center group hover:border-white/[0.08] transition-all duration-300"
            >
              <div className="flex justify-center mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div className="text-2xl md:text-3xl font-extrabold gradient-text">{stat.value}</div>
              <div className="text-muted-foreground text-sm mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 mesh-gradient opacity-50" />
        <div className="max-w-6xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-xs font-medium text-muted-foreground mb-4">
              <Zap className="w-3.5 h-3.5 text-primary" />
              المميزات
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-4 tracking-tight">
              كل شي بحتاجه الطالب اللبناني
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              من الشرح إلى الاختبار، كل خطوة في تعلمك مدعومة بالذكاء الاصطناعي
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-5"
          >
            {features.map((f, i) => (
              <motion.div
                key={i}
                variants={item}
                className={`group glass-card p-7 hover:border-white/[0.1] transition-all duration-300 ${f.glow} hover:shadow-2xl cursor-default`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 relative">
        <div className="max-w-3xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="glass-card p-14 overflow-hidden"
          >
            <div className="absolute inset-0 mesh-gradient opacity-60" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-primary/[0.06] rounded-full blur-[80px]" />

            <div className="relative">
              <div className="flex justify-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4 tracking-tight">
                انضم لآلاف الطلاب اللبنانيين
              </h2>
              <p className="text-muted-foreground mb-8 text-lg max-w-md mx-auto">
                ابدأ رحلتك التعليمية اليوم. مجاناً، بالعربية، وبالذكاء الاصطناعي.
              </p>
              <Link href="/register">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="inline-block">
                  <Button size="lg" className="text-base gap-2 shadow-xl shadow-primary/25 px-8">
                    <CheckCircle className="w-5 h-5" />
                    إنشاء حساب مجاناً
                  </Button>
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] py-8 px-6 bg-white/[0.01]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-muted-foreground text-sm">LearnAI &copy; 2025</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-muted-foreground/60" />
            <span className="text-muted-foreground/60 text-sm">صنع للطالب اللبناني</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
