import { useMemo, type ReactNode } from "react";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CTAButton } from "@/components/CTAButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft,
  Award,
  Briefcase,
  Calendar,
  MapPin,
  MessageSquare,
  Phone,
  Star,
  Video,
} from "lucide-react";
import { Footer } from "@/components/Footer";

export default function ConsultingExpertProfile() {
  const { id } = useParams<{ id: string }>();
  const expertId = Number(id);

  const { data, isLoading } = trpc.consultant.getConsultant.useQuery(
    { id: expertId },
    { enabled: !!expertId }
  );

  const expert = useMemo(() => data?.consultant, [data]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-purple-50">
        <div className="container py-12 space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!expert) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="container py-12 text-center">
          <h1 className="text-3xl font-bold mb-3">الخبير غير موجود</h1>
          <p className="text-muted-foreground mb-6">
            لم نعثر على الخبير المطلوب. يمكنك العودة لقائمة الخبراء.
          </p>
          <Link href="/consulting/experts">
            <Button className="gradient-primary text-white">
              العودة لقائمة الخبراء
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 flex flex-col">
      <div className="container py-10 flex-1">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/consulting/experts">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <p className="text-sm text-muted-foreground">الخبراء المعتمدون</p>
            <h1 className="text-3xl font-bold">
              {expert.fullNameAr || expert.fullName}
            </h1>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile card */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center gap-4">
              <img
                src={
                  expert.profilePicture ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${expert.id}`
                }
                alt={expert.fullNameAr || expert.fullName}
                className="h-24 w-24 rounded-full border-4 border-white shadow-md object-cover"
                loading="lazy"
                width={96}
                height={96}
              />
              <div className="flex-1 text-right sm:text-right">
                <CardTitle className="text-2xl">
                  {expert.fullNameAr || expert.fullName}
                </CardTitle>
                <p className="text-muted-foreground">
                  {expert.mainSpecialization || "مستشار موارد بشرية"}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {(expert.subSpecializations || ["استشارات"]).map((spec: string) => (
                    <Badge key={spec} variant="secondary">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {expert.bioAr || expert.bio || "مستشار معتمد في الموارد البشرية."}
              </p>

              <div className="grid md:grid-cols-3 gap-4">
                <InfoChip icon={<Star className="h-4 w-4 text-yellow-500" />}>
                  {expert.averageRating || 4.8} ({expert.reviewsCount || 120} تقييم)
                </InfoChip>
                <InfoChip icon={<Briefcase className="h-4 w-4 text-blue-600" />}>
                  خبرة {expert.yearsOfExperience || 1} سنوات
                </InfoChip>
                <InfoChip icon={<Calendar className="h-4 w-4 text-green-600" />}>
                  {expert.consultations || 100} استشارة
                </InfoChip>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <InfoChip icon={<MapPin className="h-4 w-4 text-red-500" />}>
                  {expert.city || "السعودية"}
                </InfoChip>
                <InfoChip icon={<Award className="h-4 w-4 text-purple-500" />}>
                  اللغات: {(expert.languages || ["العربية"]).join("، ")}
                </InfoChip>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">أبرز الإنجازات</h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {(expert.achievements || [
                    "جلسات استشارية ناجحة",
                    "خبرة عملية مع شركات متنوعة",
                    "تقييمات عالية من العملاء",
                  ]).map((item: string) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Booking card */}
          <Card>
            <CardHeader>
              <CardTitle>حجز استشارة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  السعر للجلسة (45 دقيقة)
                </span>
                <span className="text-2xl font-bold">
                  {expert.price || 299} <span className="text-sm">﷼</span>
                </span>
              </div>
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <Video className="h-4 w-4" />
                <span>جلسة فيديو</span>
              </div>
              <div className="flex items-center gap-2 text-blue-600 text-sm">
                <MessageSquare className="h-4 w-4" />
                <span>دعم عبر الدردشة</span>
              </div>
              <div className="flex items-center gap-2 text-amber-600 text-sm">
                <Phone className="h-4 w-4" />
                <span>متاح للمكالمات الهاتفية</span>
              </div>
              <CTAButton
                href={`/consulting/book-new?consultantId=${expert.id}`}
                label="احجز الآن"
                fullWidth
              />
              <Button variant="outline" className="w-full" asChild>
                <Link href="/consulting">العودة للاستشارات</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}

type InfoChipProps = Readonly<{ icon: ReactNode; children: ReactNode }>;

function InfoChip({ icon, children }: InfoChipProps) {
  return (
    <div className="flex items-center gap-2 rounded-md bg-slate-50 border p-3 text-sm">
      {icon}
      <span className="text-muted-foreground">{children}</span>
    </div>
  );
}
