// ✅ File: app/page.tsx

'use client';

import styles from '@/components/Home.module.scss';
import { appName, appDescription, appUrl, phone, email, copyright } from '@/lib/env';

export default function Home() {
  return (
    <main className="main">
      <section className="space-y-4">
        <div>
          <p>
            Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget
            dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes,
            nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis,
            sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec,
            vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo.
            Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus
            elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor
            eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis,
            feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum.
            Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi.
            Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam
            semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel,
            luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec
            vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget
            eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh. Donec sodales
            sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit cursus nunc,
          </p>
        </div>
        <button className={styles.buttonPrimary}>📥 Nhập dữ liệu mới</button>
        <a
          className="button"
          href="https://lookerstudio.google.com/reporting/470c0a0d-60ed-4191-bacb-46f02752fd88/page/kz9JF?s=kRSik9CXYew"
        >
          📋 Xem báo cáo cây trồng
        </a>
        <button className={styles.buttonWarning}>📷 Gửi ảnh thực địa</button>
        <div>
          <p>
            Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget
            dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes,
            nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis,
            sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec,
            vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo.
            Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus
            elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor
            eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis,
            feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum.
            Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi.
            Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam
            semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel,
            luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec
            vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget
            eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh. Donec sodales
            sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit cursus nunc,
          </p>
        </div>
      </section>

      <footer className={styles.footer}>
        <p>
          Điện thoại: <a href={`tel:${phone}`}>{phone}</a>
        </p>
        <p>
          Email: <a href={`mailto:${email}`}>{email}</a>
        </p>
        <p className="mt-1">{copyright}</p>
      </footer>
    </main>
  );
}
