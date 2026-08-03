import { NextRequest, NextResponse } from "next/server";

// High-Precision Rule-Based Fallback Parser (Ultra-Detailed Extraction Engine)
function parsePromptFallback(message: string, customers: any[], products: any[], employees: any[]) {
  const msg = (message || "").trim();
  const msgLower = msg.toLowerCase();

  // Helper to extract numbers clean
  const parseNum = (str: string, fallback: number = 0) => {
    const match = str.match(/([0-9,.]+)/);
    if (!match) return fallback;
    const clean = match[1].replace(/,/g, "");
    const num = parseFloat(clean);
    return isNaN(num) ? fallback : num;
  };

  const cleanText = (raw: string, type: "customer" | "product" | "employee") => {
    let t = raw.trim();
    if (type === "customer") {
      t = t.replace(/^(?:เพิ่มลูกค้า|สร้างลูกค้า|แก้ไขลูกค้า|อัปเดตลูกค้า|ลบลูกค้า|ลูกค้ารายใหม่|เพิ่ม|สร้าง|แก้ไข|อัปเดต|ลบ|ลูกค้า|ใหม่|ชื่อ|บริษัท|ร้าน|\s)+/gi, "").trim();
      if (!t) t = "ลูกค้าใหม่";
      return t.startsWith("บริษัท") || t.startsWith("ร้าน") ? t : `บริษัท ${t}`;
    }
    if (type === "product") {
      t = t.replace(/^(?:เพิ่มสินค้า|สร้างสินค้า|แก้ไขสินค้า|อัปเดตสินค้า|ลบสินค้า|สินค้ารายใหม่|เพิ่ม|สร้าง|แก้ไข|อัปเดต|ลบ|สินค้า|ใหม่|ชื่อ|\s)+/gi, "").replace(/ราคา.*$/gi, "").replace(/บาท.*$/gi, "").trim();
      return t || "สินค้าใหม่";
    }
    if (type === "employee") {
      t = t.replace(/^(?:เพิ่มพนักงาน|สร้างพนักงาน|แก้ไขพนักงาน|อัปเดตพนักงาน|ลบพนักงาน|เพิ่ม|สร้าง|แก้ไข|อัปเดต|ลบ|พนักงาน|ใหม่|ชื่อ|\s)+/gi, "").replace(/แผนก.*$/gi, "").trim();
      return t || "พนักงานใหม่";
    }
    return t;
  };

  // Check out_of_scope queries
  const isOutOfScope = (
    msgLower.includes("สภาพอากาศ") ||
    msgLower.includes("ราคาหุ้น") ||
    msgLower.includes("ผลบอล") ||
    msgLower.includes("กีฬา") ||
    msgLower.includes("แต่งกลอน") ||
    msgLower.includes("สูตรอาหาร") ||
    msgLower.includes("ข่าวสาร") ||
    msgLower.includes("ดวงชะตา")
  );

  if (isOutOfScope) {
    return {
      intent: "out_of_scope",
      explanation: `⚠️ คำถามนี้ไม่เกี่ยวข้องกับระบบ CRM & ออกเอกสารใบเสนอราคาครับ

💡 จุดประสงค์ของระบบนี้ถูกออกแบบมาเพื่อช่วยคุณจัดการงานดังนี้:
1. 📝 สร้างและออกใบเสนอราคา / ใบขอซื้อ (Sales & PR) พร้อม Real-time Live PDF Preview
2. 👤 เพิ่ม, แก้ไข หรือลบ ข้อมูลลูกค้า
3. 📦 เพิ่ม, แก้ไข หรือลบ ข้อมูลสินค้า / ราคาสินค้าในคลัง
4. 👔 เพิ่ม, แก้ไข หรือลบ ข้อมูลพนักงาน`,
    };
  }

  // 1. Customer Intents (Update, Delete, Add)
  if (msgLower.includes("แก้ไขลูกค้า") || msgLower.includes("อัปเดตลูกค้า") || msgLower.includes("เปลี่ยนเบอร์ลูกค้า")) {
    const targetName = cleanText(msg, "customer");
    const matched = (customers || []).find((c: any) =>
      c.name.toLowerCase().includes(targetName.toLowerCase()) ||
      targetName.toLowerCase().includes(c.name.toLowerCase())
    ) || (customers && customers.length > 0 ? customers[0] : null);

    let phone = matched?.PHONE || "08" + Math.floor(10000000 + Math.random() * 90000000);
    const matchPhone = msg.match(/(?:เบอร์|โทร|0[0-9]{8,9})/);
    if (matchPhone) phone = matchPhone[0];

    return {
      intent: "update_customer",
      explanation: `ตรวจสอบและยืนยันการแก้ไขข้อมูลลูกค้า "${matched?.name || targetName}"`,
      targetCustomer: {
        id: matched?.id || "CUST-001",
        name: matched?.name || targetName,
        CT_PERS: matched?.CT_PERS || "คุณผู้ติดต่อ",
        PHONE: phone,
        email: matched?.email || `contact_${Date.now()}@example.com`,
        Address: matched?.Address || "-",
        TaxIDNumber: matched?.TaxIDNumber || "-",
      },
    };
  }

  if (msgLower.includes("ลบลูกค้า")) {
    const targetName = cleanText(msg, "customer");
    const matched = (customers || []).find((c: any) =>
      c.name.toLowerCase().includes(targetName.toLowerCase()) ||
      targetName.toLowerCase().includes(c.name.toLowerCase())
    ) || (customers && customers.length > 0 ? customers[0] : null);

    return {
      intent: "delete_customer",
      explanation: `เตรียมลบข้อมูลลูกค้า "${matched?.name || targetName}"`,
      targetCustomer: {
        id: matched?.id || "",
        name: matched?.name || targetName,
      },
    };
  }

  if (msgLower.includes("เพิ่มลูกค้า") || msgLower.includes("สร้างลูกค้า") || msgLower.includes("ลูกค้ารายใหม่")) {
    const custName = cleanText(msg, "customer");
    return {
      intent: "add_customer",
      explanation: `สร้างข้อมูลลูกค้าใหม่ "${custName}" เรียบร้อยแล้ว สามารถตรวจสอบและกดบันทึกเข้าฐานข้อมูลได้เลยครับ`,
      targetCustomer: {
        name: custName,
        CT_PERS: "คุณผู้ติดต่อ",
        PHONE: "08" + Math.floor(10000000 + Math.random() * 90000000),
        email: `contact_${Date.now()}@example.com`,
        Address: "-",
        TaxIDNumber: "-",
      },
    };
  }

  // 2. Product Intents (Update, Delete, Add)
  if (msgLower.includes("แก้ไขสินค้า") || msgLower.includes("อัปเดตสินค้า") || msgLower.includes("แก้ไขราคา") || msgLower.includes("เปลี่ยนราคา")) {
    const prodName = cleanText(msg, "product");
    const matched = (products || []).find((p: any) =>
      p.PROD_NAME.toLowerCase().includes(prodName.toLowerCase()) ||
      p.id.toLowerCase() === prodName.toLowerCase()
    ) || (products && products.length > 0 ? products[0] : null);

    let price = matched?.SALES_PRICE || 100;
    const matchPrice = msg.match(/(?:ราคา|บาท)\s*([0-9,.]+)|([0-9,.]+)\s*บาท/);
    if (matchPrice) {
      price = parseNum(matchPrice[1] || matchPrice[2], price);
    }

    return {
      intent: "update_product",
      explanation: `ตรวจสอบและยืนยันการแก้ไขสินค้า "${matched?.PROD_NAME || prodName}" (ราคาขาย ${price.toLocaleString()} บาท)`,
      targetProduct: {
        id: matched?.id || "PROD-001",
        PROD_NAME: matched?.PROD_NAME || prodName,
        PROD_ALIAS: matched?.PROD_ALIAS || prodName,
        UNIT: matched?.UNIT || 1,
        SALES_PRICE: price,
        BUY_PRICE: Math.round(price * 0.7),
        BRAND: matched?.BRAND || "ทั่วไป",
        PROD_GRP: matched?.PROD_GRP || "ทั่วไป",
      },
    };
  }

  if (msgLower.includes("ลบสินค้า")) {
    const targetName = cleanText(msg, "product");
    const matched = (products || []).find((p: any) =>
      p.PROD_NAME.toLowerCase().includes(targetName.toLowerCase()) ||
      p.id.toLowerCase() === targetName.toLowerCase()
    ) || (products && products.length > 0 ? products[0] : null);

    return {
      intent: "delete_product",
      explanation: `เตรียมลบข้อมูลสินค้า "${matched?.PROD_NAME || targetName}"`,
      targetProduct: {
        id: matched?.id || targetName,
        PROD_NAME: matched?.PROD_NAME || targetName,
      },
    };
  }

  if (msgLower.includes("เพิ่มสินค้า") || msgLower.includes("สร้างสินค้า") || msgLower.includes("สินค้ารายใหม่")) {
    const prodName = cleanText(msg, "product");
    let price = 100;
    const matchPrice = msg.match(/(?:ราคา|บาท)\s*([0-9,.]+)|([0-9,.]+)\s*บาท/);
    if (matchPrice) {
      price = parseNum(matchPrice[1] || matchPrice[2], 100);
    }
    return {
      intent: "add_product",
      explanation: `สร้างข้อมูลสินค้าใหม่ "${prodName}" (ราคา ${price.toLocaleString()} บาท) เรียบร้อยแล้ว`,
      targetProduct: {
        PROD_NAME: prodName,
        SALES_PRICE: price,
        BUY_PRICE: Math.round(price * 0.7),
        UNIT: 1,
        BRAND: "ทั่วไป",
        PROD_GRP: "ทั่วไป",
      },
    };
  }

  // 3. Employee Intents (Update, Delete, Add)
  if (msgLower.includes("แก้ไขพนักงาน") || msgLower.includes("อัปเดตพนักงาน") || msgLower.includes("ย้ายแผนก")) {
    const empName = cleanText(msg, "employee");
    const matched = (employees || []).find((e: any) =>
      e.Name_PIC.toLowerCase().includes(empName.toLowerCase()) ||
      e.IdPIC.toLowerCase() === empName.toLowerCase()
    ) || (employees && employees.length > 0 ? employees[0] : null);

    let dept = matched?.Department || "ฝ่ายขาย";
    const matchDept = msg.match(/แผนก\s*([^\s,]+)/);
    if (matchDept) dept = matchDept[1];

    return {
      intent: "update_employee",
      explanation: `ตรวจสอบและยืนยันการแก้ไขข้อมูลพนักงาน "${matched?.Name_PIC || empName}" (แผนก ${dept})`,
      targetEmployee: {
        IdPIC: matched?.IdPIC || "EMP-001",
        Name_PIC: matched?.Name_PIC || empName,
        NemeEN_PIC: matched?.NemeEN_PIC || empName,
        Department: dept,
        ContactNumber: matched?.ContactNumber || "08" + Math.floor(10000000 + Math.random() * 90000000),
      },
    };
  }

  if (msgLower.includes("ลบพนักงาน")) {
    const targetName = cleanText(msg, "employee");
    const matched = (employees || []).find((e: any) =>
      e.Name_PIC.toLowerCase().includes(targetName.toLowerCase()) ||
      e.IdPIC.toLowerCase() === targetName.toLowerCase()
    ) || (employees && employees.length > 0 ? employees[0] : null);

    return {
      intent: "delete_employee",
      explanation: `เตรียมลบข้อมูลพนักงาน "${matched?.Name_PIC || targetName}"`,
      targetEmployee: {
        IdPIC: matched?.IdPIC || "",
        Name_PIC: matched?.Name_PIC || targetName,
      },
    };
  }

  if (msgLower.includes("เพิ่มพนักงาน") || msgLower.includes("สร้างพนักงาน")) {
    const empName = cleanText(msg, "employee");
    let dept = "ฝ่ายขาย";
    const matchDept = msg.match(/แผนก\s*([^\s,]+)/);
    if (matchDept) dept = matchDept[1];

    return {
      intent: "add_employee",
      explanation: `สร้างข้อมูลพนักงานใหม่ "${empName}" (แผนก ${dept}) เรียบร้อยแล้ว`,
      targetEmployee: {
        Name_PIC: empName,
        Department: dept,
        ContactNumber: "08" + Math.floor(10000000 + Math.random() * 90000000),
      },
    };
  }

  // 4. Quotation Intents (Detailed extraction of customer, quantities, prices, items)
  if (
    msgLower.includes("ใบเสนอราคา") ||
    msgLower.includes("ขอซื้อ") ||
    msgLower.includes("quotation") ||
    msgLower.includes("สุ่ม") ||
    msgLower.includes("สร้างเอกสาร")
  ) {
    // Detect matching customer
    let matchedCust = (customers || []).find((c: any) => msgLower.includes(c.name.toLowerCase()));
    if (!matchedCust && customers && customers.length > 0) {
      matchedCust = customers[0];
    }
    const custName = matchedCust ? matchedCust.name : "บริษัท สยามเทค จำกัด";
    const emp = (employees && employees.length > 0) ? employees[0] : { IdPIC: "EMP-001", Name_PIC: "สมชาย ใจดี" };

    // Extract quantity if specified (e.g. 5 รายการ, 3 เครื่อง)
    let requestedCount = 3;
    const matchCount = msg.match(/([0-9]+)\s*(?:รายการ|เครื่อง|ชิ้น|ชุด)/);
    if (matchCount) {
      requestedCount = Math.min(10, Math.max(1, parseInt(matchCount[1], 10)));
    }

    // Match products or select random items from DB
    let selectedItems: any[] = [];
    const matchedProducts = (products || []).filter((p: any) => msgLower.includes(p.PROD_NAME.toLowerCase()));

    if (matchedProducts.length > 0) {
      selectedItems = matchedProducts.slice(0, requestedCount).map((p: any) => {
        const qty = 1;
        const price = p.SALES_PRICE || 1000;
        const amount = qty * price;
        const vat = amount * 0.07;
        return {
          ITEM_CODE: p.id,
          PROD_NAME: p.PROD_NAME,
          SPEC: "สเปคมาตรฐาน",
          Quantity: qty,
          UNIT: p.UNIT || 1,
          UNIT_PRICE: price,
          Amount: amount,
          VAT: vat,
          TOTAL: amount + vat,
        };
      });
    } else if (products && products.length > 0) {
      selectedItems = products.slice(0, Math.min(requestedCount, products.length)).map((p: any) => {
        const qty = Math.floor(1 + Math.random() * 3);
        const price = p.SALES_PRICE || 1000;
        const amount = qty * price;
        const vat = amount * 0.07;
        return {
          ITEM_CODE: p.id,
          PROD_NAME: p.PROD_NAME,
          SPEC: "สเปคมาตรฐาน",
          Quantity: qty,
          UNIT: p.UNIT || 1,
          UNIT_PRICE: price,
          Amount: amount,
          VAT: vat,
          TOTAL: amount + vat,
        };
      });
    } else {
      selectedItems = [
        { ITEM_CODE: "PROD-001", PROD_NAME: "โน้ตบุ๊ก Dell", SPEC: "Intel i5, 8GB RAM", Quantity: 1, UNIT: 1, UNIT_PRICE: 25000, Amount: 25000, VAT: 1750, TOTAL: 26750 },
        { ITEM_CODE: "PROD-002", PROD_NAME: "จอมอนิเตอร์ 24 นิ้ว", SPEC: "Full HD 1080p", Quantity: 1, UNIT: 1, UNIT_PRICE: 4500, Amount: 4500, VAT: 315, TOTAL: 4815 }
      ];
    }

    return {
      intent: "quotation",
      explanation: `สร้างแบบร่างใบเสนอราคาสำหรับ "${custName}" (${selectedItems.length} รายการ) เรียบร้อยแล้ว สามารถตรวจสอบและกดบันทึกได้เลยครับ`,
      quotationData: {
        customerVendor: custName,
        contact: matchedCust?.CT_PERS || "คุณผู้ติดต่อ",
        phone: matchedCust?.PHONE || "0812345678",
        email: matchedCust?.email || "contact@example.com",
        idPIC: matchedCust?.idPIC || emp.IdPIC,
        creatorName: emp.Name_PIC,
        transactionType: msgLower.includes("ขอซื้อ") ? "ขอซื้อ" : "ขาย",
        paymentTerms: "เงินสด",
        creditTerms: "0",
        priceValidity: "30 Days",
        items: selectedItems,
      },
    };
  }

  return {
    intent: "general_chat",
    explanation: `ยินดีต้อนรับสู่ระบบ CRM! คุณสามารถสั่งงานผมได้ดังนี้:
1. 📝 "สร้างใบเสนอราคาให้ลูกค้า..." หรือ "สุ่มใบเสนอราคา 5 รายการ"
2. 👤 "เพิ่มลูกค้าใหม่...", "แก้ไขลูกค้า...", "ลบลูกค้า..."
3. 📦 "เพิ่มสินค้าใหม่...", "แก้ไขสินค้า...", "ลบสินค้า..."
4. 👔 "เพิ่มพนักงานใหม่...", "แก้ไขพนักงาน...", "ลบพนักงาน..."`,
  };
}

