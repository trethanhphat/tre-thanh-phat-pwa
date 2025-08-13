// ✅ File: lib/treeCode.ts

function padNumber(num: number, length: number): string {
  return num.toString().padStart(length, '0');
}

export function numberToCode(n: number): string {
  if (n < 1) throw new Error('Số thứ tự phải >= 1');

  // --- Giai đoạn 1 ---
  if (n <= 9999) {
    return padNumber(n, 4); // 0001 → 9999
  }

  // --- Giai đoạn 2 ---
  n -= 9999;
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const firstLetterIndex = Math.floor((n - 1) / 999);
  const numPart = ((n - 1) % 999) + 1;
  if (firstLetterIndex < 26) {
    return letters[firstLetterIndex] + padNumber(numPart, 3);
  }

  // --- Giai đoạn 3 ---
  let remaining = n - 26 * 999;
  let code = '';
  let base = letters.length;

  // Sinh mã chữ cái (BA01, ZZ99, v.v.)
  while (remaining > 0) {
    remaining--; // trừ 1 vì hệ đếm bắt đầu từ 0
    code = letters[remaining % base] + code;
    remaining = Math.floor(remaining / base);
    if (remaining === 0) break;
  }

  return code;
}

export function codeToNumber(code: string): number {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  // --- Giai đoạn 1 ---
  if (/^\d{4}$/.test(code)) {
    const num = parseInt(code, 10);
    if (num >= 1 && num <= 9999) return num;
  }

  // --- Giai đoạn 2 ---
  if (/^[A-Z]\d{3}$/.test(code)) {
    const letter = code[0];
    const numPart = parseInt(code.slice(1), 10);
    const letterIndex = letters.indexOf(letter);
    return 9999 + letterIndex * 999 + numPart;
  }

  // --- Giai đoạn 3 ---
  let letterValue = 0;
  for (let i = 0; i < code.length; i++) {
    letterValue = letterValue * 26 + (letters.indexOf(code[i]) + 1);
  }
  return 9999 + 26 * 999 + letterValue;
}
