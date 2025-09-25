import os

# قراءة المفتاح من الـ Secrets
api_key = os.getenv("OPENAI_API_KEY")

if not api_key:
    raise RuntimeError("❌ المفتاح غير موجود. تأكد أنك أضفته في Secrets باسم OPENAI_API_KEY")

# تجربة: كتابة جملة في ملف analysis_results.md
with open("analysis_results.md", "w", encoding="utf-8") as f:
    f.write("# نتيجة الاختبار\n\n")
    f.write("✅ النظام يعمل بشكل صحيح! المفتاح تم قراءته بنجاح.\n")
