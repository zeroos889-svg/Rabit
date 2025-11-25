import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapView } from "@/components/Map";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Mail, Phone, MessageSquare, ShieldCheck, Sparkles, ArrowUpRight } from "lucide-react";

const teamSizeOptions = [
  { value: "1-10", label: "1-10" },
  { value: "11-50", label: "11-50" },
  { value: "51-200", label: "51-200" },
  { value: "201-500", label: "201-500" },
  { value: "500+", label: "500+" },
];

const topicOptions = ["sales", "support", "partnership", "media", "demo", "other"] as const;
const methodOptions = ["email", "phone", "whatsapp"] as const;

type ContactFieldElement =
  | globalThis.HTMLInputElement
  | globalThis.HTMLTextAreaElement
  | globalThis.HTMLSelectElement;

const contactChannels = [
  {
    titleKey: "contact.channels.sales.title",
    descKey: "contact.channels.sales.desc",
    icon: Sparkles,
    email: "sales@rabit.sa",
  },
  {
    titleKey: "contact.channels.support.title",
    descKey: "contact.channels.support.desc",
    icon: ShieldCheck,
    email: "support@rabit.sa",
  },
  {
    titleKey: "contact.channels.partnerships.title",
    descKey: "contact.channels.partnerships.desc",
    icon: MessageSquare,
    email: "partners@rabit.sa",
  },
];

const faqItems = [
  { questionKey: "contact.faq.q1", answerKey: "contact.faq.a1" },
  { questionKey: "contact.faq.q2", answerKey: "contact.faq.a2" },
  { questionKey: "contact.faq.q3", answerKey: "contact.faq.a3" },
];

const metricEntries = [
  {
    labelKey: "contact.metric.response_time",
    valueKey: "contact.metric.response_time_value",
  },
  { labelKey: "contact.metric.clients", valueKey: "contact.metric.clients_value" },
  {
    labelKey: "contact.metric.satisfaction",
    valueKey: "contact.metric.satisfaction_value",
  },
  {
    labelKey: "contact.metric.availability",
    valueKey: "contact.metric.availability_value",
  },
];

export default function Contact() {
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    companyName: "",
    teamSize: "11-50",
    topic: "sales" as (typeof topicOptions)[number],
    message: "",
    preferredContactMethod: "email" as (typeof methodOptions)[number],
    hearAboutUs: "",
  });

  const mutation = trpc.contact.submit.useMutation({
    onSuccess: () => {
      toast.success(t("contact.form.success"));
      setFormData(prev => ({
        ...prev,
        fullName: "",
        email: "",
        phoneNumber: "",
        companyName: "",
        message: "",
        hearAboutUs: "",
      }));
    },
    onError: () => {
      toast.error(t("contact.form.error"));
    },
  });

  const metrics = useMemo(
    () =>
      metricEntries.map(entry => ({
        label: t(entry.labelKey),
        value: t(entry.valueKey),
      })),
    [t]
  );

  const handleChange = (field: keyof typeof formData) =>
    (event: ChangeEvent<ContactFieldElement>) => {
      setFormData(prev => ({ ...prev, [field]: event.target.value }));
    };

  const handleSubmit = (event: FormEvent<globalThis.HTMLFormElement>) => {
    event.preventDefault();
    if (mutation.isPending) return;
    mutation.mutate({
      ...formData,
      phoneNumber: formData.phoneNumber || undefined,
      companyName: formData.companyName || undefined,
      hearAboutUs: formData.hearAboutUs || undefined,
      locale: i18n.language,
    });
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-24">
      <div className="container max-w-6xl mx-auto px-4 py-16 space-y-16">
        <section className="grid gap-10 lg:grid-cols-2 items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border px-4 py-1 text-sm text-primary">
              <Sparkles className="h-4 w-4" />
              {t("contact.hero.badge")}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-balance">
              {t("contact.hero.title")}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t("contact.hero.subtitle")}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="gap-2">
                <Phone className="h-4 w-4" />
                {t("contact.hero.cta.primary")}
              </Button>
              <Button size="lg" variant="outline" className="gap-2">
                <Mail className="h-4 w-4" />
                {t("contact.hero.cta.secondary")}
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {metrics.map(stat => (
                <Card key={stat.label} className="border-none bg-white shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-2xl font-semibold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Card className="border-none shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl">
                {t("contact.form.title")}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {t("contact.form.description")}
              </p>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="fullName">
                      {t("contact.form.fullName")}
                    </label>
                    <Input
                      id="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleChange("fullName")}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="email">
                      {t("contact.form.email")}
                    </label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange("email")}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="phone">
                      {t("contact.form.phone")}
                    </label>
                    <Input
                      id="phone"
                      value={formData.phoneNumber}
                      onChange={handleChange("phoneNumber")}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="company">
                      {t("contact.form.company")}
                    </label>
                    <Input
                      id="company"
                      value={formData.companyName}
                      onChange={handleChange("companyName")}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="teamSize">
                      {t("contact.form.teamSize")}
                    </label>
                    <select
                      id="teamSize"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.teamSize}
                      onChange={handleChange("teamSize")}
                    >
                      {teamSizeOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="topic">
                      {t("contact.form.topic")}
                    </label>
                    <select
                      id="topic"
                      value={formData.topic}
                      onChange={handleChange("topic")}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      {topicOptions.map(topic => (
                        <option key={topic} value={topic}>
                          {t(`contact.topic.${topic}`)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="method">
                      {t("contact.form.method")}
                    </label>
                    <select
                      id="method"
                      value={formData.preferredContactMethod}
                      onChange={handleChange("preferredContactMethod")}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      {methodOptions.map(method => (
                        <option key={method} value={method}>
                          {t(`contact.method.${method}`)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="hear">
                      {t("contact.form.hearAboutUs")}
                    </label>
                    <Input
                      id="hear"
                      placeholder={t("contact.form.hearAboutUs.placeholder")}
                      value={formData.hearAboutUs}
                      onChange={handleChange("hearAboutUs")}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="message">
                    {t("contact.form.message")}
                  </label>
                  <Textarea
                    id="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={handleChange("message")}
                  />
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={mutation.isPending}>
                  {mutation.isPending ? t("contact.form.sending") : t("contact.form.submit")}
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-wide text-primary/80">
              {t("contact.channels.title")}
            </p>
            <h2 className="text-3xl font-semibold mt-2">
              {t("contact.hero.cta.secondary")}
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {contactChannels.map(channel => (
              <Card key={channel.titleKey} className="h-full border-none shadow-sm">
                <CardContent className="p-6 space-y-4">
                  <channel.icon className="h-10 w-10 text-primary" />
                  <div>
                    <p className="text-xl font-semibold">{t(channel.titleKey)}</p>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {t(channel.descKey)}
                    </p>
                  </div>
                  <Button variant="link" className="px-0" asChild>
                    <a href={`mailto:${channel.email}`} className="inline-flex items-center gap-1">
                      {t("contact.channels.cta")}
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-2">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>{t("contact.faq.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {faqItems.map(item => (
                <div key={item.questionKey} className="rounded-lg border p-4">
                  <p className="font-semibold">{t(item.questionKey)}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                    {t(item.answerKey)}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-none overflow-hidden shadow-md">
            <MapView
              className="h-full min-h-[320px]"
              center={{ lat: 24.7136, lng: 46.6753 }}
              zoom={12}
            />
          </Card>
        </section>
      </div>
    </div>
  );
}
