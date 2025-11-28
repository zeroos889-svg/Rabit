import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Clock, Sparkles } from "lucide-react";

interface SubscriptionInfo {
  plan: string;
  planEn: string;
  status: string;
  statusEn: string;
  price: number;
  nextBilling: string;
  daysLeft: number;
}

interface SubscriptionCardProps {
  subscription: SubscriptionInfo;
  isArabic: boolean;
}

export function SubscriptionCard({ subscription, isArabic }: Readonly<SubscriptionCardProps>) {
  const progressPercent = Math.min(100, Math.max(0, (subscription.daysLeft / 30) * 100));

  return (
    <Card className="bg-gradient-to-br from-purple-600 to-pink-600 text-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">
            {isArabic ? "اشتراكك" : "Your Subscription"}
          </CardTitle>
          <Sparkles className="w-5 h-5" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm opacity-90">
            {isArabic ? "الباقة" : "Plan"}
          </p>
          <p className="text-2xl font-bold">
            {isArabic ? subscription.plan : subscription.planEn}
          </p>
        </div>

        <div className="flex items-center justify-between py-3 border-t border-white/20">
          <span className="text-sm opacity-90">
            {isArabic ? "الحالة" : "Status"}
          </span>
          <Badge className="bg-white text-purple-600">
            {isArabic ? subscription.status : subscription.statusEn}
          </Badge>
        </div>

        <div className="flex items-center justify-between py-3 border-t border-white/20">
          <span className="text-sm opacity-90">
            {isArabic ? "السعر الشهري" : "Monthly Price"}
          </span>
          <span className="font-bold">{subscription.price} ﷼</span>
        </div>

        <div className="flex items-center justify-between py-3 border-t border-white/20">
          <span className="text-sm opacity-90">
            {isArabic ? "التجديد القادم" : "Next Billing"}
          </span>
          <span className="text-sm">{subscription.nextBilling}</span>
        </div>

        <div className="bg-white/10 rounded-lg p-3 mt-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">
              {subscription.daysLeft} {isArabic ? "يوم متبقي" : "days left"}
            </span>
          </div>
          <Progress 
            value={progressPercent} 
            className="h-2 bg-white/20"
          />
        </div>

        <Button className="w-full bg-white text-purple-600 hover:bg-gray-100 mt-4">
          {isArabic ? "إدارة الاشتراك" : "Manage Subscription"}
        </Button>
      </CardContent>
    </Card>
  );
}

export type { SubscriptionInfo };
