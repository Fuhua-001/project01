"use client";

import { useState } from "react";

export default function DeleteButton({
  id,
  itemName,
  onDelete,
}: {
  id: string | number;
  itemName: string;
  onDelete: (id: any) => Promise<{ success: boolean; error?: string }>;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`คุณต้องการลบ "${itemName}" ใช่หรือไม่?`)) return;

    setIsDeleting(true);
    try {
      const res = await onDelete(id);
      if (res.success) {
        alert(`✅ ลบ "${itemName}" เรียบร้อยแล้ว`);
      } else {
        alert(`❌ ไม่สามารถลบได้: ${res.error || "เกิดข้อผิดพลาด"}`);
      }
    } catch (err: any) {
      alert(`❌ เกิดข้อผิดพลาด: ${err?.message || String(err)}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-400 hover:text-red-300 disabled:opacity-50 text-xs px-2 py-1 rounded bg-red-950/40 border border-red-500/20 hover:border-red-500/50 transition-colors"
      title="ลบรายการนี้"
    >
      {isDeleting ? "⏳" : "🗑️ ลบ"}
    </button>
  );
}
