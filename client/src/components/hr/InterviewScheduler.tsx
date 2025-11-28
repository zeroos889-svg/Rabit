import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  Phone,
  User,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  getDay,
  isToday,
} from "date-fns";
import { ar, enUS } from "date-fns/locale";

// Types
interface Candidate {
  id: string;
  name: string;
  nameAr: string;
  email: string;
  phone: string;
  position: string;
  positionAr: string;
  avatar?: string;
}

interface Interviewer {
  id: string;
  name: string;
  nameAr: string;
  role: string;
  roleAr: string;
  avatar?: string;
}

interface Interview {
  id: string;
  candidate: Candidate;
  interviewers: Interviewer[];
  date: Date;
  startTime: string;
  endTime: string;
  type: "video" | "in-person" | "phone";
  location?: string;
  meetingLink?: string;
  status: "scheduled" | "completed" | "cancelled" | "no-show";
  notes?: string;
  round: number;
}

// Mock Data
const MOCK_CANDIDATES: Candidate[] = [
  {
    id: "1",
    name: "Sarah Ahmed",
    nameAr: "سارة أحمد",
    email: "sarah@example.com",
    phone: "+966501234567",
    position: "Frontend Developer",
    positionAr: "مطور واجهات أمامية",
  },
  {
    id: "2",
    name: "Mohammed Ali",
    nameAr: "محمد علي",
    email: "mohammed@example.com",
    phone: "+966507654321",
    position: "Backend Developer",
    positionAr: "مطور خلفي",
  },
  {
    id: "3",
    name: "Fatima Hassan",
    nameAr: "فاطمة حسن",
    email: "fatima@example.com",
    phone: "+966509876543",
    position: "UX Designer",
    positionAr: "مصمم تجربة المستخدم",
  },
];

const MOCK_INTERVIEWERS: Interviewer[] = [
  {
    id: "1",
    name: "Ahmed Mohammed",
    nameAr: "أحمد محمد",
    role: "Engineering Manager",
    roleAr: "مدير الهندسة",
  },
  {
    id: "2",
    name: "Nora Saleh",
    nameAr: "نورة صالح",
    role: "HR Manager",
    roleAr: "مدير الموارد البشرية",
  },
  {
    id: "3",
    name: "Omar Khalid",
    nameAr: "عمر خالد",
    role: "Tech Lead",
    roleAr: "قائد فريق تقني",
  },
];

const MOCK_INTERVIEWS: Interview[] = [
  {
    id: "1",
    candidate: MOCK_CANDIDATES[0],
    interviewers: [MOCK_INTERVIEWERS[0], MOCK_INTERVIEWERS[2]],
    date: new Date(),
    startTime: "10:00",
    endTime: "11:00",
    type: "video",
    meetingLink: "https://meet.google.com/abc-defg-hij",
    status: "scheduled",
    round: 2,
  },
  {
    id: "2",
    candidate: MOCK_CANDIDATES[1],
    interviewers: [MOCK_INTERVIEWERS[1]],
    date: new Date(Date.now() + 86400000),
    startTime: "14:00",
    endTime: "15:00",
    type: "in-person",
    location: "Office - Meeting Room A",
    status: "scheduled",
    round: 1,
  },
  {
    id: "3",
    candidate: MOCK_CANDIDATES[2],
    interviewers: [MOCK_INTERVIEWERS[0], MOCK_INTERVIEWERS[1]],
    date: new Date(Date.now() + 172800000),
    startTime: "11:00",
    endTime: "12:00",
    type: "phone",
    status: "scheduled",
    round: 1,
  },
];

// Components
interface CalendarViewProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  interviews: Interview[];
  isArabic: boolean;
}

