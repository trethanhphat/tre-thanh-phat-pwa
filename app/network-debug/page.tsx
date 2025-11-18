/*
 ****************************************************************************************************
 * File: src/app/network-debug/page.tsx
 * Module: Trang hiển thị thông tin Debug Mạng
 * Description:
 * Trang React hiển thị các sự kiện trạng thái mạng để hỗ trợ debug.
 * - Hiển thị bảng các sự kiện mạng (online/offline, loại kết nối, tốc độ, v.v.)
 * - Lấy dữ liệu từ sự kiện tùy chỉnh 'network:status' do hook useNetworkStatus phát ra
 * - Giúp kiểm thử và theo dõi trạng thái mạng trong quá trình phát triển và QA
 * Features:
 * - Bảng hiển thị các sự kiện mạng với thông tin chi tiết
 * - Cập nhật thời gian thực khi có sự kiện mạng mới
 * Dependencies:
 * - useNetworkStatus hook từ '@/hooks/useNetworkStatus' (phát sự kiện mạng)
 * Usage:
 * import NetworkDebugPage from 'src/app/network-debug/page';
 * <NetworkDebugPage />
 ****************************************************************************************************
 * Organization: Thanh Phát Bamboo Corp (TPB Corp)
 * Author: Nguyễn Như Đường (TPB Corp)
 * Contact: +84-904-969-268
 * Email:
 * Created: 2025-11-13
 * Last Updated: 2025-11-13
 * Maintainer: DevOps Team @ TPB Corp
 * Version: 1.0.0
 * Change Log:
 * - 1.0.0 (2025-11-13): Tạo file ban đầu.
 ****************************************************************************************************
 * License: © 2025 TPB Corp. All rights reserved.
 * Confidentiality: Internal Use Only.
 * compliant with TPB Corp's proprietary software policies.
 * Standard Disclaimer:
 * This software is provided "as is," without warranty of any kind, express or implied, including but not limited to the warranties of merchantability,
 * fitness for a particular purpose, and noninfringement. In no event shall the authors or copyright holders be liable for any claim, damages,
 * or other liability, whether in an action of contract, tort, or otherwise, arising from, out of, or in connection with the software or the use or other dealings in the software.
 ****************************************************************************************************
 * References:
 * - Network Information API: https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API
 * - React Documentation: https://reactjs.org/docs/getting-started.html
 * - TPB Corp Internal Wiki: https://tpbc.top/wiki/useNetworkStatus
 * - API Docs: https://tpbc.top/api-docs/hooks/useNetworkStatus
 * - Changelog: https://tpbc.top/changelogs/useNetworkStatus
 * Dependencies:
 * - useNetworkStatus hook from '@/hooks/useNetworkStatus'
 * Documentation:
 * - Internal Wiki: https://tpbc.top/wiki/useNetworkStatus
 * - API Docs: https://tpbc.top/api-docs/hooks/useNetworkStatus
 ****************************************************************************************************
 * Special Notes:
 * - This component is intended for internal use within TPB Corp applications only.
 * - Unauthorized distribution or modification is prohibited.
 * Standard Disclaimer:
 * This software is provided "as is," without warranty of any kind, express or implied, including but not limited to the warranties of merchantability,
 * fitness for a particular purpose, and noninfringement. In no event shall the authors or copyright holders be liable for any claim, damages,
 * or other liability, whether in an action of contract, tort, or otherwise, arising from, out of, or in connection with the software or the use or other dealings in the software.  ********************************************************************************
 ****************************************************************************************************
 * License: © 2025 TPB Corp. All rights reserved.
 * Confidentiality: Internal Use Only.
 * compliant with TPB Corp's proprietary software policies.
 ****************************************************************************************************
 */
'use client';
import React, { useEffect, useState } from 'react';

type NetEvent = {
  online: boolean;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
  type?: string;
  timestamp: number;
  simulated?: boolean;
};

export default function NetworkDebugPage() {
  const [events, setEvents] = useState<NetEvent[]>([]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as NetEvent;
      setEvents(prev => [detail, ...prev].slice(0, 100)); // giữ 100 bản ghi mới nhất
    };
    window.addEventListener('network:status', handler as EventListener);
    return () => window.removeEventListener('network:status', handler as EventListener);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Network Debug</h1>
      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2 border">Thời gian</th>
            <th className="p-2 border">Online</th>
            <th className="p-2 border">effectiveType</th>
            <th className="p-2 border">downlink</th>
            <th className="p-2 border">rtt</th>
            <th className="p-2 border">saveData</th>
            <th className="p-2 border">type</th>
            <th className="p-2 border">simulated</th>
          </tr>
        </thead>
        <tbody>
          {events.map((ev, i) => (
            <tr key={i}>
              <td className="p-2 border">{new Date(ev.timestamp).toLocaleString()}</td>
              <td className="p-2 border">{String(ev.online)}</td>
              <td className="p-2 border">{ev.effectiveType ?? '-'}</td>
              <td className="p-2 border">
                {typeof ev.downlink === 'number' ? ev.downlink.toFixed(2) : '-'}
              </td>
              <td className="p-2 border">
                {typeof ev.rtt === 'number' ? Math.round(ev.rtt) : '-'}
              </td>
              <td className="p-2 border">{String(ev.saveData ?? false)}</td>
              <td className="p-2 border">{ev.type ?? '-'}</td>
              <td className="p-2 border">{String(ev.simulated ?? false)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
