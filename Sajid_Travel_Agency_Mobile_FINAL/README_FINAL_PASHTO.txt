ساجد ټریوال ایجنسۍ — وروستۍ پروژه (V58)

دا ZIP د اپلیکیشن د Android پروژې وروستۍ چمتو شوې نسخه ده، نه مستقیم نصبېدونکی APK.

شاملې برخې:
• مشتریان، ټکټونه، ویزې، پیسې/Payment او مصارف/Expenses
• راپورونه، د نېټې له مخې فلټر، د راپور چاپ
• د معلوماتو کیفیت کتنه او CSV صادرول
• د معلوماتو Backup او د Restore له مخه تایید
• د Android Debug APK جوړولو GitHub Actions workflow
• د Access/SQLite د سفر ادارې د ډیټابیس اړوند فایلونه او CSV قالبونه

ازموینه:
node scripts/test-app.js
پایله: 22/22 regression checks بریالي شول.

د APK جوړول:
1. دا ZIP په کمپیوټر کې Extract کړئ.
2. د پروژې فایلونه خپل GitHub repository ته پورته کړئ.
3. د repository په Actions کې "Build Sajid Travel Agency APK" workflow خلاص کړئ او Run workflow ووهئ.
4. د workflow بریالۍ پایلې وروسته د "Sajid-Travel-Agency-v58-debug-APK" artifact ډاونلوډ کړئ.
5. Artifact Extract کړئ؛ app-debug.apk موبایل ته انتقال او نصب کړئ.

مهم محدودیتونه:
• په دې بسته کې app-debug.apk نشته؛ APK باید د لارښود له مخې جوړ شي.
• د PC او موبایل ترمنځ اتومات آنلاین/Cloud Sync نشته.
• اپلیکیشن تر اوسه د رسمي دفتر د اصلي حسابونو لپاره په خپلواکه توګه تصدیق شوی نه دی؛ مخکې له واقعي استعماله د ازمایښتي معلوماتو، Backup او Restore عملي ازموینه وکړئ.
