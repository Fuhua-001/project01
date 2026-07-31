# 🛠️ บันทึกการแก้ไข: ระบบ Customer ไม่สามารถเพิ่มข้อมูลได้
**วันที่:** 31 กรกฎาคม 2569  
**ไฟล์ที่เกี่ยวข้อง:** `prisma/schema.prisma`, `app/dashboard/customers/actions.ts`, `app/dashboard/customers/AddCustomerForm.tsx`

---

## 🔍 ปัญหาที่พบ (Symptoms)

เมื่อผู้ใช้กรอกข้อมูลลูกค้าและกดบันทึก ระบบแสดง Error และไม่บันทึกข้อมูลเข้าฐานข้อมูล

---

## 📚 ศัพท์ที่ควรรู้ก่อน

### 1. `Prisma Schema` คืออะไร?
> ไฟล์ `prisma/schema.prisma` เป็นเหมือน **"พิมพ์เขียว"** ของฐานข้อมูล  
> เราเขียนไว้ว่าตารางแต่ละตัวมี column อะไรบ้าง และแต่ละ column เก็บข้อมูลประเภทไหน  

```prisma
model Customer {
  id    Int    @id @default(autoincrement())  // รหัส (ตัวเลข, รันเองอัตโนมัติ)
  name  String                                // ชื่อ (ตัวอักษร)
  PHONE Int                                   // เบอร์โทร (ตัวเลข) ← ตรงนี้คือปัญหา!
}
```

---

### 2. Data Types พื้นฐานใน Prisma

| Type | ความหมาย | ตัวอย่างค่า | เก็บใน PostgreSQL เป็น |
|---|---|---|---|
| `Int` | จำนวนเต็ม | `42`, `1000` | `integer` (32-bit, รับได้สูงสุด ~2.1 พันล้าน) |
| `String` | ตัวอักษร/ข้อความ | `"สมชาย"`, `"0812345678"` | `text` |
| `Float` | ทศนิยม | `3.14`, `99.5` | `double precision` |
| `Boolean` | จริง/เท็จ | `true`, `false` | `boolean` |
| `DateTime` | วันที่และเวลา | `2026-07-31T09:00:00Z` | `timestamp` |

> **`?` (เครื่องหมายคำถาม)** หลัง Type หมายความว่า "ไม่บังคับ (Optional)" เว้นว่างได้  
> เช่น `String?` = เป็น String แต่จะไม่กรอกก็ได้

---

### 3. `@id @default(autoincrement())` คืออะไร?

```prisma
id Int @id @default(autoincrement())
```

- **`@id`** = บอกว่า column นี้คือ **Primary Key** (รหัสหลักที่ไม่ซ้ำกัน)
- **`@default(autoincrement())`** = ให้ **ฐานข้อมูลรันหมายเลขให้เองอัตโนมัติ** (1, 2, 3, 4...)  
  → เราไม่ต้องกรอก `id` เอง ห้ามส่งค่านี้ไปด้วยเด็ดขาด!

---

### 4. `Prisma Client` คืออะไร?

> **Prisma Client** คือ "ตัวกลาง" ที่ Next.js ใช้คุยกับฐานข้อมูล  
> มันถูก **generate (สร้าง)** ขึ้นมาจาก `schema.prisma` โดยคำสั่ง:

```bash
npx prisma generate
```

> ⚠️ **สำคัญมาก:** ทุกครั้งที่แก้ `schema.prisma` **ต้องรัน `generate` ใหม่เสมอ**  
> ไม่เช่นนั้น Prisma Client จะยังใช้ข้อมูลเก่าอยู่ และทำให้เกิด Error ได้!

---

### 5. `Integer Overflow` คืออะไร?

> เกิดขึ้นเมื่อตัวเลขที่เราพยายามเก็บ **มีขนาดใหญ่เกินกว่าที่ประเภทข้อมูลรับได้**

| ประเภท | รับค่าได้สูงสุด |
|---|---|
| `Int` (32-bit) | 2,147,483,647 (ประมาณ 2.1 พันล้าน) |
| `BigInt` (64-bit) | 9,223,372,036,854,775,807 |

**ตัวอย่างที่เกิดในโปรเจกต์นี้:**  
เลขประจำตัวผู้เสียภาษี 13 หลัก = `1234567890123`  
→ ตัวเลขนี้ใหญ่กว่า `Int` รับได้ → Database ปฏิเสธ → **Error!**

---

### 6. `NaN` (Not a Number) คืออะไร?

> เกิดขึ้นเมื่อ JavaScript พยายาม **แปลงข้อความที่ไม่ใช่ตัวเลขให้เป็นตัวเลข**

