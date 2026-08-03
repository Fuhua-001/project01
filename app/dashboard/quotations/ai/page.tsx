import { fetchFormData } from '../actions';
import AIQuotationClient from './AIQuotationClient';

export const dynamic = 'force-dynamic';

export default async function AIQuotationPage() {
  const { customers, employees, products } = await fetchFormData();

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">✨</span>
          <div>
            <h1 className="text-3xl font-bold text-white">AI สร้างใบเสนอราคา</h1>
            <p className="text-slate-400 text-sm mt-1">
              บอก AI เป็นภาษาธรรมดา — AI จะดึงข้อมูลลูกค้าและสินค้าจากฐานข้อมูล แล้วสร้างใบเสนอราคาให้อัตโนมัติ
            </p>
          </div>
        </div>

        {/* Info chips */}
        <div className="flex flex-wrap gap-2 mt-4">
          {[
            { icon: '🗄️', text: `${customers.length} ลูกค้าในระบบ` },
            { icon: '📦', text: `${products.length} สินค้าในระบบ` },
            { icon: '🤖', text: 'Groq (Llama 3.3 70B)' },
            { icon: '📄', text: 'PDF เหมือนแบบ Manual' },
          ].map((chip, i) => (
            <span
              key={i}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-slate-300 border border-white/10"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              {chip.icon} {chip.text}
            </span>
          ))}
        </div>
      </div>

      <AIQuotationClient
        customers={customers}
        employees={employees}
        products={products}
      />
    </div>
  );
}
