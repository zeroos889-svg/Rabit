import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GraduationCap,
  BookOpen,
  Video,
  Clock,
  Users,
  Plus,
  Play,
  Check,
  Star,
  Award,
  Search,
  Filter,
  FileText,
} from "lucide-react";

// Types
interface Course {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  category: string;
  categoryAr: string;
  duration: string;
  durationAr: string;
  instructor: string;
  instructorAr: string;
  type: "video" | "document" | "workshop" | "online";
  thumbnail?: string;
  rating: number;
  enrolledCount: number;
  isMandatory: boolean;
}

interface Enrollment {
  id: string;
  course: Course;
  enrolledDate: Date;
  progress: number;
  status: "not-started" | "in-progress" | "completed";
  completedDate?: Date;
  score?: number;
}

interface _TrainingProgram {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  courses: Course[];
  startDate: Date;
  endDate: Date;
  participants: number;
}

// Mock Data
const MOCK_COURSES: Course[] = [
  {
    id: "1",
    title: "Introduction to Company Policies",
    titleAr: "مقدمة في سياسات الشركة",
    description: "Learn about our company policies and procedures",
    descriptionAr: "تعرف على سياسات وإجراءات الشركة",
    category: "Compliance",
    categoryAr: "الامتثال",
    duration: "2 hours",
    durationAr: "2 ساعة",
    instructor: "HR Team",
    instructorAr: "فريق الموارد البشرية",
    type: "video",
    rating: 4.5,
    enrolledCount: 150,
    isMandatory: true,
  },
  {
    id: "2",
    title: "Leadership Skills Development",
    titleAr: "تطوير مهارات القيادة",
    description: "Enhance your leadership and management skills",
    descriptionAr: "تعزيز مهاراتك القيادية والإدارية",
    category: "Leadership",
    categoryAr: "القيادة",
    duration: "8 hours",
    durationAr: "8 ساعات",
    instructor: "Dr. Ahmed",
    instructorAr: "د. أحمد",
    type: "workshop",
    rating: 4.8,
    enrolledCount: 45,
    isMandatory: false,
  },
  {
    id: "3",
    title: "Data Security Awareness",
    titleAr: "التوعية بأمن البيانات",
    description: "Essential security practices for all employees",
    descriptionAr: "ممارسات الأمان الأساسية لجميع الموظفين",
    category: "Security",
    categoryAr: "الأمان",
    duration: "1 hour",
    durationAr: "1 ساعة",
    instructor: "IT Security",
    instructorAr: "أمن تقنية المعلومات",
    type: "online",
    rating: 4.2,
    enrolledCount: 200,
    isMandatory: true,
  },
  {
    id: "4",
    title: "Effective Communication",
    titleAr: "التواصل الفعال",
    description: "Master professional communication skills",
    descriptionAr: "إتقان مهارات التواصل المهني",
    category: "Soft Skills",
    categoryAr: "المهارات الناعمة",
    duration: "4 hours",
    durationAr: "4 ساعات",
    instructor: "Sarah Johnson",
    instructorAr: "سارة جونسون",
    type: "video",
    rating: 4.6,
    enrolledCount: 89,
    isMandatory: false,
  },
  {
    id: "5",
    title: "Project Management Fundamentals",
    titleAr: "أساسيات إدارة المشاريع",
    description: "Learn the basics of project management",
    descriptionAr: "تعلم أساسيات إدارة المشاريع",
    category: "Management",
    categoryAr: "الإدارة",
    duration: "6 hours",
    durationAr: "6 ساعات",
    instructor: "Mohammed Ali",
    instructorAr: "محمد علي",
    type: "document",
    rating: 4.4,
    enrolledCount: 67,
    isMandatory: false,
  },
];

const MOCK_ENROLLMENTS: Enrollment[] = [
  {
    id: "1",
    course: MOCK_COURSES[0],
    enrolledDate: new Date("2025-01-15"),
    progress: 100,
    status: "completed",
    completedDate: new Date("2025-01-20"),
    score: 95,
  },
  {
    id: "2",
    course: MOCK_COURSES[1],
    enrolledDate: new Date("2025-02-01"),
    progress: 60,
    status: "in-progress",
  },
  {
    id: "3",
    course: MOCK_COURSES[2],
    enrolledDate: new Date("2025-02-10"),
    progress: 0,
    status: "not-started",
  },
];

// Components
interface CourseCardProps {
  course: Course;
  isArabic: boolean;
  onEnroll?: () => void;
  isEnrolled?: boolean;
}