```javascript
Number("")        // → NaN  (แปลง string ว่างเปล่าไม่ได้)
Number("สมชาย")  // → NaN  (แปลงภาษาไทยไม่ได้)
Number("081")     // → 81   (เลข 0 นำหน้าหาย!)
Number("081-xxx") // → NaN  (มีขีดก็แปลงไม่ได้)
```

> ถ้าส่ง `NaN` ไปให้ Prisma ที่คาดหวัง `Int` → Prisma จะมองว่า "ไม่มีค่า" → **Error: Argument is missing**

---

### 7. `Server Action` (`actions.ts`) คืออะไร?

> ใน Next.js เราสามารถเขียน **ฟังก์ชันที่ทำงานบน Server** ไว้ในไฟล์ที่ขึ้นต้นด้วย `"use server"`  
> ฟังก์ชันนี้จะรับข้อมูลจากฟอร์ม แล้วนำไปบันทึกลงฐานข้อมูลผ่าน Prisma

```typescript
"use server"; // ← บอก Next.js ว่าไฟล์นี้ทำงานบน Server เท่านั้น

export async function createCustomer(data: CustomerInput) {
    await prisma.customer.create({ data: { ... } });
}
```

---

### 8. `psql` คืออะไร?

> **psql** คือโปรแกรม command-line สำหรับคุยกับ **PostgreSQL** โดยตรง  
> ใช้ได้เมื่อ Prisma tools ทำงานไม่ได้ (เช่น กรณีนี้ที่ `prisma db push` รันไม่ได้)

```bash
# คำสั่งพื้นฐาน
psql -h localhost -U postgres -d crm_db   # เข้าไปใน database

# ดูโครงสร้างตาราง
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'Customer';

# เปลี่ยนประเภทข้อมูลของ column
ALTER TABLE "Customer" ALTER COLUMN "PHONE" TYPE TEXT USING "PHONE"::TEXT;
```

---

### 9. `ALTER TABLE` คืออะไร?

> คำสั่ง SQL สำหรับ **แก้ไขโครงสร้างตาราง** ที่มีอยู่แล้วในฐานข้อมูล

```sql
-- เปลี่ยนประเภทข้อมูลของ column
ALTER TABLE "ชื่อตาราง" ALTER COLUMN "ชื่อ_column" TYPE TEXT USING "ชื่อ_column"::TEXT;
--                                                                                 ^^^^^^^^^^^^^^^^^^^^^^^^
--                                                    USING บอกวิธีแปลงค่าเก่า → ประเภทใหม่
--                                                    ::TEXT หมายถึง "แปลงเป็น text"
```

---

### 10. Webpack Cache คืออะไร?

> **Webpack** คือ tool ที่ Next.js ใช้รวมและ compile โค้ดก่อนส่งให้ browser  
> มันมี **Cache** เพื่อให้ compile เร็วขึ้น โดย**บันทึกผลลัพธ์เก่าไว้**  
> 
> ⚠️ **ปัญหา:** ถ้าเราแก้ไขไฟล์ที่สำคัญ (เช่น Prisma Client) แต่ไม่ restart dev server  
> Webpack อาจยังใช้ cache เก่าอยู่ → ทำให้ยังเกิด Error เดิมแม้แก้โค้ดแล้ว!  
>
> **วิธีแก้:** ต้อง **restart dev server** หลังจากแก้ไขสำคัญเสมอ

---

## 🐛 สาเหตุทั้งหมดที่พบ (Root Causes)

### ❌ สาเหตุที่ 1: ประเภทข้อมูลใน Schema ไม่ถูกต้อง

**Schema เดิม:**
```prisma
model Customer {
  idPIC       Int     // ← ปัญหา: ส่งข้อความมาจะพัง
  TaxIDNumber Int?    // ← ปัญหา: เลข 13 หลักเกิน Int ที่รับได้
  PHONE       Int     // ← ปัญหา: เลข 0 นำหน้าหาย, รับ "-" ไม่ได้
}
```

**Schema ที่แก้แล้ว:**
```prisma
model Customer {
  idPIC       String  // ✅ รับทั้งตัวเลขและตัวอักษร
  TaxIDNumber String? // ✅ รับเลข 13 หลักได้สบาย
  PHONE       String  // ✅ รับ "081-234-5678" หรือ "0812345678" ได้ทุกรูปแบบ
}
```

---

### ❌ สาเหตุที่ 2: ส่ง `id` ไปทั้งที่ Database รันให้เองอัตโนมัติ

