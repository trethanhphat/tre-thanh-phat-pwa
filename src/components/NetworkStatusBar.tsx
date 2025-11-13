/****************************************************************************************************
 * 📄 File: src/components/NetworkStatusBar.tsx
 * 📘 Module: Hiển thị trạng thái mạng
 * 🧠 Description:
 * Thành phần React hiển thị thanh trạng thái mạng ở góc dưới phải
 * - Trạng thái online/offline
 * - Loại kết nối mạng (wifi, cellular, v.v.)
 * - Tốc độ kết nối và các chỉ số mạng khác (downlink, rtt, saveData)
 * - Cung cấp giao diện để giả lập trạng thái mạng cho mục đích kiểm thử (QA)
 * 🛠️ Features
 * - Hiển thị thanh trạng thái mạng với màu sắc thay đổi theo trạng thái
 * - Cung cấp panel chi tiết với các chỉ số mạng
 * - Nút bấm để giả lập nhanh các trạng thái mạng khác nhau
 * 🧩 Dependencies
 * - useNetworkStatus hook từ '@/hooks/useNetworkStatus'
 * 📝 Usage
 * import NetworkStatusBar from '@/components/NetworkStatusBar';
 * <NetworkStatusBar />
 * ****************************************************************************************************
 * - Copyright (c) 2025 TPB Corp. All rights reserved.
 * ***************************************************************************************************
 * License: Proprietary and Confidential
 *
 * 8***************************************************************************************************
 * 🏢 Organization: Thanh Phát Bamboo Corp (TPB Corp)
 * 👤 Author: Nguyễn Như Đường (TPB Corp)
 * 📱 Contact: +84-904-969-268
 * 📧 Email: duong273@gmail.com
 * 📅 Created: 2025-11-13
 * 🔄 Last Updated: 2025-11-13
 * 🧩 Maintainer: DevOps Team @ TPB Corp
 * ***************************************************************************************************
 * 🧾 Version: 1.0.0
 * 🪶 Change Log:
 *  - 1.0.0 (2025-11-13): Tạo file ban đầu.
 * * ***************************************************************************************************
 * ⚖️ License: © 2025 TPB Corp. All rights reserved.
 * 📜 Confidentiality: Internal Use Only.
 *  compliant with TPB Corp's proprietary software policies.
 * * ***************************************************************************************************
 * Special Notes:
 * - This component is intended for internal use within TPB Corp applications only.
 * - Unauthorized distribution or modification is prohibited.
 *
 * Standard Disclaimer:
 * This software is provided "as is," without warranty of any kind, express or implied, including but not limited to the warranties of merchantability,
 * fitness for a particular purpose, and noninfringement. In no event shall the authors or copyright holders be liable for any claim, damages,
 * or other liability, whether in an action of contract, tort, or otherwise, arising from, out of, or in connection with the software or the use or other dealings in the software.
 * ****************************************************************************************************
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
 * - Changelog: https://tpbc.top/changelogs/useNetworkStatus
 * * ***************************************************************************************************
 *
 */
'use client';
import React from 'react';
import useNetworkStatus from '@/hooks/useNetworkStatus';

const badgeColor = (online: boolean, eff?: string) => {
  if (!online) return 'bg-red-600';
  switch (eff) {
    case 'slow-2g':
    case '2g':
      return 'bg-orange-600';
    case '3g':
      return 'bg-yellow-600';
    case '4g':
      return 'bg-green-600';
    default:
      return 'bg-gray-600';
  }
};

export default function NetworkStatusBar() {
  const { network, simulate } = useNetworkStatus();
  const { online, effectiveType, downlink, rtt, saveData, simulated } = network;

  return (
    <div className="fixed bottom-4 right-4 z-50 text-white shadow-lg rounded-md overflow-hidden">
      <div className={`px-3 py-2 text-sm ${badgeColor(online, effectiveType)}`}>
        {online ? 'Online' : 'Offline'}
        {effectiveType ? ` • ${effectiveType}` : ''}
        {typeof downlink === 'number' ? ` • ${downlink.toFixed(2)} Mbps` : ''}
        {typeof rtt === 'number' ? ` • ${Math.round(rtt)} ms` : ''}
        {saveData ? ' • SaveData' : ''}
        {simulated ? ' • Simulated' : ''}
      </div>

      {/* Panel chi tiết cho QA */}
      <div className="bg-white text-gray-900 p-3 text-xs border border-gray-200">
        <div className="font-semibold mb-2">Chi tiết mạng</div>
        <ul className="space-y-1">
          <li>
            Trạng thái: <strong>{online ? 'Online' : 'Offline'}</strong>
          </li>
          <li>effectiveType: {effectiveType ?? '-'}</li>
          <li>downlink (Mbps): {downlink ?? '-'}</li>
          <li>rtt (ms): {rtt ?? '-'}</li>
          <li>saveData: {String(saveData ?? false)}</li>
          <li>time: {new Date(network.timestamp).toLocaleString()}</li>
        </ul>

        {/* Nút giả lập nhanh */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            className="px-2 py-1 bg-red-500 text-white rounded"
            onClick={() => simulate({ online: false })}
          >
            Giả lập: Offline
          </button>
          <button
            className="px-2 py-1 bg-green-600 text-white rounded"
            onClick={() => simulate({ online: true, effectiveType: '4g', downlink: 25, rtt: 50 })}
          >
            Giả lập: 4G tốt
          </button>
          <button
            className="px-2 py-1 bg-yellow-600 text-white rounded"
            onClick={() => simulate({ online: true, effectiveType: '3g', downlink: 2.2, rtt: 180 })}
          >
            Giả lập: 3G
          </button>
          <button
            className="px-2 py-1 bg-orange-600 text-white rounded"
            onClick={() => simulate({ online: true, effectiveType: '2g', downlink: 0.2, rtt: 800 })}
          >
            Giả lập: 2G yếu
          </button>
        </div>
      </div>
    </div>
  );
}
