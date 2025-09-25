import os
from openai import OpenAI

# قراءة المفتاح من Secrets
api_key = os.getenv("OPENAI_API_KEY")

if not api_key:
    raise RuntimeError("❌ المفتاح غير موجود. تأكد أنك أضفته في Secrets باسم OPENAI_API_KEY")

# تهيئة عميل OpenAI
client = OpenAI(api_key=api_key)

# قراءة النص من input.txt
if not os.path.exists("input.txt"):
    raise FileNotFoundError("❌ الملف input.txt غير موجود في المستودع")

with open("input.txt", "r", encoding="utf-8") as f:
    user_text = f.read().strip()

# إرسال النص إلى GPT
response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": user_text}]
)

# أخذ الرد
reply = response.choices[0].message.content

# حفظ النتيجة في analysis_results.md
with open("analysis_results.md", "w", encoding="utf-8") as f:
    f.write("# نتيجة التحليل بواسطة GPT POCKET TOTUR\n\n")
    f.write("### السؤال:\n")
    f.write(user_text + "\n\n")
    f.write("### الإجابة:\n")
    f.write(reply + "\n")

print("✅ تم إنشاء ملف analysis_results.md بنجاح.")
