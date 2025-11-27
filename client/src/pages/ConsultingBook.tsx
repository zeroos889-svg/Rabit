import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CTAButton } from "@/components/CTAButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Calendar, Clock, CheckCircle2, User } from "lucide-react";

// Define types inline
interface ConsultingType {
  id: number;
  nameAr: string;
  descriptionAr: string;
  duration: number;
  price?: number;
  basePriceSAR?: number;
  slaHours?: number;
}

interface Consultant {
  id: number;
  fullNameAr?: string;
  bioAr?: string;
  mainSpecialization?: string;
  yearsOfExperience?: number;
}

export default function ConsultingBook() {
  const { data: typesData, isLoading: loadingTypes } =
    trpc.consultant.getConsultationTypes.useQuery();
  const { data: consultantsData, isLoading: loadingConsultants } =
    trpc.consultant.getApprovedConsultants.useQuery();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white py-12">
      <div className="container max-w-5xl space-y-8">
        <div className="text-center space-y-3">
          <Badge variant="secondary">حجز استشارة</Badge>
          <h1 className="text-3xl md:text-4xl font-bold">
            ابدأ حجز استشارتك الآن
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            اختر نوع الاستشارة والمستشار المناسب ثم انتقل للخطوات التفصيلية.
          </p>
          <div className="flex justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/consulting/book-new">ابدأ الحجز</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/consulting/experts">تصفح المستشارين</Link>
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                أنواع الاستشارة المتاحة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingTypes ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                typesData?.types?.map((type: ConsultingType) => (
                  <div
                    key={type.id}
                    className="flex items-start justify-between p-3 rounded-lg border bg-white"
                  >
                    <div>
                      <p className="font-semibold">{type.nameAr}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {type.descriptionAr}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <Clock className="h-3 w-3" />
                        <span>{type.duration} دقيقة</span>
                        <Badge variant="outline" className="text-[11px]">
                          SLA {type.slaHours || 24} ساعة
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                    <div className="text-lg font-bold text-primary">
                      {type.price || type.basePriceSAR} ريال
                    </div>
                    <CTAButton
                      href={`/consulting/book-new?typeId=${type.id}`}
                      label="احجز"
                      fullWidth
                      className="mt-2"
                    />
                  </div>
                </div>
              ))
            )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                مستشارون معتمدون
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingConsultants ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                consultantsData?.consultants?.slice(0, 4).map((consultant: Consultant) => (
                  <div
                    key={consultant.id}
                    className="flex items-start justify-between p-3 rounded-lg border bg-white"
                  >
                    <div>
                      <p className="font-semibold">{consultant.fullNameAr}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {consultant.bioAr || consultant.mainSpecialization}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                        <span>{consultant.yearsOfExperience} سنوات خبرة</span>
                      </div>
                    </div>
                    <Button size="sm" asChild>
                      <Link href="/consulting/book-new">اختر</Link>
                    </Button>
                  </div>
                ))
              )}
              <Button variant="ghost" className="w-full" asChild>
                <Link href="/consulting/experts">عرض جميع المستشارين</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
