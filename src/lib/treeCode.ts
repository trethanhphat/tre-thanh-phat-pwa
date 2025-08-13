const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function codeToNumber(code: string): number | '' {
  if (!code) return '';
  code = code.trim().toUpperCase();

  // Giai đoạn 1
  if (/^\d{4}$/.test(code)) return parseInt(code, 10);

  // Giai đoạn 2
  if (/^[A-Z]\d{3}$/.test(code)) {
    const idx = LETTERS.indexOf(code[0]);
    const num = parseInt(code.slice(1), 10);
    return 9999 + idx * 999 + num;
  }

  // Giai đoạn 3
  if (/^[A-Z]{2}\d{2}$/.test(code)) {
    const first = LETTERS.indexOf(code[0]);
    const second = LETTERS.indexOf(code[1]);
    const num = parseInt(code.slice(2), 10);
    return 9999 + 26 * 999 + (first * 26 + second) * 99 + num;
  }

  // Giai đoạn 4
  if (/^[A-Z]{3}\d$/.test(code)) {
    const first = LETTERS.indexOf(code[0]);
    const second = LETTERS.indexOf(code[1]);
    const third = LETTERS.indexOf(code[2]);
    const num = parseInt(code[3], 10);
    return 9999 + 26 * 999 + 26 * 26 * 99 + ((first * 26 + second) * 26 + third) * 9 + num;
  }

  // Giai đoạn 5
  if (/^[A-Z]{4}$/.test(code)) {
    const first = LETTERS.indexOf(code[0]);
    const second = LETTERS.indexOf(code[1]);
    const third = LETTERS.indexOf(code[2]);
    const fourth = LETTERS.indexOf(code[3]);
    return (
      9999 +
      26 * 999 +
      26 * 26 * 99 +
      26 * 26 * 26 * 9 +
      ((first * 26 + second) * 26 + third) * 26 +
      fourth
    );
  }

  return '';
}

export function numberToCode(num: number): string {
  if (!num || num < 1) return '';

  // Giai đoạn 1
  if (num <= 9999) return ('0000' + num).slice(-4);

  // Giai đoạn 2
  const phase2Start = 9999 + 1;
  const phase2End = 9999 + 26 * 999;
  if (num <= phase2End) {
    const offset = num - phase2Start;
    const letter = LETTERS[Math.floor(offset / 999)];
    const number = (offset % 999) + 1;
    return letter + ('000' + number).slice(-3);
  }

  // Giai đoạn 3
  const phase3Start = phase2End + 1;
  const phase3End = phase3Start + 26 * 26 * 99 - 1;
  if (num <= phase3End) {
    let offset = num - phase3Start;
    const first = Math.floor(offset / (26 * 99));
    offset %= 26 * 99;
    const second = Math.floor(offset / 99);
    const number = (offset % 99) + 1;
    return LETTERS[first] + LETTERS[second] + ('00' + number).slice(-2);
  }

  // Giai đoạn 4
  const phase4Start = phase3End + 1;
  const phase4End = phase4Start + 26 * 26 * 26 * 9 - 1;
  if (num <= phase4End) {
    let offset = num - phase4Start;
    const first = Math.floor(offset / (26 * 26 * 9));
    offset %= 26 * 26 * 9;
    const second = Math.floor(offset / (26 * 9));
    offset %= 26 * 9;
    const third = Math.floor(offset / 9);
    const number = (offset % 9) + 1;
    return LETTERS[first] + LETTERS[second] + LETTERS[third] + number;
  }

  // Giai đoạn 5
  const phase5Start = phase4End + 1;
  let offset = num - phase5Start;
  const first = Math.floor(offset / (26 * 26 * 26));
  offset %= 26 * 26 * 26;
  const second = Math.floor(offset / (26 * 26));
  offset %= 26 * 26;
  const third = Math.floor(offset / 26);
  const fourth = offset % 26;
  return LETTERS[first] + LETTERS[second] + LETTERS[third] + LETTERS[fourth];
}
