/**
 * EduFlow i18n — English / Arabic translations
 * Usage:  const t = useT();   then  t('save')
 */
import { useLanguageStore } from '@/store/languageStore';

// ─── Translation map ───────────────────────────────────────────────────────────
const translations = {
  // ── Common actions ──────────────────────────────────────────────────────────
  save:           { en: 'Save',           ar: 'حفظ' },
  cancel:         { en: 'Cancel',         ar: 'إلغاء' },
  delete:         { en: 'Delete',         ar: 'حذف' },
  create:         { en: 'Create',         ar: 'إنشاء' },
  add:            { en: 'Add',            ar: 'إضافة' },
  edit:           { en: 'Edit',           ar: 'تعديل' },
  close:          { en: 'Close',          ar: 'إغلاق' },
  search:         { en: 'Search…',        ar: 'بحث…' },
  upload:         { en: 'Upload',         ar: 'رفع ملف' },
  download:       { en: 'Download',       ar: 'تحميل' },
  loading:        { en: 'Loading…',       ar: 'جارٍ التحميل…' },
  saving:         { en: 'Saving…',        ar: 'جارٍ الحفظ…' },
  creating:       { en: 'Creating…',      ar: 'جارٍ الإنشاء…' },
  uploading:      { en: 'Uploading…',     ar: 'جارٍ الرفع…' },
  assigning:      { en: 'Assigning…',     ar: 'جارٍ التعيين…' },
  signOut:        { en: 'Sign out',       ar: 'تسجيل الخروج' },
  viewAll:        { en: 'Mark all as read & close', ar: 'تحديد الكل كمقروء وإغلاق' },
  noData:         { en: 'No data yet',    ar: 'لا توجد بيانات' },
  confirm:        { en: 'Confirm',        ar: 'تأكيد' },
  assign:         { en: 'Assign',         ar: 'تعيين' },
  remove:         { en: 'Remove',         ar: 'إزالة' },
  manage:         { en: 'Manage',         ar: 'إدارة' },
  change:         { en: 'Change',         ar: 'تغيير' },
  optional:       { en: 'optional',       ar: 'اختياري' },
  new:            { en: 'New',            ar: 'جديد' },

  // ── Navigation labels ───────────────────────────────────────────────────────
  dashboard:      { en: 'Dashboard',      ar: 'لوحة التحكم' },
  classrooms:     { en: 'Classrooms',     ar: 'الفصول الدراسية' },
  subjects:       { en: 'Subjects',       ar: 'المواد' },
  schedules:      { en: 'Schedules',      ar: 'الجداول' },
  payslips:       { en: 'Payslips',       ar: 'كشوف الراتب' },
  myClasses:      { en: 'My Classes',     ar: 'فصولي' },
  grades:         { en: 'Grades',         ar: 'الدرجات' },
  documents:      { en: 'Documents',      ar: 'الوثائق' },
  quizzes:        { en: 'Quizzes',        ar: 'الاختبارات' },
  homework:       { en: 'Homework',       ar: 'الواجبات' },
  teachers:       { en: 'Teachers',       ar: 'المعلمون' },
  students:       { en: 'Students',       ar: 'الطلاب' },
  principals:     { en: 'Principals',     ar: 'المديرون' },
  settings:       { en: 'Settings',       ar: 'الإعدادات' },
  schools:        { en: 'Schools',        ar: 'المدارس' },
  permissions:    { en: 'Permissions',    ar: 'الصلاحيات' },
  auditLogs:      { en: 'Audit Logs',     ar: 'سجل التدقيق' },
  attendance:     { en: 'Attendance',     ar: 'الحضور' },
  calendar:       { en: 'Calendar',       ar: 'التقويم' },
  payments:       { en: 'Payments',       ar: 'المدفوعات' },
  aiTutor:        { en: 'AI Tutor',       ar: 'المعلم الذكي' },

  // ── Role names ──────────────────────────────────────────────────────────────
  roleSuperAdmin: { en: 'Super Admin',    ar: 'مشرف النظام' },
  roleSchool:     { en: 'School Admin',   ar: 'مدير المدرسة' },
  rolePrincipal:  { en: 'Principal',      ar: 'المدير التنفيذي' },
  roleTeacher:    { en: 'Teacher',        ar: 'معلم' },
  roleStudent:    { en: 'Student',        ar: 'طالب' },

  // ── Topbar ──────────────────────────────────────────────────────────────────
  notifications:       { en: 'Notifications',           ar: 'الإشعارات' },
  markAllRead:         { en: 'Mark all read',            ar: 'تحديد الكل كمقروء' },
  allCaughtUp:         { en: "All caught up!",           ar: 'لا إشعارات جديدة!' },
  switchToArabic:      { en: 'Switch to Arabic',         ar: 'التبديل إلى العربية' },
  switchToEnglish:     { en: 'Switch to English',        ar: 'التبديل إلى الإنجليزية' },
  loadingPortal:       { en: 'Loading portal…',          ar: 'جارٍ تحميل البوابة…' },

  // ── Sidebar ─────────────────────────────────────────────────────────────────
  collapseMenu:   { en: 'Collapse sidebar',  ar: 'طيّ القائمة' },
  expandMenu:     { en: 'Expand sidebar',    ar: 'توسيع القائمة' },
  closeNav:       { en: 'Close navigation',  ar: 'إغلاق التنقل' },
  onlineNow:      { en: 'Online',            ar: 'متصل الآن' },

  // ── Classrooms page ─────────────────────────────────────────────────────────
  newClassroom:       { en: 'New Classroom',         ar: 'فصل جديد' },
  createClassroom:    { en: 'Create Classroom',      ar: 'إنشاء فصل' },
  className:          { en: 'Class Name',            ar: 'اسم الفصل' },
  gradeLevel:         { en: 'Grade Level',           ar: 'المرحلة' },
  capacity:           { en: 'Capacity',              ar: 'السعة' },
  teacher:            { en: 'Teacher',               ar: 'المعلم' },
  unassigned:         { en: 'Unassigned',            ar: 'غير معين' },
  noClassrooms:       { en: 'No classrooms yet',     ar: 'لا يوجد فصول بعد' },
  enrolledStudents:   { en: 'Enrolled',              ar: 'المسجلون' },
  available:          { en: 'Available',             ar: 'المتاحون' },
  saveRoster:         { en: 'Save Roster',           ar: 'حفظ القائمة' },
  unsavedChanges:     { en: 'Unsaved changes',       ar: 'تغييرات غير محفوظة' },
  atFullCapacity:     { en: 'At full capacity',      ar: 'ممتلئ' },
  manageStudents:     { en: 'Manage Students',       ar: 'إدارة الطلاب' },
  assignTeacher:      { en: 'Assign Homeroom Teacher', ar: 'تعيين معلم الفصل' },
  selectTeacher:      { en: 'Select Teacher',        ar: 'اختر معلمًا' },
  searchStudents:     { en: 'Search students…',      ar: 'ابحث عن طالب…' },
  noStudentsMatch:    { en: 'No students match',       ar: 'لا توجد نتائج مطابقة' },
  allStudentsEnrolled:{ en: 'All students enrolled',   ar: 'جميع الطلاب مسجلون' },
  studentsSelected:   { en: 'students selected',       ar: 'طالب محدد' },
  studentSelected:    { en: 'student selected',        ar: 'طالب محدد' },
  classroomsManaged:  { en: 'classrooms managed',      ar: 'فصل تحت الإشراف' },
  createFirstClassroom:{ en: 'Create First Classroom', ar: 'إنشاء أول فصل' },
  classroomHint:      { en: 'Create your first classroom to start assigning teachers and students.', ar: 'أنشئ أول فصل دراسي لبدء تعيين المعلمين والطلاب.' },
  chooseTeacher:      { en: 'Choose a teacher…',       ar: 'اختر معلمًا…' },
  noActiveTeachers:   { en: 'No active teachers found. Ask the school admin to add teachers.', ar: 'لا يوجد معلمون نشطون. اطلب من مدير المدرسة إضافة معلمين.' },
  assignTeacherBtn:   { en: 'Assign Teacher',          ar: 'تعيين معلم' },
  unsavedDot:         { en: 'Unsaved changes · ',      ar: 'تغييرات غير محفوظة · ' },

  // ── Subjects page ───────────────────────────────────────────────────────────
  newSubject:         { en: 'New Subject',           ar: 'مادة جديدة' },
  createSubject:      { en: 'Create Subject',        ar: 'إنشاء مادة' },
  subjectName:        { en: 'Subject Name',          ar: 'اسم المادة' },
  classroom:          { en: 'Classroom',             ar: 'الفصل' },
  accentColor:        { en: 'Accent Color',          ar: 'لون التمييز' },
  noSubjects:         { en: 'No subjects defined yet', ar: 'لا توجد مواد بعد' },

  // ── Schedules page ──────────────────────────────────────────────────────────
  weeklySchedule:     { en: 'Weekly Schedule',       ar: 'الجدول الأسبوعي' },
  buildTimetables:    { en: 'Build timetables per classroom', ar: 'بناء الجداول الدراسية' },
  selectClassroom:    { en: 'Select a classroom…',   ar: 'اختر فصلاً…' },
  saveSchedule:       { en: 'Save Schedule',         ar: 'حفظ الجدول' },
  free:               { en: 'Free',                  ar: 'فارغ' },

  // ── Grades page ─────────────────────────────────────────────────────────────
  gradeManagement:    { en: 'Grade Management',      ar: 'إدارة الدرجات' },
  recordGrade:        { en: 'Record Grade',          ar: 'تسجيل درجة' },
  saveGrade:          { en: 'Save Grade',            ar: 'حفظ الدرجة' },
  gradeType:          { en: 'Grade Type',            ar: 'نوع التقييم' },
  score:              { en: 'Score',                 ar: 'الدرجة' },
  maxScore:           { en: 'Max Score',             ar: 'الدرجة الكاملة' },
  term:               { en: 'Term',                  ar: 'الفصل الدراسي' },
  note:               { en: 'Note',                  ar: 'ملاحظة' },
  selectClassFirst:   { en: 'Select a classroom first', ar: 'اختر الفصل أولاً' },
  noStudentsEnrolled: { en: 'No students enrolled',  ar: 'لا يوجد طلاب مسجلون' },
  loadingStudents:    { en: 'Loading students…',     ar: 'جارٍ تحميل الطلاب…' },
  studentsEnrolled:   { en: 'students enrolled',     ar: 'طالب مسجل' },
  noGrades:           { en: 'No grades recorded yet', ar: 'لا توجد درجات بعد' },
  recordFirstGrade:   { en: 'Record first grade',   ar: 'سجّل أول درجة' },
  step1SelectClass:   { en: '1 · Select Classroom', ar: '١ · اختر الفصل' },
  step2SelectStudent: { en: '2 · Select Student',   ar: '٢ · اختر الطالب' },

  // ── Documents page ──────────────────────────────────────────────────────────
  classDocuments:     { en: 'Class Documents',       ar: 'وثائق الفصل' },
  documentsUploaded:  { en: 'documents uploaded',    ar: 'وثيقة مرفوعة' },
  uploadDocument:     { en: 'Upload Document',       ar: 'رفع وثيقة' },
  documentTitle:      { en: 'Document Title',        ar: 'عنوان الوثيقة' },
  category:           { en: 'Category',              ar: 'الفئة' },
  clickToSelectFile:  { en: 'Click to select file…', ar: 'انقر لاختيار ملف…' },
  noDocuments:        { en: 'No documents uploaded yet', ar: 'لا توجد وثائق بعد' },
  uploadFirstDoc:     { en: 'Upload First Document', ar: 'ارفع أول وثيقة' },

  // ── Quizzes page ────────────────────────────────────────────────────────────
  createQuiz:         { en: 'Create Quiz',           ar: 'إنشاء اختبار' },
  newQuiz:            { en: 'New Quiz',              ar: 'اختبار جديد' },
  quizTitle:          { en: 'Quiz Title',            ar: 'عنوان الاختبار' },
  durationMin:        { en: 'Duration (minutes)',    ar: 'المدة (بالدقائق)' },
  dueDate:            { en: 'Due Date',              ar: 'تاريخ التسليم' },
  questions:          { en: 'Questions',             ar: 'الأسئلة' },
  addQuestion:        { en: 'Add Question',          ar: 'إضافة سؤال' },
  enterQuestion:      { en: 'Enter question…',       ar: 'أدخل السؤال…' },
  correctAnswer:      { en: 'Correct answer…',       ar: 'الإجابة الصحيحة…' },
  noQuizzes:          { en: 'No quizzes created yet', ar: 'لا توجد اختبارات بعد' },
  createFirstQuiz:    { en: 'Create First Quiz',     ar: 'أنشئ أول اختبار' },

  // ── Homework page ───────────────────────────────────────────────────────────
  newHomework:        { en: 'Assign',                ar: 'تكليف واجب' },
  assignHomework:     { en: 'Assign Homework',       ar: 'تكليف واجب' },
  assigningHomework:  { en: 'Assigning…',            ar: 'جارٍ التكليف…' },
  homeworkTitle:      { en: 'Title',                 ar: 'عنوان الواجب' },
  description:        { en: 'Description',           ar: 'الوصف' },
  allMyClasses:       { en: 'All my classes',        ar: 'جميع فصولي' },
  noHomework:         { en: 'No homework assigned yet', ar: 'لا توجد واجبات بعد' },
  assignFirst:        { en: 'Assign First Homework', ar: 'كلّف بأول واجب' },
  submissions:        { en: 'submissions',           ar: 'تسليم' },
  due:                { en: 'Due',                   ar: 'موعد التسليم' },

  // ── Dashboard ───────────────────────────────────────────────────────────────
  welcomeBack:        { en: 'Welcome back',          ar: 'مرحباً بعودتك' },
  overview:           { en: 'Overview',              ar: 'نظرة عامة' },
  totalStudents:      { en: 'Total Students',        ar: 'إجمالي الطلاب' },
  totalTeachers:      { en: 'Total Teachers',        ar: 'إجمالي المعلمين' },
  totalClassrooms:    { en: 'Total Classrooms',      ar: 'إجمالي الفصول' },
  totalSubjects:      { en: 'Total Subjects',        ar: 'إجمالي المواد' },
  unassignedClasses:  { en: 'Unassigned Classes',    ar: 'فصول بدون معلم' },
  recentActivity:     { en: 'Recent Activity',       ar: 'النشاط الأخير' },
} as const;

export type TranslationKey = keyof typeof translations;

/** Returns a translation function for the active language */
export function useT() {
  const { lang } = useLanguageStore();
  return (key: TranslationKey, fallback?: string): string => {
    const entry = translations[key];
    if (!entry) return fallback ?? key;
    return entry[lang as 'en' | 'ar'] ?? entry.en ?? fallback ?? key;
  };
}

/** One-off translation without the hook (for use outside React) */
export function t(key: TranslationKey, lang: 'en' | 'ar' = 'en'): string {
  return translations[key]?.[lang] ?? translations[key]?.en ?? key;
}

export default translations;
