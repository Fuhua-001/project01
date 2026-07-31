import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function check() {
    // Dynamic import of the generated Prisma Client
    const prismaModule = await import('file:///' + join(__dirname, 'app', 'generated', 'prisma', 'index.js').replace(/\\/g, '/'));
    const PrismaClient = prismaModule.PrismaClient;
    
    const prisma = new PrismaClient();
    
    try {
        console.log("Checking relations by testing an include query on Product...");
        // This query will fail if the relation does not exist
        const result = await prisma.product.findFirst({
            include: { stock: true }
        });
        
        console.log("Query SUCCESSFUL! Prisma confirms that Product is connected to Stock.");
        if (result && result.stock) {
             console.log(`Found linked data: Product ${result.PROD_NAME} is linked to Stock ${result.stock.CODE}`);
        } else {
             console.log("No linked data found in the tables yet, but the schema structure is correctly linked.");
        }
    } catch (e) {
        console.error("Relation failed or error:", e.message);
    } finally {
        await prisma.$disconnect();
    }
}

check();
