// ✅ File: src/components/BackgroundPrefetch.tsx
/** ✅ Thành phần tiền tải nền (background prefetch)
 * - Khi app load, kiểm tra nếu online và đã lâu chưa prefetch
 * - Gọi các hàm prefetch để tải dữ liệu tin tức, sản phẩm, lô hàng về IndexedDB
 * - Giúp trải nghiệm offline-first tốt hơn
 * - Ghi log chi tiết để theo dõi quá trình tiền tải
 * - Phát hiện mã QR trong URL để đồng bộ lô hàng tương ứng
 * - Chỉ chạy khi online và không quá thường xuyên (24h một lần)
 * - Lắng nghe sự kiện 'appinstalled' để tiền tải khi PWA được cài đặt
 *
 * Hàm chính:
 * BackgroundPrefetch: React component không render gì, chỉ chạy useEffect để tiền tải
 *
 * Quy trình:
 *  • Kiểm tra trạng thái online
 *  • Kiểm tra nếu đã prefetch trong 24h qua để tránh lặp lại
 *  • Kiểm tra nếu dữ liệu đã có trong IndexedDB để bỏ qua prefetch không cần thiết
 *  • Gọi prefetchNewsOnce(), prefetchProductsOnce(), prefetchBatchesOnce() tương ứng
 *  • Phát hiện mã QR trong URL và gọi syncBatchesByPrefix() nếu tìm thấy
 * Khi cài đặt PWA:
 *  • Lắng nghe sự kiện 'appinstalled' và gọi prefetch bắt buộc cho tất cả dữ liệu
 * Lợi ích:
 *  • Cải thiện trải nghiệm người dùng khi offline hoặc mạng yếu
 *  • Giảm thời gian chờ tải dữ liệu khi truy cập các trang chính
 * • Đảm bảo dữ liệu luôn được cập nhật định kỳ
 * Phần thêm:
 *  • Ghi log chi tiết quá trình để dễ dàng theo dõi và debug
 *
 */
'use client';

import { useEffect } from 'react';
import { hasNewsInDB } from '@/repositories/newsRepository';
import { hasProductsInDB } from '@/repositories/productsRepository';
import { hasBatchesInDB, syncBatchesByPrefix } from '@/repositories/batchesRepository';
import { prefetchNewsOnce } from '@/services/newsPrefetch';
// import { prefetchProductsOnce } from '@/services/productsPrefetch'; // Tạm tắt import hàm prefetchProductsOnce để giảm hiển thị console log
import { prefetchBatchesOnce } from '@/services/batchesPrefetch'; // ⬅️ thêm

