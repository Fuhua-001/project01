import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface AIQuotationRequest {
  prompt: string;
  customers: any[];
  employees: any[];
  products: any[];
  apiKey: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: AIQuotationRequest = await req.json();
    const { prompt, customers, employees, products, apiKey } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'กรุณาระบุ prompt' }, { status: 400 });
    }

    let effectiveKey = apiKey || process.env.GEMINI_API_KEY || '';
    
    // Fallback: Read directly from .env if server wasn't restarted
    if (!effectiveKey) {
      try {
        const envPath = path.join(process.cwd(), '.env');
        if (fs.existsSync(envPath)) {
          const envContent = fs.readFileSync(envPath, 'utf8');
          const match = envContent.match(/GEMINI_API_KEY=["']?([^"'\r\n]+)["']?/);
          if (match && match[1]) {
            effectiveKey = match[1];
          }
        }
      } catch (e) {
        console.error('Error reading .env manually:', e);
      }
    }
    if (!effectiveKey) {
      return NextResponse.json(
        { error: 'ไม่พบ Gemini API Key — กรุณากรอก API Key หรือตั้งค่า GEMINI_API_KEY ใน .env' },
        { status: 400 }
      );
    }

    // Build context for AI
    const customerList = customers.map((c: any) => `- ${c.name} (id: ${c.id}, ติดต่อ: ${c.CT_PERS}, โทร: ${c.PHONE}, email: ${c.email}, PIC: ${c.idPIC})`).join('\n');
    const productList = products.map((p: any) => `- [${p.id}] ${p.PROD_NAME} | ราคาขาย: ${p.SALES_PRICE} บาท | UNIT: ${p.UNIT}`).join('\n');

    const systemPrompt = `คุณคือผู้ช่วย AI สำหรับสร้างใบเสนอราคา (Quotation) ของบริษัท
คุณต้องตอบกลับเป็น JSON เท่านั้น ห้ามมีข้อความอื่นใดนอกจาก JSON

รายชื่อลูกค้าในระบบ:
${customerList || '(ไม่มีข้อมูลลูกค้า)'}

รายการสินค้าในระบบ:
${productList || '(ไม่มีข้อมูลสินค้า)'}

โครงสร้าง JSON ที่ต้องตอบกลับ:
{
  "customerVendor": "ชื่อลูกค้า (ต้องตรงกับรายชื่อลูกค้าในระบบ หากไม่พบให้ใช้ชื่อที่ใกล้เคียงที่สุด)",
  "contact": "ชื่อผู้ติดต่อ",
  "phone": "เบอร์โทรศัพท์",
  "email": "อีเมล",
  "idPIC": "รหัสพนักงาน (PIC) จากลูกค้าที่เลือก",
  "transactionType": "ขาย หรือ ขอซื้อ",
  "paymentTerms": "เงื่อนไขการชำระเงิน เช่น เงินสด, โอนเงิน, เครดิต 30 วัน",
  "creditTerms": 0,
  "priceValidity": "ระยะเวลายืนยันราคา เช่น 30 Days",
  "items": [
    {
      "ITEM_CODE": "รหัสสินค้า (ต้องตรงกับ id ของสินค้าในระบบ)",
      "PROD_NAME": "ชื่อสินค้า",
      "SPEC": "สเปคหรือรายละเอียด",
      "Quantity": 1,
      "UNIT": 1,
      "UNIT_PRICE": 0,
      "Amount": 0,
      "VAT": 0,
      "TOTAL": 0
    }
  ],
  "aiNote": "หมายเหตุจาก AI อธิบายสิ่งที่ทำไป หรือข้อควรระวัง"
}

กฎสำคัญ:
1. Amount = Quantity * UNIT_PRICE
2. VAT = Amount * 0.07
3. TOTAL = Amount + VAT
4. หาก prompt ไม่ระบุสินค้า ให้ items เป็น array ว่าง []
5. ใช้ข้อมูลลูกค้าจากระบบ ถ้าไม่พบชื่อให้แนะนำชื่อที่ใกล้เคียง
6. ตอบกลับเป็น JSON ล้วน ห้ามใส่ \`\`\`json หรือข้อความอื่นใด`;

    const userMessage = `สร้างใบเสนอราคาตามนี้: ${prompt}`;

    // Call Gemini API
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${effectiveKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: systemPrompt + '\n\n' + userMessage }] },
          ],
          generationConfig: {
            temperature: 0.3,
            topP: 0.8,
            maxOutputTokens: 4096,
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('Gemini API error:', errText);
      return NextResponse.json(
        { error: `Gemini API Error: ${geminiRes.status} — ตรวจสอบ API Key ด้วย` },
        { status: 502 }
      );
    }

    const geminiData = await geminiRes.json();
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Strip possible markdown fences
    const cleaned = rawText.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();

    let parsed: any;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: 'AI ตอบกลับในรูปแบบที่ไม่ถูกต้อง', rawText },
        { status: 422 }
      );
    }

    // Auto-fill customer fields from DB if customerVendor matches
    const matchedCustomer = customers.find(
      (c: any) => c.name.toLowerCase() === (parsed.customerVendor || '').toLowerCase()
    );
    if (matchedCustomer) {
      parsed.contact = parsed.contact || matchedCustomer.CT_PERS;
      parsed.phone = parsed.phone || matchedCustomer.PHONE;
      parsed.email = parsed.email || matchedCustomer.email;
      parsed.idPIC = parsed.idPIC || matchedCustomer.idPIC;
    }

    // Recalculate item totals to ensure correctness
    if (Array.isArray(parsed.items)) {
      parsed.items = parsed.items.map((item: any) => {
        const qty = Number(item.Quantity) || 0;
        const price = Number(item.UNIT_PRICE) || 0;
        const amount = qty * price;
        const vat = amount * 0.07;
        return { ...item, Quantity: qty, UNIT_PRICE: price, Amount: amount, VAT: vat, TOTAL: amount + vat };
      });
    }

    return NextResponse.json({ success: true, quotation: parsed });
  } catch (error: any) {
    console.error('AI quotation error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
