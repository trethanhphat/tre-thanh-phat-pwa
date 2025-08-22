// ✅ File: app/page.tsx

'use client';

import styles from '@/components/Home.module.scss';
import { appName, appDescription, appUrl, phone, email, copyright } from '@/lib/env';

export default function Home() {
  return (
    <>
      <div>
        <h1 className="font-ttp">{appName}</h1>
        <p>{appDescription}</p>
      </div>
      <h2>Chúng tôi là ai</h2>
      <p>
        <span className="font-ttp">Tre Thanh Phát</span> là doanh nghiệp với mong muốn phát triển hệ
        sinh thái nông nghiệp xanh trên cả nước, trong đó giai đoạn đầu tiên sẽ tập trung ở cụm vùng
        các tỉnh Tây Bắc. Chúng tôi chọn theo đuổi mô hình kinh doanh tạo ra tác động xã hội, mang
        lại giá trị bền vững cho người dân trong chuỗi giá trị và các bên liên quan.
      </p>
      <h2>Mục tiêu của chúng tôi</h2>
      <p>
        Tạo dựng vùng nguyên liệu bền vững, giá trị cao. Tạo công ăn việc làm để nâng cao đời sống
        vật chất cho bà con vùng cao. Tăng hiệu quả kinh tế cho địa phương nơi doanh nghiệp đứng
        chân. Là mô hình chuẩn để giới thiệu quảng bá và nhân rộng. Xuất khẩu các sản phẩm chất
        lượng cao ra thị trường quốc tế.
      </p>
      {/* Các chức năng chính */}
      <section className="space-y-4">
        <a className="button" href="/report">
          📋 Xem báo cáo cây trồng
        </a>
      </section>
    </>
  );
}