export default function BackgroundPrefetch() {
  useEffect(() => {
    const run = async () => {
      console.log('[BackgroundPrefetch] 🚀 run() start'); // Báo là hàm bắt đầu chạy (Đã được gọi)

      if (!navigator.onLine) {
        console.log('[BackgroundPrefetch] ❌ Offline — skip prefetch'); // Báo hiệu Nếu offline thì bỏ qua
        return;
      }

      const lastPrefetch = localStorage.getItem('lastPrefetch'); // Lấy thời gian prefetch lần cuối từ localStorage
      console.log('[BackgroundPrefetch] ℹ️ Last prefetch at:', lastPrefetch); // Báo hiệu thời gian prefetch lần cuối
      const now = Date.now(); // Lấy thời gian hiện tại
      const oneDay = 24 * 60 * 60 * 1000; // Định nghĩa khoảng thời gian 1 ngày

      // ⬇️ kiểm tra DB cục bộ
      const newsReady = await hasNewsInDB(); // Kiểm tra nếu đã có tin tức trong DB
      console.log('[BackgroundPrefetch] ℹ️ News in DB:', newsReady); // Báo hiệu trạng thái tin tức trong DB
      const productsReady = await hasProductsInDB(); // Kiểm tra nếu đã có sản phẩm trong DB
      console.log('[BackgroundPrefetch] ℹ️ Products in DB:', productsReady); // Báo hiệu trạng thái sản phẩm trong DB
      const batchesReady = await hasBatchesInDB(); // Kiểm tra nếu đã có lô trồng trong DB
      console.log('[BackgroundPrefetch] ℹ️ Batches in DB:', batchesReady); // Báo hiệu trạng thái lô trồng trong DB

      // ⬇️ Quy tắc tiền tải

      // ✅ chỉ prefetch nếu chưa từng chạy hoặc đã hơn 24h
      const canSkipByTTL = lastPrefetch && now - parseInt(lastPrefetch) < oneDay;
      if (canSkipByTTL && newsReady && productsReady && batchesReady) {
        console.log('[BackgroundPrefetch] ⏸️ Skip — last prefetch within 24h (DB ready)'); // Báo hiệu bỏ qua nếu đã prefetch trong 24h qua và dữ liệu đã sẵn sàng
        return;
      }

      try {
        console.log('[BackgroundPrefetch] 🌐 Online detected, start prefetch'); // Báo hiệu bắt đầu prefetch khi online

        const tasks = [
          (async () => {
            // await prefetchNewsOnce();
          })(),
        ];
        // ⬇️ Prefetch Products luôn (bỏ qua TTL)
        /* Start Tạm tắt prefetchProductsOnce để giảm hiển thị console log
        if (typeof prefetchProductsOnce === 'function') {
          tasks.push(
            (async () => {
              console.log('[BackgroundPrefetch] 🛍️ prefetchProductsOnce() start'); // Báo hiệu bắt đầu prefetch sản phẩm
              await prefetchProductsOnce();
              console.log('[BackgroundPrefetch] ✅ prefetchProductsOnce() done'); // Báo hiệu hoàn thành prefetch sản phẩm
            })()
          );
        } else {
          console.log('[BackgroundPrefetch] ⚠️ prefetchProductsOnce not defined, skipped'); // Báo hiệu nếu hàm prefetchProductsOnce không được định nghĩa
        }
        // End tạm tắt prefetchProductsOnce*/

        // ⬇️ Prefetch News nếu DB còn trống (bỏ qua TTL)
        if (!newsReady || !canSkipByTTL) {
          tasks.push(
            (async () => {
              console.log('[BackgroundPrefetch] 🛒 prefetchNewsOnce() start'); // Báo hiệu bắt đầu prefetch tin tức
              await prefetchNewsOnce();
              console.log('[BackgroundPrefetch] ✅ prefetchNewsOnce() done'); // Báo hiệu hoàn thành prefetch tin tức
            })()
          );
        } else {
          console.log('[BackgroundPrefetch] ℹ️ Products DB ready — skip prefetch'); // Báo hiệu nếu dữ liệu tin tức đã sẵn sàng trong DB thì bỏ qua prefetch
        }

        // ⬇️ Prefetch Products nếu DB còn trống (bỏ qua TTL)
        /* Start Tạm tắt prefetchProductsOnce để giảm hiển thị console log
        if (!productsReady || !canSkipByTTL) {
          tasks.push(
            (async () => {
              console.log('[BackgroundPrefetch] 🛒 prefetchProductsOnce() start'); // Báo hiệu bắt đầu prefetch sản phẩm
              await prefetchProductsOnce();
              console.log('[BackgroundPrefetch] ✅ prefetchProductsOnce() done'); // Báo hiệu hoàn thành prefetch sản phẩm
            })()
          );
        } else {
          console.log('[BackgroundPrefetch] ℹ️ Products DB ready — skip prefetch'); // Báo hiệu nếu dữ liệu sản phẩm đã sẵn sàng trong DB thì bỏ qua prefetch
        }
        // End tạm tắt prefetchProductsOnce */

        // ⬇️ Prefetch Batches (Google Sheet → IndexedDB) nếu DB còn trống (bỏ qua TTL)
        if (!batchesReady || !canSkipByTTL) {
          tasks.push(
            (async () => {
              console.log('[BackgroundPrefetch] 📦 prefetchBatchesOnce() start'); // Báo hiệu bắt đầu prefetch lô trồng
              await prefetchBatchesOnce();
              console.log('[BackgroundPrefetch] ✅ prefetchBatchesOnce() done'); // Báo hiệu hoàn thành prefetch lô trồng
            })()
          );
        } else {
          console.log('[BackgroundPrefetch] ℹ️ Batches DB ready — skip prefetch'); // Báo hiệu nếu dữ liệu lô trồng đã sẵn sàng trong DB thì bỏ qua prefetch
        }

        await Promise.all(tasks);

        console.log('[BackgroundPrefetch] ℹ️ Updating lastPrefetch time'); // Báo hiệu cập nhật thời gian prefetch lần cuối

        localStorage.setItem('lastPrefetch', now.toString());

        console.log('[BackgroundPrefetch] ✅ All prefetch tasks completed'); // Báo hiệu tất cả các tác vụ prefetch đã hoàn thành

        // ⬇️ Phát hiện mã QR trong URL để đồng bộ lô trồng tương ứng

        // Detect QR prefix
        const href = window.location.href;
        const match = href.match(/[A-Z0-9]{2}[A-Z0-9]{3}(?:[A-Z0-9]{2})?/);
        if (match) {
          const prefix = match[0];
          console.log('[BackgroundPrefetch] 🔍 Detected QR prefix:', prefix); // Báo hiệu phát hiện tiền tố QR

          if (typeof syncBatchesByPrefix === 'function') {
            console.log('[BackgroundPrefetch] 🔄 syncBatchesByPrefix() start'); // Báo hiệu bắt đầu đồng bộ lô trồng theo tiền tố
            await syncBatchesByPrefix(prefix);
            console.log('[BackgroundPrefetch] ✅ syncBatchesByPrefix() done'); // Báo hiệu hoàn thành đồng bộ lô trồng theo tiền tố
          }
        } else {
          console.log('[BackgroundPrefetch] ℹ️ No QR prefix found in URL:', href); // Báo hiệu không tìm thấy tiền tố QR trong URL
        }
      } catch (err) {
        console.warn('[BackgroundPrefetch] ❌ Error during prefetch', err); // Báo hiệu lỗi trong quá trình prefetch
      }
    };

    console.log('[BackgroundPrefetch] ⏱ useEffect() triggered'); // Báo hiệu useEffect đã được kích hoạt
    run();

    // ⬇️ khi app được cài (PWA), force prefetch cả news + products + batches
    // Start Tạm tắt chạy khi cài đặt app để giảm hiển thị console log
    const onInstalled = () => {
      console.log('[BackgroundPrefetch] 🧪 App installed → force prefetch all'); // Báo hiệu ứng dụng đã được cài đặt, bắt đầu prefetch bắt buộc
      Promise.all([
        prefetchNewsOnce(true),
        //prefetchProductsOnce(true),
        prefetchBatchesOnce(true),
      ]).catch(err => console.warn('[BackgroundPrefetch] force prefetch error', err)); // Báo hiệu lỗi nếu có trong quá trình prefetch bắt buộc
    };
    // End tạm tắt chạy khi cài đặt app */

    window.addEventListener('appinstalled', onInstalled); // Lắng nghe sự kiện 'appinstalled' để kích hoạt prefetch bắt buộc
    return () => window.removeEventListener('appinstalled', onInstalled); // Dọn dẹp sự kiện khi component unmount
  }, []);

  return null; // Không render gì
}
