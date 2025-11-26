import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { Link } from "wouter";

export type AudienceBenefit = {
  title: string;
  audienceLabel: string;
  summary: string;
  details: string[];
  icon: LucideIcon;
  accent: string;
  ctaLabel: string;
  ctaHref: string;
};

export const AudienceBenefitCard = ({
  icon: Icon,
  title,
  audienceLabel,
  summary,
  details,
  accent,
  ctaLabel,
  ctaHref,
}: AudienceBenefit) => (
  <Card className="h-full border-2 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
    <CardHeader>
      <div className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium", accent)}>
        <Icon className="h-4 w-4" />
        {audienceLabel}
      </div>
      <CardTitle className="mt-4 text-2xl font-semibold">{title}</CardTitle>
      <CardDescription className="text-base leading-relaxed text-muted-foreground">
        {summary}
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
        {details.map(point => (
          <li key={point} className="flex items-start gap-2">
            <span className="mt-1 inline-flex h-2 w-2 flex-shrink-0 rounded-full bg-primary" aria-hidden />
            <span>{point}</span>
          </li>
        ))}
      </ul>
      <Button className="w-full" asChild>
        <Link href={ctaHref}>{ctaLabel}</Link>
      </Button>
    </CardContent>
  </Card>
);

export type PricingPlan = {
  name: string;
  price: string;
  description: string;
  employeeSize: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  badge?: string;
  highlighted?: boolean;
};

export const PricingPlanCard = ({
  name,
  price,
  description,
  employeeSize,
  features,
  ctaLabel,
  ctaHref,
  badge,
  highlighted,
}: PricingPlan) => (
  <Card
    className={cn(
      "flex h-full flex-col border-2",
      highlighted && "border-primary shadow-2xl"
    )}
  >
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle className="text-2xl font-bold">{name}</CardTitle>
        {badge && (
          <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            {badge}
          </Badge>
        )}
      </div>
      <CardDescription className="text-base text-muted-foreground">
        {description}
      </CardDescription>
      <div className="mt-6">
        <div className="text-4xl font-bold">{price}</div>
        <p className="text-sm text-muted-foreground">{employeeSize}</p>
      </div>
    </CardHeader>
    <CardContent className="flex flex-1 flex-col justify-between space-y-6">
      <ul className="space-y-3 text-sm text-muted-foreground">
        {features.map(feature => (
          <li key={feature} className="flex items-start gap-2">
            <span className="mt-1 inline-flex h-2 w-2 flex-shrink-0 rounded-full bg-primary" aria-hidden />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Button variant={highlighted ? "default" : "outline"} className="w-full" asChild>
        <Link href={ctaHref}>{ctaLabel}</Link>
      </Button>
    </CardContent>
  </Card>
);

export type TrustSignal = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export const TrustSignalCard = ({ title, description, icon: Icon }: TrustSignal) => (
  <Card className="h-full border-2 shadow-sm">
    <CardHeader className="space-y-4">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="h-6 w-6" />
      </div>
      <CardTitle className="text-xl">{title}</CardTitle>
      <CardDescription className="text-base leading-relaxed">
        {description}
      </CardDescription>
    </CardHeader>
  </Card>
);

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
};

export const TestimonialCard = ({ quote, name, role }: Testimonial) => (
  <Card className="h-full border border-dashed border-primary/30 bg-muted/30">
    <CardContent className="space-y-4 p-6">
      <p className="text-lg leading-relaxed">“{quote}”</p>
      <div>
        <p className="font-semibold">{name}</p>
        <p className="text-sm text-muted-foreground">{role}</p>
      </div>
    </CardContent>
  </Card>
);

export type Logo = {
  name: string;
};

export const LogoCloud = ({ logos }: { logos: Logo[] }) => (
  <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
    {logos.map(logo => (
      <div
        key={logo.name}
        className="flex h-20 items-center justify-center rounded-xl border bg-background/70 text-sm font-medium text-muted-foreground"
      >
        {logo.name}
      </div>
    ))}
  </div>
);
