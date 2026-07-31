import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // ดึงข้อมูลทั้งหมดจากตาราง sales_pr และ sub_sales_pr
    const [allSalesPR, allSubItems, totalCustomers, totalProducts] = await Promise.all([
      prisma.sales_pr.findMany({
        orderBy: { DATE: 'asc' },
      }),
      prisma.sub_sales_pr.findMany(),
      prisma.customer.count(),
      prisma.product.count(),
    ]);

    // จัดกลุ่มยอดขายรายเดือน (เฉพาะ TransactionType = "ขาย")
    const salesDocs = allSalesPR.filter((doc) => doc.TransactionType === 'ขาย');

    const monthlyMap: Record<string, { revenue: number; count: number }> = {};

    for (const doc of salesDocs) {
      const date = new Date(doc.DATE);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const docItems = allSubItems.filter((item) => item.sales_pr_Id === doc.Id);
      const total = docItems.reduce((sum, item) => sum + item.TOTAL, 0);

      if (!monthlyMap[key]) {
        monthlyMap[key] = { revenue: 0, count: 0 };
      }
      monthlyMap[key].revenue += total;
      monthlyMap[key].count += 1;
    }

    // แปลงเป็น array และเรียงตามวันที่
    const monthlyRevenue = Object.entries(monthlyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12) // เอาแค่ 12 เดือนล่าสุด
      .map(([month, data]) => {
        const [year, mon] = month.split('-');
        const thaiMonths = [
          'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
          'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
        ];
        return {
          month: `${thaiMonths[parseInt(mon) - 1]} ${parseInt(year) + 543}`,
          monthKey: month,
          revenue: Math.round(data.revenue * 100) / 100,
          count: data.count,
        };
      });

    // ยอดขายแยกตามพนักงาน
    const employeeMap: Record<string, number> = {};
    for (const doc of salesDocs) {
      const docItems = allSubItems.filter((item) => item.sales_pr_Id === doc.Id);
      const total = docItems.reduce((sum, item) => sum + item.TOTAL, 0);
      if (!employeeMap[doc.IdPIC]) employeeMap[doc.IdPIC] = 0;
      employeeMap[doc.IdPIC] += total;
    }
    const salesByEmployee = Object.entries(employeeMap)
      .map(([name, revenue]) => ({ name, revenue: Math.round(revenue * 100) / 100 }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);

    // ยอดขายแยกตามสินค้า (Top 10)
    const productMap: Record<string, { revenue: number; quantity: number }> = {};
    for (const item of allSubItems) {
      const doc = allSalesPR.find((d) => d.Id === item.sales_pr_Id);
      if (!doc || doc.TransactionType !== 'ขาย') continue;
      if (!productMap[item.PROD_NAME]) productMap[item.PROD_NAME] = { revenue: 0, quantity: 0 };
      productMap[item.PROD_NAME].revenue += item.TOTAL;
      productMap[item.PROD_NAME].quantity += item.Quantity;
    }
    const topProducts = Object.entries(productMap)
      .map(([name, data]) => ({ name, revenue: Math.round(data.revenue * 100) / 100, quantity: data.quantity }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // KPI Summary
    const thisMonthKey = (() => {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    })();
    const thisMonthData = monthlyMap[thisMonthKey] || { revenue: 0, count: 0 };

    const lastMonthKey = (() => {
      const now = new Date();
      now.setMonth(now.getMonth() - 1);
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    })();
    const lastMonthData = monthlyMap[lastMonthKey] || { revenue: 0, count: 0 };

    const totalRevenue = salesDocs.reduce((sum, doc) => {
      const docItems = allSubItems.filter((item) => item.sales_pr_Id === doc.Id);
      return sum + docItems.reduce((s, item) => s + item.TOTAL, 0);
    }, 0);

    return NextResponse.json({
      kpi: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        thisMonthRevenue: Math.round(thisMonthData.revenue * 100) / 100,
        lastMonthRevenue: Math.round(lastMonthData.revenue * 100) / 100,
        thisMonthDocCount: thisMonthData.count,
        totalDocuments: allSalesPR.length,
        totalSalesDocuments: salesDocs.length,
        totalCustomers,
        totalProducts,
      },
      monthlyRevenue,
      salesByEmployee,
      topProducts,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
