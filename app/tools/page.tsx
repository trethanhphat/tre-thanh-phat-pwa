// File: app/tools/page.tsx
'use client';

import Link from 'next/link';

const tools = [
    {
        name: '🔄 Chuyển đổi mã cây ra số thứ tự',
        href: '/treecode',
        description: 'Chuyển đổi mã cây sang số thứ tự dễ dàng.',
    },
    {
        name: '🔢 Chuyển đổi số thứ tự ra mã cây',
        href: '/treecode',
        description: 'Chuyển đổi số thứ tự sang mã cây nhanh chóng.',
    },
    // Thêm các công cụ khác tại đây nếu cần
];

export default function ToolsPage() {
    return (
        <main className="min-h-screen bg-white text-gray-800 px-4 pt-6 pb-24">
            <section className="space-y-4">
                <h2>Công cụ quản lý</h2>
                {tools.map((tool) => (
                    <Link 
                        key={tool.href}
                        href={tool.href}
                        className="button"
                    >
                        🔧 {tool.name}
                    </Link>
                ))}
            </section>
        </main>
    );
}