/**
 * ai.js
 * Lightweight, fully client-side "AI" heuristic for the prototype.
 *
 * It does two real things (not random numbers):
 *   1. Pixel analysis of the uploaded photo (canvas) to estimate how much
 *      of the image looks like wet/reflective pavement -> "wetScore".
 *   2. Keyword analysis of the Russian description to estimate confidence
 *      and severity -> "keywordScore" / "severityScore".
 * Both are combined into a leak probability and a severity level.
 *
 * NOTE for production: swap analyzeImage()'s pixel heuristic for a real
 * vision model (e.g. an image-classification API), keep the same output
 * shape { wetScore } so the rest of the app doesn't need to change.
 */

const AI = {
  SEVERITY_LEVELS: {
    light: 'лёгкая',
    medium: 'средняя',
    hard: 'сложная'
  },

  KEYWORDS_CONFIDENCE: [
    'вода', 'воды', 'водой', 'течёт', 'течет', 'утечка', 'труба', 'трубы',
    'лужа', 'мокро', 'мокрый', 'мокрая', 'капает', 'протекает', 'сырость',
    'прорвало', 'бьёт', 'бьет', 'фонтан', 'заливает', 'подтекает'
  ],

  KEYWORDS_HIGH_SEVERITY: [
    'потоп', 'затопил', 'затопило', 'подвал', 'фундамент', 'трещина',
    'обвал', 'авария', 'прорвало', 'канализация', 'неделю', 'месяц',
    'постоянно', 'сильный напор', 'дорогу размыло', 'яма', 'провал',
    'размывает', 'несколько дней', 'давно', 'большая лужа'
  ],

  KEYWORDS_MED_SEVERITY: [
    'стена', 'плесень', 'запах', 'сыро', 'второй день', 'вчера и сегодня'
  ],

  KEYWORDS_LOW_SEVERITY: [
    'небольшая', 'чуть', 'слегка', 'капает', 'вчера', 'сегодня', 'немного'
  ],

  /**
   * Analyze an image dataURL and return a 0-100 "wetness" score.
   * Heuristic: downsamples the image, then for each pixel checks if it
   * looks like dark, low-saturation, slightly-blue wet pavement rather
   * than bright dry ground.
   */
  analyzeImage(dataUrl) {
    return new Promise((resolve) => {
      if (!dataUrl) { resolve(0); return; }

      const img = new Image();
      img.onload = () => {
        const size = 64;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, size, size);

        let wetPixels = 0;
        let totalPixels = 0;
        try {
          const data = ctx.getImageData(0, 0, size, size).data;
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i + 1], b = data[i + 2];
            const brightness = (r + g + b) / 3;
            const blueBias = b - (r + g) / 2;
            const saturation = Math.max(r, g, b) - Math.min(r, g, b);

            // Wet / reflective surfaces tend to be darker, low-to-mid
            // saturation, and not strongly warm (not dry sandy/brown).
            const looksWet = brightness < 150 && saturation < 60 && blueBias > -18;
            if (looksWet) wetPixels++;
            totalPixels++;
          }
        } catch (e) {
          // getImageData can fail on cross-origin/tainted canvases; degrade gracefully.
          console.warn('Image analysis unavailable, using fallback score', e);
          resolve(45);
          return;
        }

        const ratio = totalPixels ? wetPixels / totalPixels : 0;
        // Map ratio to a 0-100 score with a curve so mid-range photos
        // (which are the realistic case) land in a believable range.
        const score = Math.round(Math.min(100, ratio * 160));
        resolve(score);
      };
      img.onerror = () => resolve(0);
      img.src = dataUrl;
    });
  },

  analyzeDescription(text) {
    const lower = (text || '').toLowerCase();

    const countMatches = (list) => list.reduce((n, kw) => n + (lower.includes(kw) ? 1 : 0), 0);

    const confidenceMatches = countMatches(this.KEYWORDS_CONFIDENCE);
    const highMatches = countMatches(this.KEYWORDS_HIGH_SEVERITY);
    const medMatches = countMatches(this.KEYWORDS_MED_SEVERITY);
    const lowMatches = countMatches(this.KEYWORDS_LOW_SEVERITY);

    const confidenceScore = Math.min(100, confidenceMatches * 25 + (lower.length > 40 ? 10 : 0));
    const severityScore = Math.max(0, Math.min(100,
      highMatches * 30 + medMatches * 15 - lowMatches * 15 + 20
    ));

    return { confidenceScore, severityScore };
  },

  /**
   * Combine image + text analysis into a final assessment.
   */
  async assess(dataUrl, description) {
    const wetScore = await this.analyzeImage(dataUrl);
    const { confidenceScore, severityScore } = this.analyzeDescription(description);

    const leakProbability = Math.round(clamp(wetScore * 0.75 + confidenceScore * 0.25, 0, 100));
    const severityRaw = Math.round(clamp(wetScore * 0.4 + severityScore * 0.6, 0, 100));

    let severityKey;
    if (severityRaw < 35) severityKey = 'light';
    else if (severityRaw < 70) severityKey = 'medium';
    else severityKey = 'hard';

    const severity = this.SEVERITY_LEVELS[severityKey];
    const summary = this.buildSummary(leakProbability, severityKey, wetScore);

    return { leakProbability, severity, severityKey, wetScore, summary };
  },

  buildSummary(leakProbability, severityKey, wetScore) {
    const parts = [];

    if (leakProbability >= 70) {
      parts.push('На фото хорошо видны признаки активной утечки воды.');
    } else if (leakProbability >= 40) {
      parts.push('На фото есть признаки, похожие на утечку воды, но однозначно судить сложно.');
    } else {
      parts.push('Явных признаков активной утечки на фото немного — возможно, повреждение уже высохло или незначительное.');
    }

    if (severityKey === 'hard') {
      parts.push('Судя по описанию, ситуация может быть опасной — рекомендуется приоритетный выезд.');
    } else if (severityKey === 'medium') {
      parts.push('Ситуация умеренной опасности, стоит проверить в ближайшее время.');
    } else {
      parts.push('Похоже на незначительное повреждение, можно проверить в плановом порядке.');
    }

    return parts.join(' ');
  }
};

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}
