# 📚 บันทึกคำอธิบายการทำงานของระบบ (ฉบับคู่มือสอนงาน)
*วันที่บันทึก: 4 สิงหาคม 2026*

ยินดีต้อนรับสู่บันทึกคำอธิบายการทำงานของระบบฉบับเรียนรู้และสอนงานครับ! เอกสารฉบับนี้จัดทำขึ้นเพื่ออธิบายหลักการทำงาน เทคนิคการเขียนโค้ด และแนวคิดเบื้องหลังของฟีเจอร์สำคัญที่ถูกพัฒนาเพิ่มเข้ามาในระบบ ได้แก่ **ระบบพิมพ์ใบเสนอราคา PDF**, **ระบบหน้าโหลดโลโก้ (Login Loading Screen)** และ **ระบบผู้ช่วยอัจฉริยะ AI CRM Copilot** 

---

## 📖 บทที่ 1: ระบบออกเอกสารใบเสนอราคา PDF & Live Preview (`QuotationPDF.tsx`)

### 🎯 เป้าหมายของบทนี้
เข้าใจวิธีการแปลงข้อมูลใน React ให้กลายเป็นเอกสาร **ใบเสนอราคาขนาดมาตรฐาน A4** ที่สามารถพรีวิวสดแบบ Real-time และกดดาวน์โหลดเป็นไฟล์ PDF ได้

---

### 1.1 การใช้ `React.forwardRef` สำหรับการจับภาพจอ (DOM Capture)

ปกติใน React หากเราต้องการให้ฟังก์ชันภายนอก (เช่น ปุ่มดาวน์โหลด PDF) สามารถเข้าถึงตัวโครงสร้าง HTML (DOM element) ของหน้าใบเสนอราคาได้ เราต้องใช้ `React.forwardRef`

```tsx
// app/dashboard/quotations/QuotationPDF.tsx
export const QuotationPDF = React.forwardRef<HTMLDivElement, QuotationPDFProps>(({
    number, customerVendor, contact, phone, email, idPIC, creatorName,
    transactionType, paymentTerms, creditTerms, priceValidity, items, docDate
}, ref) => {
```

#### 💡 อธิบายโค้ด (แบบสอน):
- **`ref` (Reference)**: เปรียบเหมือน "สายสิญจน์" หรือ "พิกัด" ที่ปักไว้ตรงตัวกล่องใบเสนอราคา เพื่อให้ไลบรารี `html2canvas` รู้ว่า *ต้องจับภาพเฉพาะพื้นที่ตรงนี้* นำไปแปลงเป็นรูปภาพ
- **`forwardRef`**: เป็นฟังก์ชันของ React ที่ยอมให้ส่วนประกอบลูก (Child Component) ส่งผ่าน `ref` กลับไปให้ส่วนประกอบแม่ (Parent Component) เรียกใช้งานได้

---

### 1.2 เทคนิคการแบ่งหน้าอัตโนมัติ (Multi-Page A4 Pagination)

กระดาษ A4 มีความสูงจำกัด หากลูกค้าสั่งซื้อสินค้า 20-30 รายการ หากใส่ในหน้าเดียว ข้อความจะหลุดกระดาษ! เราจึงใช้การคำนวณแบ่งหน้าอัตโนมัติ:

```tsx
const ITEMS_PER_PAGE = 12; // กำหนดให้ 1 หน้ามีสินค้าได้สูงสุด 12 รายการ
const pages = [];

for (let i = 0; i < items.length; i += ITEMS_PER_PAGE) {
    pages.push(items.slice(i, i + ITEMS_PER_PAGE));
}
```

#### 💡 อธิบายโค้ด (แบบสอน):
- **`items.slice(start, end)`**: คำสั่งตัดแบ่ง Array ตามจำนวนรายการที่ต้องการ เช่น 
  - รอบแรก `items.slice(0, 12)` -> ได้สินค้าชิ้นที่ 1-12 (หน้า 1)
  - รอบสอง `items.slice(12, 24)` -> ได้สินค้าชิ้นที่ 13-24 (หน้า 2)
- จากนั้นเราวนลูป `.map()` สร้างแผ่นกระดาษขนาด A4 (`width: 210mm, height: 297mm`) ตามจำนวนหน้าจริงที่คำนวณได้

---

### 1.3 การนำรูปโลโก้บริษัทมาใส่ในส่วนหัวเอกสาร