**โค้ดเดิม (ผิด):**
```typescript
await prisma.customer.create({
    data: {
        id: Number(data.customerId),  // ← Error: Unknown argument `id`
        name: data.name,
        ...
    }
})
```

**โค้ดที่แก้แล้ว (ถูก):**
```typescript
await prisma.customer.create({
    data: {
        // ไม่ต้องส่ง id มา! ให้ DB รันให้เองผ่าน autoincrement()
        name: data.name,
        ...
    }
})
```

---

### ❌ สาเหตุที่ 3: `idPIC` กลายเป็น `NaN` ก่อนส่งให้ Prisma

**โค้ดเดิม (ผิด):**
```typescript
idPIC: Number(idPIC)  // ถ้า idPIC = "" → Number("") = NaN
                      // Prisma มองว่าไม่มีค่า → Error: Argument `idPIC` is missing
```

**โค้ดที่แก้แล้ว (ถูก):**
```typescript
// เปลี่ยน idPIC เป็น String ทั้งหมด → ไม่มีปัญหา NaN อีกต่อไป
idPIC: data.idPIC  // ส่งเป็น string ตรงๆ
```

---

### ❌ สาเหตุที่ 4: Prisma Client ที่ generate ไว้ล้าสมัย

แม้จะแก้ `schema.prisma` แล้ว แต่ **Prisma Client** ยังใช้ข้อมูลเก่าอยู่  
ทำให้ยังเกิด Error: `Expected Int or Null, provided String`

**วิธีแก้ (ต้องทำทุกครั้งที่แก้ schema):**
```bash
# 1. สร้าง Prisma Client ใหม่จาก schema ล่าสุด
npx prisma generate

# 2. Restart dev server เพื่อล้าง Webpack cache เก่า
# (ปิดแล้วเปิด `npm run dev` ใหม่)
```

---

## ✅ สรุปขั้นตอนการแก้ไขทั้งหมด

```
1. แก้ prisma/schema.prisma
   └── เปลี่ยน PHONE, TaxIDNumber, idPIC จาก Int → String

2. แก้ app/dashboard/customers/actions.ts
   ├── ลบ id: Number(data.customerId) ออก
   ├── เปลี่ยน idPIC: number → string
   └── ลบ Number() ที่ครอบ phone, taxIDNumber, idPIC ออก

3. แก้ app/dashboard/customers/AddCustomerForm.tsx
   ├── ลบช่อง Input "รหัสลูกค้า (ID)" ออก
   └── เปลี่ยน input idPIC กลับเป็น type="text"

4. Migrate ฐานข้อมูลโดยตรงผ่าน psql (เพราะ prisma db push รันไม่ได้)
   └── ALTER TABLE "Customer" ALTER COLUMN ... TYPE TEXT

5. รัน npx prisma generate (สร้าง Prisma Client ใหม่)

6. Restart dev server (ล้าง Webpack cache)
```

---

## 🔑 หลักการสำคัญที่ได้เรียนรู้

> **1. Schema = Blueprint ของ DB**  
> แก้ Schema แล้วต้อง Migrate DB และ Generate Client เสมอ — ขาดขั้นตอนไหนไม่ได้

> **2. เบอร์โทร, เลขบัตร, รหัส → ใช้ String เสมอ**  
> แม้จะ "ดูเหมือนตัวเลข" แต่ถ้าไม่ได้ใช้คำนวณ ให้เก็บเป็น String  
> เหตุผล: เลข 0 นำหน้าจะหายไปถ้าเก็บเป็น Int, และ 13 หลักเกิน Int ที่รับได้

> **3. `autoincrement()` → ห้ามส่ง id เอง**  
> ถ้า field ใดมี `@default(autoincrement())` ห้ามส่งค่านั้นใน `prisma.create()`

> **4. Restart dev server หลังแก้ Prisma**  
> Webpack cache อาจทำให้การแก้ไขไม่มีผล ต้อง restart ทุกครั้ง

---

## 📁 ไฟล์ที่ถูกแก้ไขในครั้งนี้

| ไฟล์ | สิ่งที่เปลี่ยนแปลง |
|---|---|
| `prisma/schema.prisma` | `PHONE`, `TaxIDNumber`, `idPIC` → `String` |
| `app/dashboard/customers/actions.ts` | ลบ `id`, ลบ `Number()`, แก้ type เป็น string |
| `app/dashboard/customers/AddCustomerForm.tsx` | ลบช่อง customerId, แก้ input type, ลบ validation เก่า |
| **PostgreSQL Database** | `ALTER COLUMN` PHONE, TaxIDNumber, idPIC → `TEXT` |
