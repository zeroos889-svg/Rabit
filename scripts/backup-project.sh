#!/bin/bash

# 🔄 سكريبت النسخ الاحتياطي للمشروع
# Rabit Project Backup Script

echo "🚀 بدء عملية النسخ الاحتياطي..."
echo "Starting backup process..."
echo ""

# تحديد التاريخ والوقت
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="rabit-backup-$DATE"

# إنشاء مجلد النسخ الاحتياطية
BACKUP_DIR="/workspaces/backups"
mkdir -p "$BACKUP_DIR"

echo "📦 إنشاء أرشيف مضغوط..."
echo "Creating compressed archive..."

# إنشاء النسخة الاحتياطية (باستثناء المجلدات غير الضرورية)
tar -czf "$BACKUP_DIR/$BACKUP_NAME.tar.gz" \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='dist' \
  --exclude='build' \
  --exclude='.next' \
  --exclude='coverage' \
  --exclude='.cache' \
  --exclude='playwright-report' \
  --exclude='test-results' \
  -C /workspaces Rabit

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ تم إنشاء النسخة الاحتياطية بنجاح!"
    echo "✅ Backup created successfully!"
    echo ""
    echo "📍 الموقع: $BACKUP_DIR/$BACKUP_NAME.tar.gz"
    echo "📍 Location: $BACKUP_DIR/$BACKUP_NAME.tar.gz"
    echo ""
    
    # عرض حجم الملف
    SIZE=$(du -h "$BACKUP_DIR/$BACKUP_NAME.tar.gz" | cut -f1)
    echo "📊 الحجم: $SIZE"
    echo "📊 Size: $SIZE"
    echo ""
    
    # عرض جميع النسخ الاحتياطية
    echo "📂 النسخ الاحتياطية المتوفرة:"
    echo "📂 Available backups:"
    ls -lh "$BACKUP_DIR" | grep "rabit-backup"
else
    echo ""
    echo "❌ فشل إنشاء النسخة الاحتياطية!"
    echo "❌ Backup failed!"
    exit 1
fi

echo ""
echo "💡 لتنزيل النسخة الاحتياطية:"
echo "💡 To download the backup:"
echo "   1. انقر بزر الماوس الأيمن على المجلد في VS Code"
echo "   1. Right-click on the folder in VS Code"
echo "   2. اختر 'Download...'"
echo "   2. Select 'Download...'"
echo ""
echo "✨ تم!"
echo "✨ Done!"
