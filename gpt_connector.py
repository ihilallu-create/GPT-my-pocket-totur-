import os
import openai

# نجيب المفتاح السري من GitHub Secrets
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise RuntimeError("❌ مفيش مفتاح OpenAI!")

openai.api_key = api_key

# نقرأ النص من ملف input.txt (لو موجود)
if os.path.exists("input.txt"):
    with open("input.txt", "r", encoding="utf-8") as f:
        user_text = f.read()
else:
    user_text = "مرحبا! هذا مجرد اختبار لتشغيل GPT."

# نرسل النص إلى GPT
response = openai.Completion.create(
    model="text-davinci-003",
    prompt=user_text,
    max_tokens=100
)

# نحفظ النتيجة في ملف جديد
with open("analysis_results.md", "w", encoding="utf-8") as f:
    f.write("# GPT Analysis Result\n\n")
    f.write(response.choices[0].text.strip())

print("✅ تم إنشاء ملف analysis_results.md بنجاح!")