```tsx
{/* eslint-disable-next-line @next/next/no-img-element */}
<img 
    src="/logo.jpg" 
    alt="Company Logo" 
    style={{ height: '70px', width: 'auto', objectFit: 'contain', borderRadius: '6px' }} 
/>
```

#### 💡 อธิบายโค้ด (แบบสอน):
- ใน Next.js ไฟล์ภาพที่วางไว้ในโฟลเดอร์ `public/` (เช่น `public/logo.jpg`) จะถูกมองว่าเป็น **Root Assets**
- เราสามารถอ้างอิง path ได้โดยตรงด้วย `/logo.jpg` โดยไม่ต้องเขียน `../public/logo.jpg`
- กำหนด `objectFit: 'contain'` เพื่อให้รูปสัดส่วนไม่เบี้ยวไม่ว่าจะย่อหรือขยายขนาด

---

## 📖 บทที่ 2: ระบบ Login & Full-Screen Logo Loading Screen

### 🎯 เป้าหมายของบทนี้
เข้าใจวิธีการสร้างประสบการณ์ผู้ใช้ (User Experience) ที่ยอดเยี่ยม ด้วยการสร้างหน้าสแปลชสกรีน (Splash Screen) โหลดโลโก้เมื่อกดเข้าสู่ระบบ

---

### 2.1 การสร้าง Reusable Loading Component (`LogoLoadingScreen.tsx`)

เราแยกโค้ดหน้าโหลดออกมาเป็นคอมโพเนนต์ส่วนกลาง เพื่อให้เรียกใช้ซ้ำได้ง่ายและไม่รบกวนโค้ดฟอร์มเข้าสู่ระบบ

```tsx
// app/components/LogoLoadingScreen.tsx
export default function LogoLoadingScreen({
  message = "กำลังเข้าสู่ระบบ...",
  subMessage = "ระบบกำลังจัดเตรียมข้อมูลและโหลดหน้าต่างการทำงาน"
}: LogoLoadingScreenProps) {
  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col items-center justify-center p-4">
      {/* Background Ambient Glow */}
      <div className="absolute w-[350px] h-[350px] bg-indigo-600/30 blur-[100px] rounded-full animate-pulse"></div>
      
      {/* Logo Container */}
      <img src="/logo.jpg" className="w-32 h-32 object-contain rounded-2xl animate-bounce" />
    </div>
  );
}
```

#### 💡 อธิบายโค้ด (แบบสอน):
- **`fixed inset-0 z-[9999]`**: เป็นการสั่งให้กล่องนี้ตรึงอยู่เต็มหน้าจอ (Overlay) ทับทุกอย่างบนเว็บด้วยชั้น `z-index` ที่สูงมากๆ
- **`blur-[100px]` & `animate-pulse`**: เทคนิคการสร้างดวงไฟเรืองแสงด้านหลัง (Glow effect) ช่วยให้โลโก้ดูโดดเด่นและมีมิติสไตล์แอปพลิเคชันยุคใหม่

---

### 2.2 การควบคุมจังหวะการเข้าสู่ระบบใน `LoginForm.tsx`

```tsx
// app/auth/LoginForm.tsx
const [isLoading, setIsLoading] = useState(false);

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault(); // ป้องกันการรีเฟรชหน้าเว็บ
  setIsLoading(true); // 1. สั่งเปิดหน้าโหลดเต็มจอ
  
  // 2. หน่วงเวลา 1.8 วินาที เพื่อให้ Animation แสดงความพรีเมียม ก่อนเปลี่ยนหน้า
  setTimeout(() => {
    router.push('/dashboard');
  }, 1800);
};
```

#### 💡 อธิบายโค้ด (แบบสอน):
1. เมื่อกด Submit ค่า `isLoading` เปลี่ยนเป็น `true` -> เงื่อนไข `{isLoading && <LogoLoadingScreen />}` จะทำงานทันที
2. ฟังก์ชัน `setTimeout` ช่วยให้ผู้ใช้ได้เห็น Animation อย่างนุ่มนวล จากนั้นจึงใช้ `router.push('/dashboard')` พาลูกค้าไปยังแดชบอร์ด

---

## 📖 บทที่ 3: ระบบ AI CRM Copilot & High-Precision Fallback Parser

