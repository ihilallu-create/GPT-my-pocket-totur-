import os
from openai import OpenAI

# جلب المفتاح من GitHub Secrets
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise RuntimeError("❌ OPENAI_API_KEY is missing")

print("✅ API Key موجود")

client = OpenAI(api_key=api_key)

# التأكد من وجود ملف input.txt
if not os.path.exists("input.txt"):
    raise RuntimeError("❌ input.txt file is missing")

print("✅ ملف input.txt موجود")

# قراءة محتوى input.txt
with open("input.txt", "r", encoding="utf-8") as f:
    text = f.read().strip()

if not text:
    raise RuntimeError("❌ input.txt فارغ")

print(f"📄 محتوى input.txt: {text}")

# إرسال النص إلى GPT
response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": text}]
)

answer = response.choices[0].message.content
print(f"🤖 رد GPT: {answer}")

# حفظ النتيجة في ملف جديد
with open("analysis_results.md", "w", encoding="utf-8") as f:
    f.write("# GPT Analysis Result\n\n")
    f.write(answer)

print("✅ تم إنشاء analysis_results.md بنجاح")
