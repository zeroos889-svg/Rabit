import { seedTestUsers } from "../server/db/index";

(async () => {
  try {
    await seedTestUsers();
    process.stdout.write("✅ تم إدراج مستخدمي الاختبار بنجاح\n");
  } catch (error) {
    process.stderr.write("❌ فشل إدراج مستخدمي الاختبار: " + (error instanceof Error ? error.message : String(error)) + "\n");
    process.exitCode = 1;
  }
})();
