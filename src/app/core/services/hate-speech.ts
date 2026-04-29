import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class HateSpeechService {

  // قائمة كلمات مسيئة — تُوسَّع حسب الحاجة
  private readonly badWords = [
    'كلب','حمار','غبي','احا','تبا','لعنة','فاشل',
    'عبيط','بليد','تفو','نذل','وقح','خسيس','مجنون',
    'يلعن','زفت','قذر','خنزير','حقير'
  ];

  containsHateSpeech(text: string): boolean {
    const lower = text.toLowerCase();
    return this.badWords.some(w => lower.includes(w));
  }

  highlight(text: string): string {
    let result = text;
    this.badWords.forEach(w => {
      const re = new RegExp(w, 'gi');
      result = result.replace(re, `<mark class="hs-mark">${w}</mark>`);
    });
    return result;
  }
}
