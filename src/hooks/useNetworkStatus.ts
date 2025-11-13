/****************************************************************************************************
 * 📄 File: src/hooks/useNetworkStatus.ts
 * 📘 Module: Tải trước dữ liệu cho ứng dụng
 * 🧠 Description: 
 * Thực hiện hook React để theo dõi trạng thái mạng của trình duyệt, bao gồm:
 * - Trạng thái online/offline
 * - Loại kết nối mạng (wifi, cellular, v.v.)   
 * - Tốc độ kết nối và các chỉ số mạng khác (downlink, rtt, saveData)
 * - Cung cấp API để giả lập trạng thái mạng cho mục đích kiểm thử (QA)
 * 🛠️ Features
 * - Tự động cập nhật trạng thái mạng khi có sự thay đổi
 * - Phát sự kiện tùy chỉnh 'network:status' trên đối tượng window khi trạng thái mạng thay đổi
 * - Hỗ trợ đọc các chỉ số mạng từ Network Information API nếu trình duyệt hỗ trợ
 * 🧩 Dependencies
 *  - Không có phụ thuộc bên ngoài
 * 📝 Usage
 *  import useNetworkStatus, { NetworkMetrics } from '@/hooks/useNetworkStatus';
 * 
 *  const { network, simulate } = useNetworkStatus();
 *  - network: đối tượng chứa trạng thái mạng hiện tại
 *  - simulate: hàm để giả lập trạng thái mạng (dùng cho QA)
 * 
 *  Ví dụ:
 *  const { network } = useNetworkStatus();
 *  console.log(`Mạng hiện tại: ${network.online ? 'Online' : 'Offline'}`); 
 *  console.log(`Loại kết nối: ${network.type}`);
 *  console.log(`Tốc độ downlink: ${network.downlink} Mbps`);
 *  console.log(`RTT: ${network.rtt} ms`);
 *  console.log(`Chế độ tiết kiệm dữ liệu: ${network.saveData ? 'Bật' : 'Tắt'}`);
 *  ****************************************************************************************************
 *  Copyright (c) 2025 TPB Corp. All rights reserved.
 *  ***************************************************************************************************
 * License: Proprietary and Confidential
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 *  
/***************************************************************************************************
 * 🏢 Organization: Thanh Phát Bamboo Corp (TPB Corp)
 * 👤 Author: Nguyễn Như Đường (TPB Corp)
 * 📱 Contact: +84-904-969-268
 * 📧 Email: duong273@gmail.com
 * 📅 Created: 2025-11-13
 * 🔄 Last Updated: 2025-11-13
 * 🧩 Maintainer: DevOps Team @ TPB Corp
 * 
 /***************************************************************************************************
 * 🧾 Version: 1.0.2
 *  Change Log:
 *   - 1.0.2 (2025-11-07): Tối ưu TTL cache ảnh & xử lý offline.
 *   - 1.0.1 (2025-10-30): Bổ sung đồng bộ khi khởi động app.
 *   - 1.0.0 (2025-10-30): Tạo file ban đầu.
 *
 /***************************************************************************************************
 * ⚖️ License: © 2025 TPB Corp. All rights reserved.
 * 📜 Confidentiality: Internal Use Only.
 * 🔐 Compliance: ISO/IEC 27001, ISO/IEC 12207, ISO 9001
 *
 /***************************************************************************************************
 * 🧭 Standards:
 *   - ISO/IEC 12207: Software Life Cycle Processes
 *   - ISO/IEC 25010: Software Quality Requirements
 *   - TTP Internal Coding Standard v2.1
 *
 /***************************************************************************************************
 * 🧩 Dependencies:
 *  
 *
 /***************************************************************************************************
  * 📝 Documentation:
  * - Internal Wiki: https://tpbc.top/wiki/useNetworkStatus
  * - API Docs: https://tpbc.top/api-docs/hooks/useNetworkStatus
  * - Changelog: https://tpbc.top/changelogs/useNetworkStatus
  **************************************************************************************************/
import { useEffect, useState } from 'react';

export type NetworkMetrics = {
  online: boolean;
  effectiveType?: string; // 'slow-2g'|'2g'|'3g'|'4g'
  downlink?: number; // Mbps
  rtt?: number; // ms
  saveData?: boolean;
  type?: string; // 'wifi'|'cellular'... (không phải browser nào cũng support)
  timestamp: number; // để bạn log theo thời gian
  // cờ giả lập (QA)
  simulated?: boolean;
};

export function readConnection(): Partial<NetworkMetrics> {
  const conn =
    (navigator as any).connection ||
    (navigator as any).mozConnection ||
    (navigator as any).webkitConnection;
  if (!conn) return {};
  const { effectiveType, downlink, rtt, saveData, type } = conn;
  return { effectiveType, downlink, rtt, saveData, type };
}

export default function useNetworkStatus() {
  const [state, setState] = useState<NetworkMetrics>(() => ({
    online: typeof navigator !== 'undefined' ? navigator.onLine : true,
    ...readConnection(),
    timestamp: Date.now(),
  }));

  useEffect(() => {
    const handleOnline = () => {
      setState(s => ({ ...s, online: true, timestamp: Date.now(), simulated: false }));
      window.dispatchEvent(
        new CustomEvent('network:status', { detail: { ...state, online: true } })
      );
    };
    const handleOffline = () => {
      setState(s => ({ ...s, online: false, timestamp: Date.now(), simulated: false }));
      window.dispatchEvent(
        new CustomEvent('network:status', { detail: { ...state, online: false } })
      );
    };
    const conn =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection;
    const handleChange = () => {
      const metrics = readConnection();
      setState(s => ({ ...s, ...metrics, timestamp: Date.now(), simulated: false }));
      window.dispatchEvent(
        new CustomEvent('network:status', {
          detail: { ...metrics, online: navigator.onLine, timestamp: Date.now() },
        })
      );
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    if (conn && typeof conn.addEventListener === 'function') {
      conn.addEventListener('change', handleChange);
    }

    // phát sự kiện lần đầu
    handleChange();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (conn && typeof conn.removeEventListener === 'function') {
        conn.removeEventListener('change', handleChange);
      }
    };
  }, []);

  // API giả lập cho QA
  const simulate = (override: Partial<NetworkMetrics>) => {
    const next: NetworkMetrics = {
      ...state,
      ...override,
      simulated: true,
      timestamp: Date.now(),
    };
    setState(next);
    window.dispatchEvent(new CustomEvent('network:status', { detail: next }));
  };

  return { network: state, simulate };
}
