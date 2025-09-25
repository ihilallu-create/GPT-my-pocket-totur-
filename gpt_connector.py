import os
from openai import OpenAI

# جلب المفتاح السري من GitHub Secrets
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise RuntimeError("OPENAI_API_KEY is missing")

client = OpenAI(api_key=api_key)

# قراءة النص من الملف input.txt
if not os.path.exists("input.txt"):
    raise RuntimeError("input.txt file is missing")

with open("input.txt", "r", encoding="utf-8") as f:
    text = f.read()

# إرسال النص إلى GPT
response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": text}]
)

# استخراج الرد
answer = response.choices[0].message.content

# حفظ النتيجة في ملف جديد
with open("analysis_results.md", "w", encoding="utf-8") as f:
    f.write("# GPT Analysis Result\n\n")
    f.write(answer)
