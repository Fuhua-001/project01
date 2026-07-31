const { execSync } = require('child_process');

// Use prisma to query directly
const { PrismaClient } = require('./app/generated/prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        // 1. Check all product IDs
        const products = await prisma.product.findMany({ select: { id: true, PROD_NAME: true }, take: 10 });
        console.log("=== Sample Product IDs ===");
        products.forEach(p => console.log(`  id: "${p.id}" | name: ${p.PROD_NAME}`));

        // 2. Check all stock CODEs
        const stocks = await prisma.stock.findMany({ select: { CODE: true, PROD_NAME: true }, take: 10 });
        console.log("\n=== Sample Stock CODEs ===");
        stocks.forEach(s => console.log(`  CODE: "${s.CODE}" | name: ${s.PROD_NAME}`));

        // 3. Check how many stock CODEs actually match product IDs
        const productIds = (await prisma.product.findMany({ select: { id: true } })).map(p => p.id);
        const stockCodes = (await prisma.stock.findMany({ select: { CODE: true } })).map(s => s.CODE);
        
        const matched = stockCodes.filter(code => productIds.includes(code));
        const unmatched = stockCodes.filter(code => !productIds.includes(code));
        
        console.log(`\n=== Summary ===`);
        console.log(`Total Products: ${productIds.length}`);
        console.log(`Total Stock records: ${stockCodes.length}`);
        console.log(`Stock records that MATCH a product ID: ${matched.length}`);
        console.log(`Stock records with NO matching product: ${unmatched.length}`);
        if (unmatched.length > 0) {
            console.log(`\nUnmatched CODEs: ${unmatched.slice(0, 5).join(', ')} ...`);
        }
    } catch(e) {
        console.error(e.message);
    } finally {
        await prisma.$disconnect();
    }
}
main();
