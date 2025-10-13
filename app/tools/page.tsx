// File: app/tools/page.tsx
'use client';

import Link from 'next/link';

const tools = [
    {
        icon: '🔄',
        name: 'Chuyển đổi mã cây ra số thứ tự',
        href: '/treecode',
        description: 'Chuyển đổi mã cây sang số thứ tự dễ dàng.',
    },
    {
        icon: '🔢',
        name: 'Chuyển đổi số thứ tự ra mã cây',
        href: '/treecode',
        description: 'Chuyển đổi số thứ tự sang mã cây nhanh chóng.',
    },
    {
        icon: '🗺',
        name: 'Tra cứu mã tỉnh/thành phố',
        href: '/tools/mapcode',
        description: 'Công cụ để xem mã tỉnh/thành phố ngắn gọn đầu mã lô.',
    },
    // Thêm các công cụ khác tại đây nếu cần
];

export default function ToolsPage() {
    return (
        <main className="min-h-screen bg-white text-gray-800 px-4 pt-6 pb-24">
            <section className="space-y-4">
                <h2>Công cụ quản lý</h2>
                {tools.map((tool) => (
                    <div key={tool.href} className="button flex items-center gap-2">
                        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg">
                            <span className="text-2xl">{tool.icon}</span>
                        </div>
                        <Link 
                            href={tool.href}
                            aria-label={tool.description}
                            title={tool.description}
                        >
                            {tool.name}
                        </Link>
                    </div>
                ))}
            </section>
        </main>
    );
}