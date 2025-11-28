import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users,
  UserPlus,
  UserMinus,
  Clock,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  Calendar,
  DollarSign,
  Briefcase,
  Activity,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface KPICard {
  id: string;
  title: string;
  titleAr: string;
  value: number | string;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  target?: number;
  icon: React.ElementType;
  format: 'number' | 'percentage' | 'currency' | 'days';
}

interface DepartmentKPI {
  department: string;
  departmentAr: string;
  headcount: number;
  turnover: number;
  satisfaction: number;
  performance: number;
}

// Sample KPI data
const kpiData: KPICard[] = [
  {
    id: 'total-employees',
    title: 'Total Employees',
    titleAr: 'إجمالي الموظفين',
    value: 1247,
    change: 5.2,
    changeType: 'increase',
    target: 1300,
    icon: Users,
    format: 'number',
  },
  {
    id: 'new-hires',
    title: 'New Hires (Month)',
    titleAr: 'التعيينات الجديدة (الشهر)',
    value: 23,
    change: 15,
    changeType: 'increase',
    target: 20,
    icon: UserPlus,
    format: 'number',
  },
  {
    id: 'turnover-rate',
    title: 'Turnover Rate',
    titleAr: 'معدل الدوران الوظيفي',
    value: 4.2,
    change: -0.8,
    changeType: 'decrease',
    target: 5,
    icon: UserMinus,
    format: 'percentage',
  },
  {
    id: 'avg-tenure',
    title: 'Average Tenure',
    titleAr: 'متوسط مدة الخدمة',
    value: 3.2,
    change: 0.3,
    changeType: 'increase',
    icon: Clock,
    format: 'number',
  },
  {
    id: 'time-to-hire',
    title: 'Time to Hire',
    titleAr: 'وقت التوظيف',
    value: 28,
    change: -3,
    changeType: 'decrease',
    target: 30,
    icon: Calendar,
    format: 'days',
  },
  {
    id: 'training-hours',
    title: 'Training Hours/Employee',
    titleAr: 'ساعات التدريب/موظف',
    value: 24,
    change: 4,
    changeType: 'increase',
    target: 30,
    icon: Award,
    format: 'number',
  },
  {
    id: 'cost-per-hire',
    title: 'Cost per Hire',
    titleAr: 'تكلفة التوظيف',
    value: 4500,
    change: -500,
    changeType: 'decrease',
    target: 5000,
    icon: DollarSign,
    format: 'currency',
  },
  {
    id: 'employee-satisfaction',
    title: 'Employee Satisfaction',
    titleAr: 'رضا الموظفين',
    value: 78,
    change: 3,
    changeType: 'increase',
    target: 85,
    icon: Activity,
    format: 'percentage',
  },
];

const departmentKPIs: DepartmentKPI[] = [
  { department: 'Engineering', departmentAr: 'الهندسة', headcount: 320, turnover: 3.2, satisfaction: 82, performance: 88 },
  { department: 'Sales', departmentAr: 'المبيعات', headcount: 180, turnover: 8.5, satisfaction: 71, performance: 92 },
  { department: 'Marketing', departmentAr: 'التسويق', headcount: 85, turnover: 4.1, satisfaction: 79, performance: 85 },
  { department: 'HR', departmentAr: 'الموارد البشرية', headcount: 45, turnover: 2.0, satisfaction: 88, performance: 90 },
  { department: 'Finance', departmentAr: 'المالية', headcount: 60, turnover: 2.5, satisfaction: 84, performance: 91 },
  { department: 'Operations', departmentAr: 'العمليات', headcount: 250, turnover: 5.8, satisfaction: 73, performance: 86 },
];

