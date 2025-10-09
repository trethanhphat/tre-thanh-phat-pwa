'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

const buttonStyle = {
  flexDirection: 'column' as const,
  width: '100%',
  padding: '1rem',
  textAlign: 'left' as const,
  borderRadius: '0.5rem',
  border: '1px solid var(--color-border)',
  marginBottom: '1rem',
  background: 'var(--color-background)',
  color: 'var(--color-text)',
};

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
    const router = useRouter();
    const menuHeight = 80;

    return (
        <>
            {/* Padding để không bị Menu che nội dung */}
            <div style={{ paddingBottom: `${menuHeight}px` }}></div>

            <div
                style={{
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                }}
            >
                <h1 className="font-ttp text-2xl mb-4">🛠 Công cụ</h1>
                
                <div>
                    {tools.map((tool) => (
                        <Link 
                            key={tool.href} 
                            href={tool.href} 
                            style={{ textDecoration: 'none' }}
                        >
                            <button style={buttonStyle}>
                                <div style={{ fontWeight: 'bold' }}>{tool.name}</div>
                                <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                                    {tool.description}
                                </div>
                            </button>
                        </Link>
                    ))}
                </div>

                {/* Nút quay lại */}
                <button
                    onClick={() => router.back()}
                    style={{
                        ...buttonStyle,
                        marginTop: '2rem',
                        textAlign: 'center' as const,
                    }}
                >
                    ⬅️ Quay lại
                </button>
            </div>
        </>
    );
}