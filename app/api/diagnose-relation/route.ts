import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    const products = await prisma.product.findMany({ 
        select: { id: true, PROD_NAME: true },
    });
    const stocks = await prisma.stock.findMany({ 
        select: { CODE: true, PROD_NAME: true },
    });

    const productIds = new Set(products.map((p: any) => p.id));
    const matched = stocks.filter((s: any) => productIds.has(s.CODE));
    const unmatched = stocks.filter((s: any) => !productIds.has(s.CODE));

    return NextResponse.json({
        totalProducts: products.length,
        totalStocks: stocks.length,
        matched: matched.length,
        unmatched: unmatched.length,
        sampleProductIds: products.slice(0, 5).map((p: any) => p.id),
        sampleStockCodes: stocks.slice(0, 5).map((s: any) => s.CODE),
        unmatchedCodes: unmatched.slice(0, 10).map((s: any) => s.CODE),
    });
}