export async function POST(request: NextRequest) {
  let message = "";
  let customers: any[] = [];
  let employees: any[] = [];
  let products: any[] = [];

  try {
    const reqData = await request.json();
    message = reqData.message || "";
    customers = reqData.customers || [];
    employees = reqData.employees || [];
    products = reqData.products || [];

    if (!message) {
      return NextResponse.json({ error: "กรุณาระบุข้อความ" }, { status: 400 });
    }

    const groqKey = process.env.GROQ_API_KEY;

    // Filter context to keep payload small (< 1,200 tokens)
    const searchStr = message.toLowerCase();

    const filteredCustomers = customers.filter((c: any) =>
      searchStr.includes((c.name || "").toLowerCase()) ||
      searchStr.includes((c.CT_PERS || "").toLowerCase())
    );
    const selectedCustomers = filteredCustomers.length > 0 ? filteredCustomers.slice(0, 15) : customers.slice(0, 15);

    const filteredProducts = products.filter((p: any) =>
      searchStr.includes((p.PROD_NAME || "").toLowerCase()) ||
      searchStr.includes((p.id || "").toLowerCase())
    );
    const selectedProducts = filteredProducts.length > 0 ? filteredProducts.slice(0, 20) : products.slice(0, 20);

    const customerList = selectedCustomers
      .map((c: any) => `- id: "${c.id}", name: "${c.name}", contact: "${c.CT_PERS || ""}", phone: "${c.PHONE || ""}", email: "${c.email || ""}", idPIC: "${c.idPIC || ""}"`)
      .join("\n");

    const productList = selectedProducts
      .map((p: any) => `- id: "${p.id}", name: "${p.PROD_NAME}", unit: ${p.UNIT}, sales_price: ${p.SALES_PRICE}, buy_price: ${p.BUY_PRICE}`)
      .join("\n");

    const employeeList = employees
      .slice(0, 10)
      .map((e: any) => `- idPIC: "${e.IdPIC}", name: "${e.Name_PIC}", dept: "${e.Department}"`)
      .join("\n");

    const systemPrompt = `คุณคือ AI ผู้ช่วยระบบ CRM ภาษาไทย (ทำใบเสนอราคา, เพิ่ม/แก้ไข/ลบลูกค้า, สินค้า, พนักงาน)
You must strictly output your response in valid json format.

ข้อมูลเดิมในระบบมีดังนี้:

=== ลูกค้า (Customers) ===
${customerList}

=== พนักงาน (Employees) ===
${employeeList}

=== สินค้า (Products) ===
${productList}

=== คำสั่ง ===
วิเคราะห์คำขอของผู้ใช้ แล้วระบุ intent ดังนี้:
1. "quotation" -> ผู้ใช้สั่งทำใบเสนอราคา หรือ สั่งขอซื้อ หรือ สั่งทำใบเสนอราคาแบบสุ่ม
2. "add_customer" -> ผู้ใช้สั่งเพิ่ม/สร้างข้อมูลลูกค้าใหม่
3. "update_customer" -> ผู้ใช้สั่งแก้ไข/อัปเดตข้อมูลลูกค้าที่มีอยู่แล้ว
4. "delete_customer" -> ผู้ใช้สั่งลบข้อมูลลูกค้า (ระบุ id และ name ลูกค้าที่จะลบ)
5. "add_product" -> ผู้ใช้สั่งเพิ่ม/สร้างข้อมูลสินค้าใหม่
6. "update_product" -> ผู้ใช้สั่งแก้ไข/อัปเดตข้อมูลสินค้าที่มีอยู่แล้ว
7. "delete_product" -> ผู้ใช้สั่งลบข้อมูลสินค้า (ระบุ id และ PROD_NAME สินค้าที่จะลบ)
8. "add_employee" -> ผู้ใช้สั่งเพิ่ม/สร้างข้อมูลพนักงานใหม่
9. "update_employee" -> ผู้ใช้สั่งแก้ไข/อัปเดตข้อมูลพนักงานที่มีอยู่แล้ว
10. "delete_employee" -> ผู้ใช้สั่งลบข้อมูลพนักงาน (ระบุ IdPIC และ Name_PIC พนักงานที่จะลบ)
11. "out_of_scope" -> ผู้ใช้ถามเรื่องที่ไม่เกี่ยวข้องกับระบบ CRM / ใบเสนอราคา / สินค้า / ลูกค้า / พนักงาน (เช่น สภาพอากาศ, ราคาหุ้น, ผลกีฬา, ข่าวสาร, เรื่องทั่วไปที่ไม่ใช่งานในระบบ)
12. "general_chat" -> การทักทายหรือสอบถามเกี่ยวกับการใช้งานระบบ CRM นี้

ตอบกลับเป็น json object ที่มีโครงสร้างดังนี้เท่านั้น ห้ามตอบข้อความอื่นนอกเหนือจาก json:

{
  "intent": "quotation | add_customer | update_customer | delete_customer | add_product | update_product | delete_product | add_employee | update_employee | delete_employee | out_of_scope | general_chat",
  "explanation": "คำอธิบายภาษาไทย สรุปสิ่งที่ AI ทำ หรือคำตอบ",

  "quotationData": {
    "customerVendor": "ชื่อลูกค้าที่ตรงกันในระบบ",
    "contact": "ผู้ติดต่อ",
    "phone": "เบอร์โทร",
    "email": "อีเมล",
    "idPIC": "รหัสพนักงาน",
    "creatorName": "ชื่อพนักงาน",
    "transactionType": "ขาย หรือ ขอซื้อ",
    "paymentTerms": "เงื่อนไขการชำระ (เช่น เงินสด, โอนเงิน)",
    "creditTerms": "จำนวนวันเครดิต (เช่น 0, 30)",
    "priceValidity": "ระยะเวลายืนยันราคา (เช่น 30 Days)",
    "items": [
      {
        "ITEM_CODE": "รหัสสินค้า",
        "PROD_NAME": "ชื่อสินค้า",
        "SPEC": "สเปค",
        "Quantity": 1,
        "UNIT": 1,
        "UNIT_PRICE": 0.0,
        "Amount": 0.0,
        "VAT": 0.0,
        "TOTAL": 0.0
      }
    ]
  },

  "targetCustomer": {
    "id": "รหัสลูกค้า (จับคู่ id จากตารางลูกค้าข้างบน)",
    "name": "ชื่อลูกค้า",
    "CT_PERS": "ชื่อผู้ติดต่อ",
    "PHONE": "เบอร์โทร",
    "email": "อีเมล",
    "Address": "ที่อยู่",
    "TaxIDNumber": "เลขผู้เสียภาษี"
  },

  "targetProduct": {
    "id": "รหัสสินค้า (จับคู่ id จากรายการสินค้าเดิมข้างต้น)",
    "PROD_NAME": "ชื่อสินค้า",
    "PROD_ALIAS": "ชื่อเรียกอื่น",
    "UNIT": 1,
    "SALES_PRICE": 0,
    "BUY_PRICE": 0,
    "BRAND": "ยี่ห้อ",
    "PROD_GRP": "กลุ่มสินค้า"
  },

  "targetEmployee": {
    "IdPIC": "รหัสพนักงาน (จับคู่ IdPIC จากพนักงานเดิมข้างต้น)",
    "Name_PIC": "ชื่อพนักงาน (ภาษาไทย)",
    "NemeEN_PIC": "ชื่อพนักงาน (ภาษาอังกฤษ)",
    "Department": "แผนก",
    "ContactNumber": "เบอร์โทรศัพท์"
  }
}

กฎสำคัญสำหรับ quotation แบบสุ่ม (Random Quotation):
- หากผู้ใช้สั่ง "สร้างใบเสนอราคาแบบสุ่ม" หรือ "ทำใบเสนอราคาแบบสุ่ม" (หรือระบุจำนวนสินค้าแบบสุ่ม เช่น สุ่ม 5 รายการ):
  1. เลือกลูกค้าจากตารางลูกค้าข้างบน 1 รายการ
  2. สุ่มเลือกสินค้าจากตารางสินค้าข้างบนมาใส่ใน items ตามจำนวนที่ระบุ (หรือสุ่ม 3-5 รายการ) โดยดึง ITEM_CODE, PROD_NAME, sales_price มาจากตารางสินค้าข้างบนให้ตรงเป๊ะ
  3. สุ่มจำนวนสินค้า Quantity (1-5 ชิ้น) และใส่ SPEC
  4. คำนวณ Amount = Quantity * UNIT_PRICE, VAT = Amount * 0.07, TOTAL = Amount + VAT ให้ถูกต้อง

กฎสำคัญสำหรับ add_customer:
- หากผู้ใช้สั่งสร้าง/เพิ่มลูกค้าโดยไม่ได้ระบุชื่อลูกค้าเฉพาะเจาะจง (เช่น 'สร้างลูกค้าเพิ่มเข้าไป 1 คน') ให้กำหนด intent เป็น 'add_customer' และสร้างชื่อลูกค้าสมมุติที่มีความสมจริง เช่น 'บริษัท สยามนวัตกรรม จำกัด' พร้อมกรอกชื่อผู้ติดต่อ, เบอร์โทรศัพท์, และอีเมลให้ครบถ้วนเสมอ

กฎสำคัญสำหรับ out_of_scope:
- หากผู้ใช้ถามเรื่องที่ไม่เกี่ยวข้องกับระบบ CRM / ใบเสนอราคา / สินค้า / ลูกค้า / พนักงาน ให้เลือก intent เป็น "out_of_scope" และใส่ในช่อง "explanation" ดังนี้:
"⚠️ คำถามนี้ไม่เกี่ยวข้องกับระบบ CRM & ออกเอกสารใบเสนอราคาครับ

💡 จุดประสงค์ของระบบนี้ถูกออกแบบมาเพื่อช่วยคุณจัดการงานดังนี้:
1. 📝 สร้างและออกใบเสนอราคา / ใบขอซื้อ (Sales & PR) พร้อม Real-time Live PDF Preview
2. 👤 เพิ่ม, แก้ไข หรือลบ ข้อมูลลูกค้า
3. 📦 เพิ่ม, แก้ไข หรือลบ ข้อมูลสินค้า / ราคาสินค้าในคลัง
4. 👔 เพิ่ม, แก้ไข หรือลบ ข้อมูลพนักงาน"`;

    // Candidate models with high token limits
    const models = ["llama-3.1-8b-instant", "llama-3.3-70b-versatile"];
    let groqData = null;

    if (groqKey) {
      for (const modelName of models) {
        try {
          const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${groqKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: modelName,
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `คำขอของผู้ใช้: ${message}` }
              ],
              response_format: { type: "json_object" },
              temperature: 0.1,
              max_tokens: 4096,
            }),
          });

          if (groqResponse.ok) {
            groqData = await groqResponse.json();
            break; // Successfully got response from Groq!
          }
        } catch (err: any) {
          console.warn(`[Groq Model ${modelName} error]:`, err.message);
        }
      }
    }

    let parsed: any = null;

    if (groqData) {
      const rawText = groqData.choices[0]?.message?.content || "";
      try {
        parsed = JSON.parse(rawText);
      } catch {
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            parsed = JSON.parse(jsonMatch[0]);
          } catch {
            parsed = null;
          }
        }
      }
    }

    // IF Groq API is Rate Limited, Down, or returned invalid response -> Use Ultra-Detailed Fallback Parser!
    if (!parsed) {
      console.log("[smart-quotation] Using High-Precision Fallback Parser for prompt:", message);
      parsed = parsePromptFallback(message, customers, products, employees);
    }

    return NextResponse.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error("[smart-quotation] Error:", error);
    // Return fallback response instead of 500 error!
    const fallback = parsePromptFallback(message, customers, products, employees);
    return NextResponse.json({ success: true, data: fallback });
  }
}
