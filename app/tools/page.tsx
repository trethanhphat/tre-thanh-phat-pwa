import Link from 'next/link';

const tools = [
    {
        name: 'Chuyển đổi mã cây ra số thứ tự',
        href: '/treecode',
        description: 'Chuyển đổi mã cây sang số thứ tự dễ dàng.',
    },
    {
        name: 'Chuyển đổi số thứ tự ra mã cây',
        href: '/treecode',
        description: 'Chuyển đổi số thứ tự sang mã cây nhanh chóng.',
    },
    // Thêm các công cụ khác tại đây nếu cần
];

export default function ToolsPage() {
    return (
        <div className="max-w-xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-6">Danh sách công cụ</h1>
            <div className="space-y-4">
                {tools.map((tool) => (
                    <Link
                        key={tool.href}
                        href={tool.href}
                        className="block p-4 rounded-lg border hover:bg-gray-50 transition"
                    >
                        <div className="font-semibold text-lg">{tool.name}</div>
                        <div className="text-gray-500 text-sm">{tool.description}</div>
                    </Link>
                ))}
            </div>
        </div>
    );
}