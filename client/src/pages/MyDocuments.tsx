import { useMemo, useState } from "react";
import type { ComponentProps } from "react";
import { useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createSafeRichTextProps } from "@/lib/sanitize";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bookmark, Download, Eye, FileText, Loader2, RefreshCw, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../../../server/routers";

const MAX_DOCUMENTS = 200;
const RECENT_WINDOW_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const SAFE_TITLE_REGEX = /[^0-9A-Za-z\u0600-\u06FF\s-_]/g;

/**
 * Helper to get document language label
 */
function getLanguageLabel(lang: string | null | undefined): string {
  if (lang === "ar") return "العربية";
  if (lang === "en") return "الإنجليزية";
  return "ثنائي";
}

type RouterOutputs = inferRouterOutputs<AppRouter>;
type GeneratedDocument = RouterOutputs["documentGenerator"]["getMyDocuments"]["documents"][number];
type FilterTab = "all" | "saved" | "draft";

const formatDate = (value?: string | Date | null) => {
  if (!value) return "—";
  try {
    const date = typeof value === "string" ? new Date(value) : value;
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
};

const isSavedDocument = (doc: GeneratedDocument) => Boolean(doc.isSaved ?? doc.saved);

const formatTemplateCode = (code: string) =>
  code
    .split(/[-_]/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const getDocTitle = (doc: GeneratedDocument) => {
  if (doc.title && doc.title.trim().length > 0) return doc.title;
  if (doc.companyName) return `${doc.companyName} - ${doc.templateCode ?? "مستند"}`;
  if (doc.templateCode) return formatTemplateCode(doc.templateCode);
  return `مستند رقم ${doc.id}`;
};

const getDocSnippet = (doc: GeneratedDocument, maxLength = 140) => {
  const raw = doc.outputText || doc.content || doc.outputHtml || "";
  const plain = typeof raw === "string" ? raw.replaceAll(/<[^>]+>/g, " ").replaceAll(/\s+/g, " ") : "";
  if (!plain) return "—";
  return plain.length > maxLength ? `${plain.slice(0, maxLength)}…` : plain;
};

type DialogControlProps = Pick<ComponentProps<typeof Dialog>, "open" | "onOpenChange">;

type PreviewDialogProps = DialogControlProps & {
  document: GeneratedDocument | null;
};

const DocumentPreviewDialog = ({ document, open, onOpenChange }: PreviewDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{document ? getDocTitle(document) : "معاينة المستند"}</DialogTitle>
        </DialogHeader>
        {document ? (
          <ScrollArea className="max-h-[60vh] rounded-lg border bg-white/50 p-6">
            {document.outputHtml ? (
              <div
                className="space-y-4 text-right leading-relaxed"
                dangerouslySetInnerHTML={createSafeRichTextProps(document.outputHtml)}
              />
            ) : (
              <pre className="whitespace-pre-wrap text-sm text-right leading-relaxed">{document.outputText ?? document.content ?? "لا توجد بيانات لعرضها"}</pre>
            )}
          </ScrollArea>
        ) : (
          <div className="text-center text-muted-foreground">لا يوجد مستند محدد</div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default function MyDocuments() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const documentsQueryInput = { limit: MAX_DOCUMENTS } as const;
  const [tab, setTab] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");
  const [previewDoc, setPreviewDoc] = useState<GeneratedDocument | null>(null);
  const [pendingFavoriteId, setPendingFavoriteId] = useState<number | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const {
    data,
    isLoading,
    isFetching,
    refetch,
  } = trpc.documentGenerator.getMyDocuments.useQuery(documentsQueryInput, {
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2,
  });

  const documentsData = data?.documents;
  const documents = useMemo(() => documentsData ?? [], [documentsData]);

  const toggleSaveMutation = trpc.documentGenerator.toggleSaveDocument.useMutation({
    onSuccess: (result: { isSaved: boolean }) => {
      toast.success(result.isSaved ? "تم حفظ المستند في المفضلة" : "تمت إزالته من المفضلة");
      utils.documentGenerator.getMyDocuments.invalidate(documentsQueryInput);
    },
    onError: () => toast.error("تعذر تحديث حالة المستند"),
  });

  const deleteDocumentMutation = trpc.documentGenerator.deleteDocument.useMutation({
    onSuccess: () => {
      toast.success("تم حذف المستند نهائياً");
      utils.documentGenerator.getMyDocuments.invalidate(documentsQueryInput);
    },
    onError: () => toast.error("تعذر حذف المستند"),
  });

  const filteredDocuments = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return documents.filter((doc: GeneratedDocument) => {
      if (tab === "saved" && !isSavedDocument(doc)) return false;
      if (tab === "draft" && isSavedDocument(doc)) return false;
      if (!normalizedSearch) return true;
      const haystack = `${getDocTitle(doc)} ${doc.templateCode ?? ""} ${doc.companyName ?? ""}`.toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [documents, tab, search]);

  const stats = useMemo(() => {
    const total = documents.length;
    const saved = documents.filter(isSavedDocument).length;
    const drafts = total - saved;
    const recent = documents.filter((doc: GeneratedDocument) => {
      if (!doc.createdAt) return false;
      const createdAt = typeof doc.createdAt === "string" ? new Date(doc.createdAt) : doc.createdAt;
      return Date.now() - createdAt.getTime() <= RECENT_WINDOW_MS;
    }).length;
    return { total, saved, drafts, recent };
  }, [documents]);

  const handleToggleFavorite = (docId: number) => {
    setPendingFavoriteId(docId);
    toggleSaveMutation.mutate(
      { documentId: docId },
      {
        onSettled: () => setPendingFavoriteId(null),
      }
    );
  };

  const handleDelete = (docId: number) => {
    setPendingDeleteId(docId);
    deleteDocumentMutation.mutate(
      { documentId: docId },
      {
        onSettled: () => setPendingDeleteId(null),
      }
    );
  };

  const handleDownload = (doc: GeneratedDocument) => {
    const content = doc.outputHtml || doc.outputText || doc.content;
    if (!content) {
      toast.info("لا يوجد محتوى قابل للتنزيل لهذا المستند حالياً");
      return;
    }

    try {
      const isHtml = Boolean(doc.outputHtml);
      const blob = new Blob([content], {
        type: isHtml ? "text/html;charset=utf-8" : "text/plain;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
  const safeTitle = getDocTitle(doc).replaceAll(SAFE_TITLE_REGEX, "").trim() || "document";
      link.download = `${safeTitle}-${doc.id}.${isHtml ? "html" : "txt"}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success("تم تجهيز المستند للتحميل");
    } catch {
      toast.error("حدث خطأ أثناء تجهيز الملف");
    }
  };

  const handleRefresh = () => {
    if (!isAuthenticated) return;
    refetch();
  };

  const isEmptyState = filteredDocuments.length === 0;

  // Unique skeleton keys for loading state
  const skeletonKeys = ["skeleton-doc-1", "skeleton-doc-2", "skeleton-doc-3"];

  // Helper function to render document list content
  const renderDocumentListContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-3">
          {skeletonKeys.map((key) => (
            <Skeleton key={key} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      );
    }

    if (isEmptyState) {
      return (
        <div className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
          لا توجد مستندات مطابقة لخيارات البحث الحالية. قم بتوليد مستند جديد أو عدّل عوامل التصفية.
        </div>
      );
    }

    return null; // Table will be rendered separately
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-10 space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">مكتبتي</h1>
            <p className="text-muted-foreground">
              جميع المستندات التي تم توليدها أو حفظها من الأدوات الذكية.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setTab("saved")}
              className={tab === "saved" ? "border-blue-500 text-blue-600" : undefined}
            >
              <Bookmark className="h-4 w-4 ml-2" />
              المفضلة
            </Button>
            <Button
              className="bg-gradient-to-r from-purple-600 to-blue-600"
              onClick={() => navigate("/document-generator")}
            >
              + مستند جديد
            </Button>
          </div>
        </div>

        {isAuthenticated ? (
          <>
            <div className="grid gap-4 md:grid-cols-4">
              {[
                { label: "إجمالي المستندات", value: stats.total },
                { label: "محفوظ", value: stats.saved },
                { label: "مسودات", value: stats.drafts },
                { label: "آخر 7 أيام", value: stats.recent },
              ].map(item => (
                <Card key={item.label}>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className="text-2xl font-bold">{item.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle>المحفوظات</CardTitle>
                  <CardDescription>فلترة، بحث، وتنزيل المستندات</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isFetching}>
                  {isFetching ? <Loader2 className="h-4 w-4 ml-2 animate-spin" /> : <RefreshCw className="h-4 w-4 ml-2" />}
                  تحديث
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Tabs value={tab} onValueChange={val => setTab(val as FilterTab)}>
                    <TabsList>
                      <TabsTrigger value="all">الكل</TabsTrigger>
                      <TabsTrigger value="saved">المحفوظة</TabsTrigger>
                      <TabsTrigger value="draft">مسودات</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <div className="flex items-center gap-2 w-full md:w-72">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="بحث باسم المستند أو الشركة"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                  </div>
                </div>

                {renderDocumentListContent() || (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">العنوان</TableHead>
                        <TableHead className="text-right">النوع</TableHead>
                        <TableHead className="text-right">اللغة</TableHead>
                        <TableHead className="text-right">التاريخ</TableHead>
                        <TableHead className="text-right">ملخص</TableHead>
                        <TableHead className="text-right">إجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDocuments.map((doc: GeneratedDocument) => {
                        const saved = isSavedDocument(doc);
                        return (
                          <TableRow key={doc.id}>
                            <TableCell>
                              <div className="flex items-center gap-2 font-medium">
                                <FileText className="h-4 w-4 text-purple-600" />
                                {getDocTitle(doc)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-2">
                                {doc.templateCode && <Badge variant="outline">{doc.templateCode}</Badge>}
                                {doc.companyName && <Badge variant="secondary">{doc.companyName}</Badge>}
                              </div>
                            </TableCell>
                            <TableCell>
                              {doc.lang && (
                                <Badge variant="outline">
                                  {getLanguageLabel(doc.lang)}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>{formatDate(doc.createdAt)}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{getDocSnippet(doc)}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-2">
                                <Button variant="outline" size="sm" onClick={() => setPreviewDoc(doc)}>
                                  <Eye className="h-4 w-4 ml-1" />
                                  عرض
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleDownload(doc)}>
                                  <Download className="h-4 w-4 ml-1" />
                                  تحميل
                                </Button>
                                <Button
                                  variant={saved ? "default" : "ghost"}
                                  size="sm"
                                  onClick={() => handleToggleFavorite(doc.id)}
                                  disabled={pendingFavoriteId === doc.id && toggleSaveMutation.isPending}
                                >
                                  {pendingFavoriteId === doc.id && toggleSaveMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 ml-1 animate-spin" />
                                  ) : (
                                    <Bookmark
                                      className="h-4 w-4 ml-1"
                                      fill={saved ? "currentColor" : "none"}
                                    />
                                  )}
                                  {saved ? "إزالة" : "حفظ"}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600"
                                  onClick={() => handleDelete(doc.id)}
                                  disabled={pendingDeleteId === doc.id && deleteDocumentMutation.isPending}
                                >
                                  {pendingDeleteId === doc.id && deleteDocumentMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 ml-1 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4 ml-1" />
                                  )}
                                  حذف
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              قم بتسجيل الدخول للوصول إلى مكتبة المستندات الخاصة بك.
            </CardContent>
          </Card>
        )}
      </div>

      <DocumentPreviewDialog
        document={previewDoc}
        open={Boolean(previewDoc)}
        onOpenChange={open => {
          if (!open) setPreviewDoc(null);
        }}
      />
    </div>
  );
}
