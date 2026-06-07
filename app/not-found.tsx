import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6" dir="rtl">
      <div className="text-center space-y-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto">
          <BookOpen className="w-10 h-10 text-white" />
        </div>
        <div>
          <h1 className="text-6xl font-black text-foreground">404</h1>
          <p className="text-xl font-semibold text-foreground mt-2">الصفحة غير موجودة</p>
          <p className="text-muted-foreground mt-1">الصفحة التي تبحث عنها غير موجودة أو تم نقلها.</p>
        </div>
        <Link href="/">
          <Button size="lg">العودة للرئيسية</Button>
        </Link>
      </div>
    </div>
  );
}
