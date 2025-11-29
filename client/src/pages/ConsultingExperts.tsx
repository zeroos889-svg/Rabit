import { useMemo, useState } from "react";
import { Link } from "wouter";
import { CTAButton } from "@/components/CTAButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import {
  Star,
  Search,
  MapPin,
  Briefcase,
  Award,
  Calendar,
  MessageSquare,
} from "lucide-react";
import { Footer } from "@/components/Footer";

interface ExpertItem {
  id: number;
  fullName?: string | null;
  fullNameAr?: string | null;
  mainSpecialization?: string | null;
  subSpecializations?: string[] | null;
  profilePicture?: string | null;
  bio?: string | null;
  averageRating?: number | null;
  reviewsCount?: number | null;
  yearsOfExperience?: number | null;
  city?: string | null;
  consultations?: number | null;
  languages?: string[] | null;
  price?: number | null;
}

const specialties = [
  "الكل",
  "نظام العمل",
  "العقود",
  "التوظيف",
  "الأداء",
  "القانون",
  "الرواتب",
];

export default function ConsultingExperts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("الكل");
  const { data, isLoading } = trpc.consultant.getApprovedConsultants.useQuery();

  const experts = useMemo(() => data?.consultants ?? [], [data]);

  const filteredExperts = experts.filter((expert: ExpertItem) => {
    const name = (expert.fullNameAr || expert.fullName || "").toLowerCase();
    const title = (expert.mainSpecialization || "").toLowerCase();
    const matchesSearch =
      name.includes(searchTerm.toLowerCase()) ||
      title.includes(searchTerm.toLowerCase());
    const matchesSpecialty =
      selectedSpecialty === "الكل" ||
      (expert.subSpecializations || []).includes(selectedSpecialty);
    return matchesSearch && matchesSpecialty;
  });

  const skeletonPlaceholders = [
    "skeleton-1",
    "skeleton-2",
    "skeleton-3",
    "skeleton-4",
    "skeleton-5",
    "skeleton-6",
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              مستشارو الموارد البشرية
            </h1>
            <p className="text-xl mb-8 text-blue-50">
              تواصل مع أفضل الخبراء والمستشارين في مجال الموارد البشرية
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="ابحث عن مستشار..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pr-12 h-14 text-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 border-b">
        <div className="container">
          <div className="flex flex-wrap gap-2 justify-center">
            {specialties.map(specialty => (
              <Button
                key={specialty}
                variant={
                  selectedSpecialty === specialty ? "default" : "outline"
                }
                onClick={() => setSelectedSpecialty(specialty)}
              >
                {specialty}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Experts Grid */}
      <section className="py-16 flex-1">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading
              ? skeletonPlaceholders.map(placeholderId => (
                  <Card key={placeholderId} className="p-4 space-y-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-16 w-16 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-3 w-1/2" />
                        <Skeleton className="h-3 w-1/3" />
                        <Skeleton className="h-3 w-1/4" />
                      </div>
                    </div>
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-5/6" />
                    <Skeleton className="h-3 w-2/3" />
                    <Skeleton className="h-10 w-full" />
                  </Card>
                ))
              : filteredExperts.map((expert: ExpertItem) => (
                  <Card
                    key={expert.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <img
                          src={
                            expert.profilePicture ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${expert.id}`
                          }
                          alt={expert.fullNameAr || expert.fullName || ""}
                          loading="lazy"
                          className="w-20 h-20 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-1">
                            {expert.fullNameAr || expert.fullName}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {expert.mainSpecialization || "مستشار موارد بشرية"}
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-medium ms-1">
                                {expert.averageRating || 4.8}
                              </span>
                            </div>
                            <span className="text-sm text-gray-500">
                              ({expert.reviewsCount || 120} تقييم)
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Specialties */}
                      <div>
                        <div className="flex flex-wrap gap-2">
                          {(expert.subSpecializations || ["استشارات"]).map(
                            (specialty: string) => (
                              <Badge key={specialty} variant="secondary">
                                {specialty}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Briefcase className="h-4 w-4" />
                          <span>
                            {expert.yearsOfExperience || 1} سنوات خبرة
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>{expert.city || "السعودية"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Award className="h-4 w-4" />
                          <span>{expert.consultations || 120}+ استشارة</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <MessageSquare className="h-4 w-4" />
                          <span>
                            {(expert.languages || ["العربية"]).join(", ")}
                          </span>
                        </div>
                      </div>

                      {/* Availability */}
                      <div className="pt-4 border-t space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600 flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-green-600" />
                            <span>متاح</span>
                          </div>
                          <div>
                            <span className="text-2xl font-bold text-blue-600">
                              {expert.price || 299} ﷼
                            </span>
                            <span className="text-sm text-gray-500 ms-2">
                              / جلسة
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <Link href={`/consulting/expert/${expert.id}`}>
                            <Button variant="outline" className="w-full">
                              عرض الملف
                            </Button>
                          </Link>
                          <CTAButton
                            href={`/consulting/book-new?consultantId=${expert.id}`}
                            label="احجز الآن"
                            fullWidth
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
          </div>

          {filteredExperts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">
                لا توجد نتائج مطابقة للبحث
              </p>
              <div className="mt-4 flex justify-center gap-2">
                <Button variant="outline" onClick={() => setSearchTerm("")}>
                  مسح البحث
                </Button>
                <Button onClick={() => setSelectedSpecialty("الكل")}>
                  عرض جميع الخبراء
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
