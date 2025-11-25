import React from "react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-4xl font-extrabold">404</h1>
      <p className="text-neutral-600 dark:text-neutral-400">الصفحة غير موجودة.</p>
      <Link href="/" className="text-purple-600 hover:underline">العودة للصفحة الرئيسية</Link>
    </div>
  );
}
