// utils/treeCode.ts

const digits = '0123456789';
const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// Giới hạn tối đa mã 4 ký tự
const MAX_CODES = 9999 + 26 ** 1 * 1000 + 26 ** 2 * 100 + 26 ** 3 * 10 + 26 ** 4 * 1;

/**
 * Đổi mã cây thành số thứ tự
 * @param code Mã cây, ví dụ "0001", "A001", "ZZZZ"
 * @returns Số thứ tự (1-based)
 */
export function codeToNumber(code: string): number {
  code = code.toUpperCase().trim();

  // Trường hợp 0001 - 9999
  if (/^\d{4}$/.test(code)) {
    const num = parseInt(code, 10);
    if (num >= 1 && num <= 9999) return num;
    throw new Error('Mã số không hợp lệ');
  }

  // Trường hợp có chữ cái + số
  if (/^[A-Z0-9]{1,4}$/.test(code)) {
    let index = 9999; // đã qua giai đoạn 0001-9999
    const chars = code.split('');
    const len = chars.length;

    // Giải mã từng ký tự
    for (let i = 0; i < len; i++) {
      const ch = chars[i];
      let val;
      if (/[A-Z]/.test(ch)) {
        val = letters.indexOf(ch);
        if (val === -1) throw new Error('Ký tự không hợp lệ');
        // Vị trí là chữ → cộng giá trị 26-based
        index += val * Math.pow(26, len - i - 1);
      } else if (/[0-9]/.test(ch)) {
        val = digits.indexOf(ch);
        index += val * Math.pow(10, len - i - 1);
      }
    }

    if (index > MAX_CODES) throw new Error('Mã vượt quá giới hạn');
    return index;
  }

  throw new Error('Mã không hợp lệ');
}
