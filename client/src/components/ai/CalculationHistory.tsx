/**
 * مكون سجل الحسابات - Calculation History Component
 * عرض وإدارة تاريخ الحسابات المالية
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  getAllRecords,
  getRecordsByType,
  deleteRecord,
  clearAllRecords,
  searchRecords,
  exportRecordsAsJSON,
  getHistoryStats,
  formatRecordDate,
  getCalculationTypeName,
  type AnyCalculationRecord,
  type CalculationType,
  type HistoryStats,
} from '@/lib/calculationHistory';
import {
  Trash2,
  Download,
  Search,
  Calculator,
  Shield,
  Users,
  Calendar,
  FileText,
  History,
  AlertCircle,
  Eye,
} from 'lucide-react';

// أيقونات لكل نوع حساب
const typeIcons: Record<CalculationType, React.ElementType> = {
  gosi: Calculator,
  eosb: FileText,
  leave: Calendar,
  saudization: Users,
  compliance: Shield,
};

// ألوان لكل نوع حساب
const typeColors: Record<CalculationType, string> = {
  gosi: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  eosb: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  leave: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  saudization: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  compliance: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
};

// مكون الإحصائيات السريعة
function QuickStats({ stats }: { stats: HistoryStats }) {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="pt-4">
          <div className="text-2xl font-bold text-primary">{stats.total}</div>
          <p className="text-sm text-muted-foreground">
            {isArabic ? 'إجمالي السجلات' : 'Total Records'}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4">
          <div className="text-2xl font-bold text-green-600">{stats.lastWeek}</div>
          <p className="text-sm text-muted-foreground">
            {isArabic ? 'هذا الأسبوع' : 'This Week'}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4">
          <div className="text-2xl font-bold text-blue-600">{stats.lastMonth}</div>
          <p className="text-sm text-muted-foreground">
            {isArabic ? 'هذا الشهر' : 'This Month'}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4">
          <div className="text-2xl font-bold text-purple-600">
            {Object.keys(stats.byType).filter(k => stats.byType[k as CalculationType] > 0).length}
          </div>
          <p className="text-sm text-muted-foreground">
            {isArabic ? 'أنواع مختلفة' : 'Different Types'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// مكون عرض تفاصيل السجل
function RecordDetails({ record }: { record: AnyCalculationRecord }) {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const formatValue = (value: unknown): string => {
    if (typeof value === 'number') {
      return value.toLocaleString(isArabic ? 'ar-SA' : 'en-US');
    }
    if (typeof value === 'boolean') {
      return value ? (isArabic ? 'نعم' : 'Yes') : (isArabic ? 'لا' : 'No');
    }
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  return (
    <div className="space-y-4">
      {/* المدخلات */}
      <div>
        <h4 className="font-semibold mb-2">{isArabic ? 'المدخلات' : 'Inputs'}</h4>
        <div className="bg-muted p-3 rounded-lg space-y-1">
          {Object.entries(record.inputs).map(([key, value]) => (
            <div key={key} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{key}:</span>
              <span className="font-medium">{formatValue(value)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* المخرجات */}
      <div>
        <h4 className="font-semibold mb-2">{isArabic ? 'النتائج' : 'Results'}</h4>
        <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg space-y-1">
          {Object.entries(record.outputs).map(([key, value]) => (
            <div key={key} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{key}:</span>
              <span className="font-medium text-green-700 dark:text-green-300">
                {formatValue(value)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* البيانات الوصفية */}
      {record.metadata && Object.keys(record.metadata).length > 0 && (
        <div>
          <h4 className="font-semibold mb-2">{isArabic ? 'معلومات إضافية' : 'Metadata'}</h4>
          <div className="bg-muted p-3 rounded-lg space-y-1">
            {Object.entries(record.metadata).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{key}:</span>
                <span className="font-medium">{formatValue(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// المكون الرئيسي
export function CalculationHistory() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  
  const [records, setRecords] = useState<AnyCalculationRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AnyCalculationRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<CalculationType | 'all'>('all');
  const [_selectedRecord, setSelectedRecord] = useState<AnyCalculationRecord | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [stats, setStats] = useState<HistoryStats | null>(null);

  // تحميل السجلات
  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = () => {
    const allRecords = getAllRecords();
    setRecords(allRecords);
    setFilteredRecords(allRecords);
    setStats(getHistoryStats());
  };

  // تطبيق الفلترة والبحث
  useEffect(() => {
    let result = records;

    // فلترة حسب النوع
    if (typeFilter !== 'all') {
      result = getRecordsByType(typeFilter);
    }

    // البحث
    if (searchQuery.trim()) {
      result = searchRecords(searchQuery);
      if (typeFilter !== 'all') {
        result = result.filter(r => r.type === typeFilter);
      }
    }

    setFilteredRecords(result);
  }, [records, searchQuery, typeFilter]);

  // حذف سجل
  const handleDelete = (id: string) => {
    deleteRecord(id);
    loadRecords();
    toast.success(isArabic ? 'تم حذف السجل بنجاح' : 'Record deleted successfully');
  };

  // مسح الكل
  const handleClearAll = () => {
    clearAllRecords();
    loadRecords();
    setShowClearConfirm(false);
    toast.success(isArabic ? 'تم مسح جميع السجلات' : 'All records cleared');
  };

  // تصدير
  const handleExport = () => {
    const json = exportRecordsAsJSON(filteredRecords);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calculation_history_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success(
      isArabic 
        ? `تم تصدير ${filteredRecords.length} سجل بنجاح` 
        : `Successfully exported ${filteredRecords.length} records`
    );
  };

  // مكون الصف
  const RecordRow = ({ record }: { record: AnyCalculationRecord }) => {
    const Icon = typeIcons[record.type];

    return (
      <TableRow>
        <TableCell>
          <Badge className={typeColors[record.type]}>
            <Icon className="w-3 h-3 mr-1" />
            {getCalculationTypeName(record.type, isArabic ? 'ar' : 'en')}
          </Badge>
        </TableCell>
        <TableCell className="text-muted-foreground">
          {formatRecordDate(record.timestamp, isArabic ? 'ar-SA' : 'en-US')}
        </TableCell>
        <TableCell>
          {record.metadata?.employeeName || record.metadata?.employeeId || '-'}
        </TableCell>
        <TableCell className="text-right">
          <div className="flex gap-2 justify-end">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedRecord(record)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {getCalculationTypeName(record.type, isArabic ? 'ar' : 'en')}
                  </DialogTitle>
                  <DialogDescription>
                    {formatRecordDate(record.timestamp, isArabic ? 'ar-SA' : 'en-US')}
                  </DialogDescription>
                </DialogHeader>
                <RecordDetails record={record} />
              </DialogContent>
            </Dialog>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => handleDelete(record.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  };

  // عرض حالة فارغة
  if (records.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="pt-12 pb-12 text-center">
          <History className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {isArabic ? 'لا توجد سجلات' : 'No Records Yet'}
          </h3>
          <p className="text-muted-foreground">
            {isArabic 
              ? 'ستظهر هنا الحسابات التي تقوم بها' 
              : 'Calculations you perform will appear here'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* الإحصائيات */}
      {stats && <QuickStats stats={stats} />}

      {/* البطاقة الرئيسية */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                {isArabic ? 'سجل الحسابات' : 'Calculation History'}
              </CardTitle>
              <CardDescription>
                {isArabic 
                  ? `${filteredRecords.length} سجل من ${records.length}` 
                  : `${filteredRecords.length} of ${records.length} records`}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                {isArabic ? 'تصدير' : 'Export'}
              </Button>
              <Dialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    {isArabic ? 'مسح الكل' : 'Clear All'}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-destructive" />
                      {isArabic ? 'تأكيد المسح' : 'Confirm Clear'}
                    </DialogTitle>
                    <DialogDescription>
                      {isArabic 
                        ? 'هل أنت متأكد من مسح جميع السجلات؟ لا يمكن التراجع عن هذا الإجراء.' 
                        : 'Are you sure you want to clear all records? This action cannot be undone.'}
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowClearConfirm(false)}>
                      {isArabic ? 'إلغاء' : 'Cancel'}
                    </Button>
                    <Button variant="destructive" onClick={handleClearAll}>
                      {isArabic ? 'مسح الكل' : 'Clear All'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* أدوات الفلترة */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={isArabic ? 'بحث...' : 'Search...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={typeFilter}
              onValueChange={(v) => setTypeFilter(v as CalculationType | 'all')}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder={isArabic ? 'نوع الحساب' : 'Calculation Type'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {isArabic ? 'جميع الأنواع' : 'All Types'}
                </SelectItem>
                <SelectItem value="gosi">
                  {getCalculationTypeName('gosi', isArabic ? 'ar' : 'en')}
                </SelectItem>
                <SelectItem value="eosb">
                  {getCalculationTypeName('eosb', isArabic ? 'ar' : 'en')}
                </SelectItem>
                <SelectItem value="leave">
                  {getCalculationTypeName('leave', isArabic ? 'ar' : 'en')}
                </SelectItem>
                <SelectItem value="saudization">
                  {getCalculationTypeName('saudization', isArabic ? 'ar' : 'en')}
                </SelectItem>
                <SelectItem value="compliance">
                  {getCalculationTypeName('compliance', isArabic ? 'ar' : 'en')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* جدول السجلات */}
          {filteredRecords.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isArabic ? 'النوع' : 'Type'}</TableHead>
                    <TableHead>{isArabic ? 'التاريخ' : 'Date'}</TableHead>
                    <TableHead>{isArabic ? 'الموظف' : 'Employee'}</TableHead>
                    <TableHead className="text-right">
                      {isArabic ? 'الإجراءات' : 'Actions'}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map(record => (
                    <RecordRow key={record.id} record={record} />
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {isArabic ? 'لا توجد نتائج' : 'No results found'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default CalculationHistory;
