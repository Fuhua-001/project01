// script to diagnose product-stock relation
const path = require('path');
const generatedPath = path.join(__dirname, 'app', 'generated', 'prisma', 'client.ts');

async function main() {
    const prisma = await import('file://' + path.join(__dirname, 'app', 'generated', 'prisma', 'client.ts').replace(/\\/g, '/'));
    console.log(Object.keys(prisma));
}
main().catch(console.error);