function CalendarView({
  currentDate,
  onDateChange,
  selectedDate,
  onSelectDate,
  interviews,
  isArabic,
}: CalendarViewProps) {
  const locale = isArabic ? ar : enUS;
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startDay = getDay(monthStart);
  const emptyDays = Array.from({ length: startDay }, (_, i) => i);

  const weekDays = isArabic
    ? ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]
    : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const hasInterviews = (date: Date) =>
    interviews.some((i) => isSameDay(i.date, date));

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDateChange(subMonths(currentDate, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="font-semibold">
            {format(currentDate, "MMMM yyyy", { locale })}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDateChange(addMonths(currentDate, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-muted-foreground p-2"
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {emptyDays.map((i) => (
            <div key={`empty-${i}`} className="p-2" />
          ))}
          {days.map((day) => {
            const hasInt = hasInterviews(day);
            const isSelected = isSameDay(day, selectedDate);
            const isCurrentDay = isToday(day);

            return (
              <button
                key={day.toISOString()}
                onClick={() => onSelectDate(day)}
                className={cn(
                  "relative p-2 text-center text-sm rounded-lg transition-colors",
                  !isSameMonth(day, currentDate) && "text-muted-foreground",
                  isSelected && "bg-primary text-primary-foreground",
                  !isSelected && isCurrentDay && "bg-accent",
                  !isSelected && !isCurrentDay && "hover:bg-accent"
                )}
              >
                {format(day, "d")}
                {hasInt && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

interface InterviewCardProps {
  interview: Interview;
  isArabic: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onComplete?: () => void;
  onCancel?: () => void;
}

function InterviewCard({
  interview,
  isArabic,
  onEdit,
  onDelete,
  onComplete,
  onCancel,
}: InterviewCardProps) {
  const TypeIcon =
    interview.type === "video"
      ? Video
      : interview.type === "phone"
      ? Phone
      : MapPin;

  const statusConfig = {
    scheduled: {
      color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      label: isArabic ? "مجدولة" : "Scheduled",
    },
    completed: {
      color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      label: isArabic ? "مكتملة" : "Completed",
    },
    cancelled: {
      color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      label: isArabic ? "ملغية" : "Cancelled",
    },
    "no-show": {
      color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      label: isArabic ? "لم يحضر" : "No Show",
    },
  };

  const status = statusConfig[interview.status];

  return (
    <Card className="overflow-hidden">
      <div
        className={cn(
          "h-1",
          interview.status === "scheduled"
            ? "bg-blue-500"
            : interview.status === "completed"
            ? "bg-green-500"
            : interview.status === "cancelled"
            ? "bg-red-500"
            : "bg-yellow-500"
        )}
      />
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={interview.candidate.avatar} />
              <AvatarFallback>
                {interview.candidate.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-medium">
                {isArabic
                  ? interview.candidate.nameAr
                  : interview.candidate.name}
              </h4>
              <p className="text-sm text-muted-foreground">
                {isArabic
                  ? interview.candidate.positionAr
                  : interview.candidate.position}
              </p>
            </div>
          </div>
          <Badge className={status.color}>{status.label}</Badge>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {format(interview.date, "PPP", {
                locale: isArabic ? ar : enUS,
              })}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              {interview.startTime} - {interview.endTime}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <TypeIcon className="h-4 w-4" />
            <span>
              {interview.type === "video"
                ? isArabic
                  ? "مقابلة فيديو"
                  : "Video Call"
                : interview.type === "phone"
                ? isArabic
                  ? "مكالمة هاتفية"
                  : "Phone Call"
                : interview.location}
            </span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t">
          <p className="text-xs text-muted-foreground mb-2">
            {isArabic ? "المقابلون:" : "Interviewers:"}
          </p>
          <div className="flex items-center -space-x-2">
            {interview.interviewers.map((interviewer) => (
              <Avatar key={interviewer.id} className="h-7 w-7 border-2 border-background">
                <AvatarImage src={interviewer.avatar} />
                <AvatarFallback className="text-xs">
                  {interviewer.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4">
          {interview.status === "scheduled" && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={onComplete}
              >
                <Check className="h-3 w-3 mr-1" />
                {isArabic ? "اكتمل" : "Complete"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={onCancel}
              >
                <X className="h-3 w-3 mr-1" />
                {isArabic ? "إلغاء" : "Cancel"}
              </Button>
            </>
          )}
          <Button size="sm" variant="ghost" onClick={onEdit}>
            <Edit className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onDelete}>
            <Trash2 className="h-3 w-3 text-destructive" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Main Component
export function InterviewScheduler() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [interviews, setInterviews] = useState<Interview[]>(MOCK_INTERVIEWS);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [newInterview, setNewInterview] = useState({
    candidateId: "",
    interviewerIds: [] as string[],
    date: "",
    startTime: "",
    endTime: "",
    type: "video" as "video" | "in-person" | "phone",
    location: "",
    meetingLink: "",
    notes: "",
  });

  // Filter interviews
  const filteredInterviews = useMemo(() => {
    return interviews.filter((interview) => {
      const matchesSearch =
        interview.candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        interview.candidate.nameAr.includes(searchQuery);
      const matchesStatus =
        statusFilter === "all" || interview.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [interviews, searchQuery, statusFilter]);

  // Get interviews for selected date
  const selectedDateInterviews = useMemo(() => {
    return filteredInterviews.filter((i) => isSameDay(i.date, selectedDate));
  }, [filteredInterviews, selectedDate]);

  // Get upcoming interviews
  const upcomingInterviews = useMemo(() => {
    const now = new Date();
    return filteredInterviews
      .filter((i) => i.date >= now && i.status === "scheduled")
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 5);
  }, [filteredInterviews]);

  const handleAddInterview = () => {
    // Add interview logic
    setIsAddDialogOpen(false);
    setNewInterview({
      candidateId: "",
      interviewerIds: [],
      date: "",
      startTime: "",
      endTime: "",
      type: "video",
      location: "",
      meetingLink: "",
      notes: "",
    });
  };

  const handleCompleteInterview = (id: string) => {
    setInterviews((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: "completed" } : i))
    );
  };

  const handleCancelInterview = (id: string) => {
    setInterviews((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: "cancelled" } : i))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">
            {isArabic ? "جدولة المقابلات" : "Interview Scheduler"}
          </h2>
          <p className="text-muted-foreground">
            {isArabic
              ? "إدارة وجدولة مقابلات التوظيف"
              : "Manage and schedule recruitment interviews"}
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {isArabic ? "جدولة مقابلة" : "Schedule Interview"}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {isArabic ? "جدولة مقابلة جديدة" : "Schedule New Interview"}
              </DialogTitle>
              <DialogDescription>
                {isArabic
                  ? "حدد تفاصيل المقابلة الجديدة"
                  : "Set up the details for the new interview"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>{isArabic ? "المرشح" : "Candidate"}</Label>
                <Select
                  value={newInterview.candidateId}
                  onValueChange={(v) =>
                    setNewInterview({ ...newInterview, candidateId: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        isArabic ? "اختر المرشح" : "Select candidate"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_CANDIDATES.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {isArabic ? c.nameAr : c.name} -{" "}
                        {isArabic ? c.positionAr : c.position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>{isArabic ? "التاريخ" : "Date"}</Label>
                  <Input
                    type="date"
                    value={newInterview.date}
                    onChange={(e) =>
                      setNewInterview({ ...newInterview, date: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>{isArabic ? "النوع" : "Type"}</Label>
                  <Select
                    value={newInterview.type}
                    onValueChange={(v) =>
                      setNewInterview({
                        ...newInterview,
                        type: v as "video" | "in-person" | "phone",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">
                        {isArabic ? "فيديو" : "Video"}
                      </SelectItem>
                      <SelectItem value="in-person">
                        {isArabic ? "حضوري" : "In-Person"}
                      </SelectItem>
                      <SelectItem value="phone">
                        {isArabic ? "هاتف" : "Phone"}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>{isArabic ? "وقت البداية" : "Start Time"}</Label>
                  <Input
                    type="time"
                    value={newInterview.startTime}
                    onChange={(e) =>
                      setNewInterview({
                        ...newInterview,
                        startTime: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>{isArabic ? "وقت النهاية" : "End Time"}</Label>
                  <Input
                    type="time"
                    value={newInterview.endTime}
                    onChange={(e) =>
                      setNewInterview({
                        ...newInterview,
                        endTime: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              {newInterview.type === "in-person" && (
                <div className="grid gap-2">
                  <Label>{isArabic ? "الموقع" : "Location"}</Label>
                  <Input
                    value={newInterview.location}
                    onChange={(e) =>
                      setNewInterview({
                        ...newInterview,
                        location: e.target.value,
                      })
                    }
                    placeholder={
                      isArabic ? "غرفة الاجتماعات" : "Meeting room"
                    }
                  />
                </div>
              )}
              {newInterview.type === "video" && (
                <div className="grid gap-2">
                  <Label>{isArabic ? "رابط الاجتماع" : "Meeting Link"}</Label>
                  <Input
                    value={newInterview.meetingLink}
                    onChange={(e) =>
                      setNewInterview({
                        ...newInterview,
                        meetingLink: e.target.value,
                      })
                    }
                    placeholder="https://meet.google.com/..."
                  />
                </div>
              )}
              <div className="grid gap-2">
                <Label>{isArabic ? "ملاحظات" : "Notes"}</Label>
                <Textarea
                  value={newInterview.notes}
                  onChange={(e) =>
                    setNewInterview({ ...newInterview, notes: e.target.value })
                  }
                  placeholder={
                    isArabic ? "ملاحظات إضافية..." : "Additional notes..."
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                {isArabic ? "إلغاء" : "Cancel"}
              </Button>
              <Button onClick={handleAddInterview}>
                <CalendarDays className="h-4 w-4 mr-2" />
                {isArabic ? "جدولة" : "Schedule"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isArabic ? "بحث عن مرشح..." : "Search candidates..."}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{isArabic ? "الكل" : "All"}</SelectItem>
            <SelectItem value="scheduled">
              {isArabic ? "مجدولة" : "Scheduled"}
            </SelectItem>
            <SelectItem value="completed">
              {isArabic ? "مكتملة" : "Completed"}
            </SelectItem>
            <SelectItem value="cancelled">
              {isArabic ? "ملغية" : "Cancelled"}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-1">
          <CalendarView
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            interviews={interviews}
            isArabic={isArabic}
          />

          {/* Upcoming Interviews */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-base">
                {isArabic ? "المقابلات القادمة" : "Upcoming Interviews"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px]">
                <div className="space-y-3">
                  {upcomingInterviews.map((interview) => (
                    <div
                      key={interview.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer"
                      onClick={() => setSelectedDate(interview.date)}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={interview.candidate.avatar} />
                        <AvatarFallback className="text-xs">
                          {interview.candidate.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {isArabic
                            ? interview.candidate.nameAr
                            : interview.candidate.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(interview.date, "PP", {
                            locale: isArabic ? ar : enUS,
                          })}{" "}
                          • {interview.startTime}
                        </p>
                      </div>
                    </div>
                  ))}
                  {upcomingInterviews.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      {isArabic
                        ? "لا توجد مقابلات قادمة"
                        : "No upcoming interviews"}
                    </p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Selected Date Interviews */}
        <div className="lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">
            {format(selectedDate, "PPPP", {
              locale: isArabic ? ar : enUS,
            })}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedDateInterviews.map((interview) => (
              <InterviewCard
                key={interview.id}
                interview={interview}
                isArabic={isArabic}
                onComplete={() => handleCompleteInterview(interview.id)}
                onCancel={() => handleCancelInterview(interview.id)}
              />
            ))}
            {selectedDateInterviews.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CalendarDays className="h-12 w-12 text-muted-foreground mb-4" />
                  <h4 className="text-lg font-medium">
                    {isArabic
                      ? "لا توجد مقابلات في هذا اليوم"
                      : "No interviews scheduled"}
                  </h4>
                  <p className="text-muted-foreground text-center mt-1">
                    {isArabic
                      ? "اضغط على زر جدولة مقابلة لإضافة مقابلة جديدة"
                      : "Click Schedule Interview to add a new interview"}
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => setIsAddDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {isArabic ? "جدولة مقابلة" : "Schedule Interview"}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default InterviewScheduler;
