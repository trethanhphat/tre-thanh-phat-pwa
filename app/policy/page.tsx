'use client';

import { useServiceWorkerUpdate } from '@/hooks/useServiceWorkerUpdate'; // Module Update
import type { AppProps } from 'next/app'; // Module Update

import Image from 'next/image';
import { appName, appDescription, appUrl, phone, email, website, copyright } from '@/lib/env';

export default function Home() {
  return (
    <main className="main">
      {/* Tiêu đề */}
      <h2 className="text-center mb-6"></h2>
      ## CHÍNH SÁCH ỨNG DỤNG PWA - TTP CORP ### 1. Chính sách quyền riêng tư Ứng dụng của chúng tôi
      tôn trọng và cam kết bảo mật thông tin cá nhân của người dùng. Chính sách này nhằm giải thích
      cách chúng tôi thu thập, sử dụng và bảo vệ dữ liệu cá nhân: * **Dữ liệu thu thập:** Họ tên, số
      điện thoại, email, vị trí địa lý (nếu có), và các hành vi sử dụng ứng dụng. * **Mục đích sử
      dụng:** Cải thiện dịch vụ, cá nhân hóa trải nghiệm người dùng, gửi thông báo liên quan. *
      **Lưu trữ và bảo mật:** Dữ liệu được lưu trong hệ thống có bảo mật cao, chỉ những nhân sự có
      thẩm quyền mới được truy cập. * **Quyền người dùng:** Người dùng có thể yêu cầu xem, chỉnh sửa
      hoặc xoá dữ liệu cá nhân bằng cách liên hệ với chúng tôi qua thông tin ở cuối trang này. *
      **Bên thứ ba:** Chúng tôi không chia sẻ thông tin với bên thứ ba nếu không có sự đồng ý. ---
      ### 2. Chính sách sử dụng Khi sử dụng ứng dụng của TTP Corp, bạn đồng ý tuân theo các điều
      khoản sau: * **Không sử dụng ứng dụng cho mục đích trái pháp luật.** * **Không phá hoại, gây
      ảnh hưởng đến hệ thống, làm gián đoạn dịch vụ.** * **Không giả mạo danh tính hoặc cung cấp
      thông tin sai lệch.** * TTP Corp có quyền tạm ngưng hoặc chấm dứt tài khoản người dùng vi phạm
      chính sách mà không cần thông báo trước. --- ### 3. Chính sách bảo vệ dữ liệu cá nhân Chúng
      tôi tuân thủ Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân: * **Loại dữ liệu cá nhân:**
      Bao gồm thông tin cơ bản (họ tên, email, số điện thoại) và dữ liệu hành vi (lịch sử sử dụng,
      vị trí...). * **Mục đích xử lý:** Chỉ sử dụng để cung cấp dịch vụ tốt hơn. * **Bảo vệ dữ
      liệu:** Áp dụng mã hoá, phân quyền truy cập, xác thực 2 lớp (nếu có). * **Khiếu nại:** Người
      dùng có quyền yêu cầu dừng xử lý hoặc xoá dữ liệu. --- ### 4. Chính sách cookie và bộ nhớ cục
      bộ Ứng dụng có thể lưu thông tin tạm thời qua bộ nhớ cục bộ (localStorage, IndexedDB) nhằm: *
      Ghi nhớ trạng thái đăng nhập. * Tăng tốc truy cập và sử dụng khi offline. Chúng tôi không sử
      dụng cookie để theo dõi quảng cáo hay bán dữ liệu cho bên thứ ba. --- ### 5. Chính sách hoạt
      động ngoại tuyến và đồng bộ Ứng dụng PWA của chúng tôi hỗ trợ hoạt động không cần kết nối
      mạng: * **Chế độ ngoại tuyến:** Người dùng có thể xem dữ liệu gần nhất đã lưu, ghi nhật ký
      (logs) mà không cần mạng. * **Đồng bộ:** Khi có kết nối mạng, dữ liệu sẽ được tự động đồng bộ
      nếu có Wi-Fi, hoặc người dùng có thể chọn “Đồng bộ ngay” bằng dữ liệu di động. * **Cảnh báo:**
      Nếu có dữ liệu chưa đồng bộ, ứng dụng sẽ thông báo rõ ràng. --- ### 6. Thông tin chủ sở hữu
      Ứng dụng được phát triển và vận hành bởi: **Công ty Cổ phần TTP** Mã số thuế: (cập nhật sau)
      Địa chỉ: (cập nhật sau) Email: [contact@trethanhphat.vn](mailto:contact@trethanhphat.vn) Điện
      thoại: 0988 000 000 --- Chúng tôi có thể cập nhật các chính sách trên để phù hợp với quy định
      mới nhất và nhu cầu thực tế. Người dùng nên kiểm tra định kỳ để nắm rõ các thay đổi.
      {/* Các chức năng chính */}
      <section className="s1">
        <a className="button" href="#chinh-sach">
          📥 Nhập dữ liệu mới
        </a>
        <button className="btn-secondary w-full py-4 text-lg bg-green-100 text-green-800 rounded-2xl border border-green-300">
          📋 Xem báo cáo cây trồng
        </button>
        <button className="btn-primary w-full py-4 text-lg bg-yellow-50 text-yellow-800 rounded-2xl border border-yellow-300">
          📷 Gửi ảnh thực địa
        </button>
      </section>
    </main>
  );
}
