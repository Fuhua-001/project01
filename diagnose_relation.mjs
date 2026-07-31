import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

async function main() {
    try {
        // 1. ดึง product id ทั้งหมด
        const products = await prisma.product.findMany({ select: { id: true, PROD_NAME: true } });
        console.log("=== Product IDs (ตัวอย่าง 5 ตัวแรก) ===");
        products.slice(0, 5).forEach(p => console.log(`  "${p.id}" => ${p.PROD_NAME}`));

        // 2. ดึง stock CODE ทั้งหมด
        const stocks = await prisma.stock.findMany({ select: { CODE: true, PROD_NAME: true } });
        console.log("\n=== Stock CODEs (ตัวอย่าง 5 ตัวแรก) ===");
        stocks.slice(0, 5).forEach(s => console.log(`  "${s.CODE}" => ${s.PROD_NAME}`));

        // 3. เช็คว่า Stock.CODE ตรงกับ product.id ไหม
        const productIds = new Set(products.map(p => p.id));
        const matched = stocks.filter(s => productIds.has(s.CODE));
        const unmatched = stocks.filter(s => !productIds.has(s.CODE));

        console.log(`\n=== ผลการตรวจสอบ ===`);
        console.log(`จำนวน Product ทั้งหมด: ${products.length}`);
        console.log(`จำนวน Stock ทั้งหมด: ${stocks.length}`);
        console.log(`Stock ที่เชื่อมกับ Product ได้ (CODE == product.id): ${matched.length}`);
        console.log(`Stock ที่ไม่สามารถเชื่อมกับ Product ได้: ${unmatched.length}`);

        if (unmatched.length > 0) {
            console.log(`\nตัวอย่าง Stock CODE ที่ไม่มีคู่ใน Product:`);
            unmatched.slice(0, 5).forEach(s => console.log(`  CODE: "${s.CODE}"`));
        }
        if (matched.length > 0) {
            console.log(`\nตัวอย่าง Stock CODE ที่เชื่อมกับ Product ได้:`);
            matched.slice(0, 5).forEach(s => console.log(`  CODE: "${s.CODE}"`));
        }
    } catch(e) {
        console.error("Error:", e.message);
    } finally {
        await prisma.$disconnect();
    }
}
main();
