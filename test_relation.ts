import { PrismaClient } from './app/generated/prisma';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Testing connection between Product and Stock...");

        const productWithStock = await prisma.product.findFirst({
            include: {
                stock: true
            }
        });

        if (productWithStock) {
            console.log("Successfully fetched Product with its related Stock!");
            console.log(`Product ID: ${productWithStock.id}`);
            console.log(`Product Name: ${productWithStock.PROD_NAME}`);
            
            if (productWithStock.stock) {
                console.log(`Associated Stock Record found: CODE = ${productWithStock.stock.CODE}`);
                console.log(`Stock Status: ${productWithStock.stock.Status}`);
            } else {
                console.log("No Stock record exists for this product yet, but the Prisma relation query succeeded.");
            }
        } else {
            console.log("No products found to test.");
        }
        
    } catch (e) {
        console.error("Failed to query relation:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