export function HRKPIsDashboard() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [period, setPeriod] = useState('month');

  const formatValue = (value: number | string, format: string): string => {
    if (typeof value === 'string') return value;
    
    switch (format) {
      case 'percentage':
        return `${value}%`;
      case 'currency':
        return `${value.toLocaleString()} ${isRTL ? 'ر.س' : 'SAR'}`;
      case 'days':
        return `${value} ${isRTL ? 'يوم' : 'days'}`;
      default:
        return value.toLocaleString();
    }
  };

  const getChangeIcon = (changeType: string) => {
    if (changeType === 'increase') {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    }
    if (changeType === 'decrease') {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  const getChangeColor = (changeType: string, isPositive: boolean) => {
    if (changeType === 'neutral') return 'text-muted-foreground';
    if (isPositive) return 'text-green-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">
            {isRTL ? 'مؤشرات الأداء الرئيسية للموارد البشرية' : 'HR Key Performance Indicators'}
          </h2>
          <p className="text-muted-foreground">
            {isRTL ? 'نظرة شاملة على أداء الموارد البشرية' : 'Overview of HR performance metrics'}
          </p>
        </div>
        
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">{isRTL ? 'هذا الأسبوع' : 'This Week'}</SelectItem>
            <SelectItem value="month">{isRTL ? 'هذا الشهر' : 'This Month'}</SelectItem>
            <SelectItem value="quarter">{isRTL ? 'هذا الربع' : 'This Quarter'}</SelectItem>
            <SelectItem value="year">{isRTL ? 'هذه السنة' : 'This Year'}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Main KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi) => {
          const Icon = kpi.icon;
          const isPositiveChange = 
            (kpi.id === 'turnover-rate' || kpi.id === 'time-to-hire' || kpi.id === 'cost-per-hire')
              ? kpi.change < 0
              : kpi.change > 0;
          
          return (
            <Card key={kpi.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {isRTL ? kpi.titleAr : kpi.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatValue(kpi.value, kpi.format)}
                </div>
                
                <div className="flex items-center gap-2 mt-2">
                  {getChangeIcon(kpi.changeType)}
                  <span className={`text-sm ${getChangeColor(kpi.changeType, isPositiveChange)}`}>
                    {kpi.change > 0 ? '+' : ''}{kpi.change}
                    {kpi.format === 'percentage' ? '%' : ''}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {isRTL ? 'من الفترة السابقة' : 'from last period'}
                  </span>
                </div>
                
                {kpi.target && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">
                        {isRTL ? 'الهدف' : 'Target'}
                      </span>
                      <span>{formatValue(kpi.target, kpi.format)}</span>
                    </div>
                    <Progress 
                      value={Math.min(
                        (typeof kpi.value === 'number' ? kpi.value / kpi.target : 0) * 100,
                        100
                      )} 
                      className="h-2"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Department KPIs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            {isRTL ? 'مؤشرات الأداء حسب القسم' : 'Department KPIs'}
          </CardTitle>
          <CardDescription>
            {isRTL ? 'مقارنة الأداء بين الأقسام' : 'Performance comparison across departments'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-start p-3 font-medium">
                    {isRTL ? 'القسم' : 'Department'}
                  </th>
                  <th className="text-center p-3 font-medium">
                    {isRTL ? 'عدد الموظفين' : 'Headcount'}
                  </th>
                  <th className="text-center p-3 font-medium">
                    {isRTL ? 'معدل الدوران' : 'Turnover %'}
                  </th>
                  <th className="text-center p-3 font-medium">
                    {isRTL ? 'الرضا' : 'Satisfaction'}
                  </th>
                  <th className="text-center p-3 font-medium">
                    {isRTL ? 'الأداء' : 'Performance'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {departmentKPIs.map((dept) => (
                  <tr key={dept.department} className="border-b hover:bg-muted/50">
                    <td className="p-3 font-medium">
                      {isRTL ? dept.departmentAr : dept.department}
                    </td>
                    <td className="p-3 text-center">{dept.headcount}</td>
                    <td className="p-3 text-center">
                      <Badge variant={dept.turnover > 5 ? 'destructive' : 'secondary'}>
                        {dept.turnover}%
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-2">
                        <Progress value={dept.satisfaction} className="h-2 w-20" />
                        <span className="text-sm">{dept.satisfaction}%</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-2">
                        <Progress value={dept.performance} className="h-2 w-20" />
                        <span className="text-sm">{dept.performance}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              {isRTL ? 'معدل تحقيق الأهداف' : 'Goal Achievement Rate'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">87%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isRTL ? '6 من 8 مؤشرات ضمن الهدف' : '6 of 8 KPIs within target'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              {isRTL ? 'نسبة الاحتفاظ بالموظفين' : 'Employee Retention'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">95.8%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isRTL ? 'أعلى من متوسط الصناعة' : 'Above industry average'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Award className="h-4 w-4" />
              {isRTL ? 'تصنيف أداء الموظفين' : 'Employee Performance Rating'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-500">4.2/5</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isRTL ? 'بناءً على آخر تقييم' : 'Based on last evaluation'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default HRKPIsDashboard;
