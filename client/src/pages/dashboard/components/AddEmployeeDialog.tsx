import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FC, useMemo } from "react";

interface AddEmployeeDialogProps {
  isArabic: boolean;
  departments: readonly string[];
  onSubmit: () => void;
  onCancel: () => void;
}

// Translations object to reduce cognitive complexity
const translations = {
  ar: {
    title: "إضافة موظف جديد",
    description: "أدخل بيانات الموظف الجديد",
    fullName: "الاسم الكامل",
    fullNamePlaceholder: "أحمد محمد",
    email: "البريد الإلكتروني",
    phone: "رقم الجوال",
    position: "المسمى الوظيفي",
    positionPlaceholder: "مطور برمجيات",
    department: "القسم",
    departmentPlaceholder: "اختر القسم",
    startDate: "تاريخ البدء",
    baseSalary: "الراتب الأساسي",
    status: "الحالة",
    active: "نشط",
    onLeave: "في إجازة",
    cancel: "إلغاء",
    add: "إضافة",
  },
  en: {
    title: "Add New Employee",
    description: "Enter new employee information",
    fullName: "Full Name",
    fullNamePlaceholder: "Ahmad Mohammed",
    email: "Email",
    phone: "Phone",
    position: "Position",
    positionPlaceholder: "Software Developer",
    department: "Department",
    departmentPlaceholder: "Select department",
    startDate: "Start Date",
    baseSalary: "Base Salary",
    status: "Status",
    active: "Active",
    onLeave: "On Leave",
    cancel: "Cancel",
    add: "Add",
  },
};

const AddEmployeeDialog: FC<AddEmployeeDialogProps> = ({
  isArabic,
  departments,
  onSubmit,
  onCancel,
}) => {
  const t = useMemo(() => (isArabic ? translations.ar : translations.en), [isArabic]);

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>{t.title}</DialogTitle>
        <DialogDescription>{t.description}</DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t.fullName}</Label>
          <Input placeholder={t.fullNamePlaceholder} />
        </div>
        <div className="space-y-2">
          <Label>{t.email}</Label>
          <Input type="email" placeholder="ahmad@company.com" dir="ltr" />
        </div>
        <div className="space-y-2">
          <Label>{t.phone}</Label>
          <Input placeholder="05xxxxxxxx" dir="ltr" />
        </div>
        <div className="space-y-2">
          <Label>{t.position}</Label>
          <Input placeholder={t.positionPlaceholder} />
        </div>
        <div className="space-y-2">
          <Label>{t.department}</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder={t.departmentPlaceholder} />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{t.startDate}</Label>
          <Input type="date" />
        </div>
        <div className="space-y-2">
          <Label>{t.baseSalary}</Label>
          <Input type="number" placeholder="12000" dir="ltr" />
        </div>
        <div className="space-y-2">
          <Label>{t.status}</Label>
          <Select defaultValue="active">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">{t.active}</SelectItem>
              <SelectItem value="on-leave">{t.onLeave}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          {t.cancel}
        </Button>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600" onClick={onSubmit}>
          {t.add}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default AddEmployeeDialog;