### 🎯 เป้าหมายของบทนี้
เข้าใจโครงสร้างการทำงานของ **AI Copilot** ที่รับคำสั่งภาษาธรรมดามาวิเคราะห์และเปลี่ยนเป็นข้อมูลสำหรับสั่งการระบบ CRM

---

### 3.1 การฉีดข้อมูลบริบท (Context Injection) ใน `app/api/smart-quotation/route.ts`

AI ไม่สามารถรู้ข้อมูลในระบบเราได้เอง เว้นแต่เราจะส่งข้อมูลในฐานข้อมูลของเราไปให้ AI อ่านด้วย เราจึงทำสิ่งที่เรียกว่า **Context Injection**:

```tsx
// แปลงตารางลูกค้า, สินค้า, พนักงาน ให้เป็นข้อความส่งเข้าไปใน System Prompt
const customerList = selectedCustomers.map((c) => `- id: "${c.id}", name: "${c.name}"`).join("\n");
const productList = selectedProducts.map((p) => `- id: "${p.id}", name: "${p.PROD_NAME}", price: ${p.SALES_PRICE}`).join("\n");

const systemPrompt = `คุณคือ AI CRM Copilot ภาษาไทย
ข้อมูลเดิมในระบบมีดังนี้:
=== ลูกค้า ===
${customerList}

=== สินค้า ===
${productList}
...`;
```

#### 💡 อธิบายโค้ด (แบบสอน):
- การฉีดข้อมูลแบบนี้เรียกว่า **RAG (Retrieval-Augmented Generation) เบื้องต้น** ช่วยให้ AI สามารถแมตช์คำขอของผู้ใช้ (เช่น *"ทำใบเสนอราคาให้สยามออโต้"*) เข้ากับ `id` และข้อมูลจริงในฐานข้อมูลได้อย่างถูกต้อง

---

### 3.2 ระบบสำรองป้องกันระบบล่ม (High-Precision Fallback Parser)

หากอินเทอร์เน็ตหลุด หรือ API ของ AI (Groq/Llama) เกิด Rate Limit หรือตอบกลับช้า ระบบเราต้อง **ไม่ล่ม**! เราจึงสร้างฟังก์ชันสำรองขึ้นมา:

```tsx
// หากเรียก Groq API ไม่สำเร็จ หรือได้ผลลัพธ์ที่ไม่สมบูรณ์
if (!parsed) {
  console.log("ใช้ระบบ High-Precision Fallback Parser สำรอง");
  parsed = parsePromptFallback(message, customers, products, employees);
}
```

#### 💡 อธิบายโค้ด (แบบสอน):
- `parsePromptFallback`: เป็นระบบ Rule-Based ที่ใช้ **Regular Expression (Regex)** และการค้นหาข้อความแบบตรงจุด
- หากผู้ใช้พิมพ์สั่งงาน ระบบสำรองจะแกะคำสำคัญ (Keywords) เช่น *"สุ่มใบเสนอราคา"*, *"ลบลูกค้า"*, *"แก้ไขสินค้า"* แล้วสร้างข้อมูลตอบกลับให้อัตโนมัติทันที 
- ทำให้ระบบ **ความน่าเชื่อถือสูง 100% (High Availability)** ใช้งานได้ตลอดเวลาแม้ไม่มี AI API!

---

## 💡 สรุปภาพรวมสถาปัตยกรรม (Architecture Summary)

| ฟีเจอร์ | คอมโพเนนต์หลัก | เทคโนโลยี/หลักการที่ใช้ |
|---|---|---|
| **ใบเสนอราคา PDF** | `QuotationPDF.tsx` | React `forwardRef`, DOM Canvas, A4 Pagination Math |
| **Splash Loading** | `LogoLoadingScreen.tsx`, `LoginForm.tsx` | Tailwind CSS Glow, Overlay Z-Index, Custom Keyframe Animation |
| **AI CRM Copilot** | `smart-quotation/route.ts`, `AIQuotationClient.tsx` | LLM Context Injection, Strict JSON Formatting, Regex Fallback Engine |

---
*บันทึกนี้ถูกเขียนขึ้นเพื่อสรุปองค์ความรู้การพัฒนาของระบบอย่างละเอียด สามารถใช้เป็นคู่มืออ้างอิงในการศึกษาหรือต่อยอดโค้ดในอนาคตได้เลยครับ!* 🚀