function CourseCard({ course, isArabic, onEnroll, isEnrolled }: CourseCardProps) {
  const TypeIcon =
    course.type === "video"
      ? Video
      : course.type === "workshop"
      ? Users
      : course.type === "online"
      ? GraduationCap
      : FileText;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="h-32 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
        <TypeIcon className="h-12 w-12 text-primary/50" />
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <Badge variant="outline" className="text-xs">
            {isArabic ? course.categoryAr : course.category}
          </Badge>
          {course.isMandatory && (
            <Badge variant="destructive" className="text-xs">
              {isArabic ? "إلزامي" : "Required"}
            </Badge>
          )}
        </div>
        <h3 className="font-semibold mt-2 line-clamp-2">
          {isArabic ? course.titleAr : course.title}
        </h3>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
          {isArabic ? course.descriptionAr : course.description}
        </p>
        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>{isArabic ? course.durationAr : course.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            <span>{course.rating}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3 pt-3 border-t">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-xs">
              {course.instructor.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">
            {isArabic ? course.instructorAr : course.instructor}
          </span>
        </div>
        <Button
          className="w-full mt-4"
          variant={isEnrolled ? "outline" : "default"}
          onClick={onEnroll}
        >
          {isEnrolled ? (
            <>
              <Check className="h-4 w-4 ms-2" />
              {isArabic ? "مسجل" : "Enrolled"}
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 ms-2" />
              {isArabic ? "التسجيل" : "Enroll"}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

interface EnrollmentCardProps {
  enrollment: Enrollment;
  isArabic: boolean;
  onContinue?: () => void;
}

function EnrollmentCard({ enrollment, isArabic, onContinue }: EnrollmentCardProps) {
  const statusConfig = {
    "not-started": {
      color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
      label: isArabic ? "لم يبدأ" : "Not Started",
    },
    "in-progress": {
      color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      label: isArabic ? "جاري" : "In Progress",
    },
    completed: {
      color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      label: isArabic ? "مكتمل" : "Completed",
    },
  };

  const status = statusConfig[enrollment.status];

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
            <GraduationCap className="h-8 w-8 text-primary/50" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-medium line-clamp-1">
                {isArabic
                  ? enrollment.course.titleAr
                  : enrollment.course.title}
              </h4>
              <Badge className={status.color}>{status.label}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {isArabic
                ? enrollment.course.categoryAr
                : enrollment.course.category}{" "}
              •{" "}
              {isArabic
                ? enrollment.course.durationAr
                : enrollment.course.duration}
            </p>
            <div className="mt-3">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">
                  {isArabic ? "التقدم" : "Progress"}
                </span>
                <span className="font-medium">{enrollment.progress}%</span>
              </div>
              <Progress value={enrollment.progress} className="h-2" />
            </div>
            {enrollment.status === "completed" && enrollment.score && (
              <div className="flex items-center gap-2 mt-2">
                <Award className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">
                  {isArabic ? `النتيجة: ${enrollment.score}%` : `Score: ${enrollment.score}%`}
                </span>
              </div>
            )}
          </div>
        </div>
        {enrollment.status !== "completed" && (
          <Button
            className="w-full mt-4"
            onClick={onContinue}
          >
            {enrollment.status === "not-started" ? (
              <>
                <Play className="h-4 w-4 ms-2" />
                {isArabic ? "ابدأ الآن" : "Start Now"}
              </>
            ) : (
              <>
                <Play className="h-4 w-4 ms-2" />
                {isArabic ? "متابعة" : "Continue"}
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// Main Component
export function TrainingManagement() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const [courses] = useState<Course[]>(MOCK_COURSES);
  const [enrollments, setEnrollments] = useState<Enrollment[]>(MOCK_ENROLLMENTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Get enrolled course IDs
  const enrolledCourseIds = new Set(enrollments.map((e) => e.course.id));

  // Filter courses
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.titleAr.includes(searchQuery);
      const matchesCategory =
        categoryFilter === "all" || course.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [courses, searchQuery, categoryFilter]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(courses.map((c) => c.category));
    return Array.from(cats);
  }, [courses]);

  // Stats
  const stats = useMemo(() => {
    const completed = enrollments.filter((e) => e.status === "completed").length;
    const inProgress = enrollments.filter((e) => e.status === "in-progress").length;
    const totalHours = enrollments
      .filter((e) => e.status === "completed")
      .reduce((acc) => acc + 2, 0); // Simplified

    return { completed, inProgress, totalHours, total: enrollments.length };
  }, [enrollments]);

  const handleEnroll = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    if (course && !enrolledCourseIds.has(courseId)) {
      const newEnrollment: Enrollment = {
        id: Date.now().toString(),
        course,
        enrolledDate: new Date(),
        progress: 0,
        status: "not-started",
      };
      setEnrollments([...enrollments, newEnrollment]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">
          {isArabic ? "إدارة التدريب" : "Training Management"}
        </h2>
        <p className="text-muted-foreground">
          {isArabic
            ? "تتبع وإدارة الدورات التدريبية والتطوير المهني"
            : "Track and manage training courses and professional development"}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? "الدورات المسجلة" : "Enrolled Courses"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? "جاري التعلم" : "In Progress"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? "مكتملة" : "Completed"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalHours}</p>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? "ساعات التعلم" : "Learning Hours"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="my-courses">
        <TabsList>
          <TabsTrigger value="my-courses">
            <BookOpen className="h-4 w-4 ms-2" />
            {isArabic ? "دوراتي" : "My Courses"}
          </TabsTrigger>
          <TabsTrigger value="catalog">
            <GraduationCap className="h-4 w-4 ms-2" />
            {isArabic ? "كتالوج الدورات" : "Course Catalog"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-courses" className="mt-4">
          {enrollments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h4 className="text-lg font-medium">
                  {isArabic
                    ? "لم تسجل في أي دورة بعد"
                    : "No courses enrolled yet"}
                </h4>
                <p className="text-muted-foreground text-center mt-1">
                  {isArabic
                    ? "تصفح كتالوج الدورات وابدأ التعلم"
                    : "Browse the course catalog and start learning"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrollments.map((enrollment) => (
                <EnrollmentCard
                  key={enrollment.id}
                  enrollment={enrollment}
                  isArabic={isArabic}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="catalog" className="mt-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isArabic ? "بحث عن دورة..." : "Search courses..."}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 ms-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {isArabic ? "كل الفئات" : "All Categories"}
                </SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                isArabic={isArabic}
                isEnrolled={enrolledCourseIds.has(course.id)}
                onEnroll={() => handleEnroll(course.id)}
              />
            ))}
          </div>
          {filteredCourses.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mb-4" />
                <h4 className="text-lg font-medium">
                  {isArabic ? "لم يتم العثور على دورات" : "No courses found"}
                </h4>
                <p className="text-muted-foreground text-center mt-1">
                  {isArabic
                    ? "جرب تغيير معايير البحث"
                    : "Try adjusting your search criteria"}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default TrainingManagement;
