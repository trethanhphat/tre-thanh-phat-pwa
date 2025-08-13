// lib/treeCode.ts
const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const digits = '0123456789';

// Bỏ 0000 hoặc 00 hoặc 0 tuỳ nhóm
export function numberToCode(n: number): string {
  if (n < 1 || n > 951057) throw new Error('Out of range');

  // Giai đoạn 1
  if (n <= 9999) {
    return n.toString().padStart(4, '0');
  }
  n -= 9999;

  // Giai đoạn 2: A0001-Z9999
  const phase2Count = 26 * 9999;
  if (n <= phase2Count) {
    const letterIndex = Math.floor((n - 1) / 9999);
    const numPart = ((n - 1) % 9999) + 1;
    return letters[letterIndex] + numPart.toString().padStart(4, '0');
  }
  n -= phase2Count;

  // Giai đoạn 3: AA01-ZZ99
  const phase3Count = 26 * 26 * 99;
  if (n <= phase3Count) {
    const letterIndex = Math.floor((n - 1) / 99);
    const numPart = ((n - 1) % 99) + 1;
    const l1 = Math.floor(letterIndex / 26);
    const l2 = letterIndex % 26;
    return letters[l1] + letters[l2] + numPart.toString().padStart(2, '0');
  }
  n -= phase3Count;

  // Giai đoạn 4: ZZA1-ZZZ9
  const phase4Count = 26 * 26 * 26 * 9;
  if (n <= phase4Count) {
    const letterIndex = Math.floor((n - 1) / 9);
    const numPart = ((n - 1) % 9) + 1;
    const l1 = Math.floor(letterIndex / (26 * 26));
    const l2 = Math.floor((letterIndex % (26 * 26)) / 26);
    const l3 = letterIndex % 26;
    return letters[l1] + letters[l2] + letters[l3] + numPart.toString();
  }
  n -= phase4Count;

  // Giai đoạn 5: ZZZ A-Z
  const l1 = Math.floor((n - 1) / (26 * 26 * 26));
  const rem1 = (n - 1) % (26 * 26 * 26);
  const l2 = Math.floor(rem1 / (26 * 26));
  const rem2 = rem1 % (26 * 26);
  const l3 = Math.floor(rem2 / 26);
  const l4 = rem2 % 26;
  return letters[l1] + letters[l2] + letters[l3] + letters[l4];
}

export function codeToNumber(code: string): number {
  // Giai đoạn 1: toàn số
  if (/^\d{4}$/.test(code)) {
    const num = parseInt(code, 10);
    if (num >= 1 && num <= 9999) return num;
  }

  // Giai đoạn 2: 1 chữ + 4 số
  if (/^[A-Z]\d{4}$/.test(code)) {
    const letterIndex = letters.indexOf(code[0]);
    const numPart = parseInt(code.slice(1), 10);
    if (numPart >= 1 && numPart <= 9999) {
      return 9999 + letterIndex * 9999 + numPart;
    }
  }

  // Giai đoạn 3: 2 chữ + 2 số
  if (/^[A-Z]{2}\d{2}$/.test(code)) {
    const l1 = letters.indexOf(code[0]);
    const l2 = letters.indexOf(code[1]);
    const numPart = parseInt(code.slice(2), 10);
    if (numPart >= 1 && numPart <= 99) {
      const letterIndex = l1 * 26 + l2;
      return 9999 + 26 * 9999 + letterIndex * 99 + numPart;
    }
  }

  // Giai đoạn 4: 3 chữ + 1 số
  if (/^[A-Z]{3}\d$/.test(code)) {
    const l1 = letters.indexOf(code[0]);
    const l2 = letters.indexOf(code[1]);
    const l3 = letters.indexOf(code[2]);
    const numPart = parseInt(code[3], 10);
    if (numPart >= 1 && numPart <= 9) {
      const letterIndex = l1 * 26 * 26 + l2 * 26 + l3;
      return 9999 + 26 * 9999 + 26 * 26 * 99 + letterIndex * 9 + numPart;
    }
  }

  // Giai đoạn 5: 4 chữ
  if (/^[A-Z]{4}$/.test(code)) {
    const l1 = letters.indexOf(code[0]);
    const l2 = letters.indexOf(code[1]);
    const l3 = letters.indexOf(code[2]);
    const l4 = letters.indexOf(code[3]);
    return (
      9999 +
      26 * 9999 +
      26 * 26 * 99 +
      26 * 26 * 26 * 9 +
      (l1 * 26 * 26 * 26 + l2 * 26 * 26 + l3 * 26 + l4 + 1)
    );
  }

  throw new Error('Invalid code');
}
