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
import { FC } from "react";

interface AddEmployeeDialogProps {
  isArabic: boolean;
  departments: string[];
  onSubmit: () => void;
  onCancel: () => void;
}

const AddEmployeeDialog: FC<AddEmployeeDialogProps> = ({
  isArabic,
  departments,
  onSubmit,
  onCancel,
}) => {
  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>{isArabic ? "إضافة موظف جديد" : "Add New Employee"}</DialogTitle>
        <DialogDescription>
          {isArabic ? "أدخل بيانات الموظف الجديد" : "Enter new employee information"}
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{isArabic ? "الاسم الكامل" : "Full Name"}</Label>
          <Input placeholder={isArabic ? "أحمد محمد" : "Ahmad Mohammed"} />
        </div>
        <div className="space-y-2">
          <Label>{isArabic ? "البريد الإلكتروني" : "Email"}</Label>
          <Input type="email" placeholder="ahmad@company.com" dir="ltr" />
        </div>
        <div className="space-y-2">
          <Label>{isArabic ? "رقم الجوال" : "Phone"}</Label>
          <Input placeholder="05xxxxxxxx" dir="ltr" />
        </div>
        <div className="space-y-2">
          <Label>{isArabic ? "المسمى الوظيفي" : "Position"}</Label>
          <Input placeholder={isArabic ? "مطور برمجيات" : "Software Developer"} />
        </div>
        <div className="space-y-2">
          <Label>{isArabic ? "القسم" : "Department"}</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder={isArabic ? "اختر القسم" : "Select department"} />
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
          <Label>{isArabic ? "تاريخ البدء" : "Start Date"}</Label>
          <Input type="date" />
        </div>
        <div className="space-y-2">
          <Label>{isArabic ? "الراتب الأساسي" : "Base Salary"}</Label>
          <Input type="number" placeholder="12000" dir="ltr" />
        </div>
        <div className="space-y-2">
          <Label>{isArabic ? "الحالة" : "Status"}</Label>
          <Select defaultValue="active">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">{isArabic ? "نشط" : "Active"}</SelectItem>
              <SelectItem value="on-leave">{isArabic ? "في إجازة" : "On Leave"}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          {isArabic ? "إلغاء" : "Cancel"}
        </Button>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600" onClick={onSubmit}>
          {isArabic ? "إضافة" : "Add"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default AddEmployeeDialog;
