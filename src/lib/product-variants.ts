export const productColorStyles: Record<string, { swatch: string; ar: string }> = {
  black: { swatch: '#171717', ar: 'أسود' },
  white: { swatch: '#ffffff', ar: 'أبيض' },
  cream: { swatch: '#eee4d3', ar: 'كريمي' },
  beige: { swatch: '#d6c2a1', ar: 'بيج' },
  olive: { swatch: '#66734b', ar: 'زيتي' },
  navy: { swatch: '#25334a', ar: 'كحلي' },
  blue: { swatch: '#477ca8', ar: 'أزرق' },
  brown: { swatch: '#795548', ar: 'بني' },
  gray: { swatch: '#9ca3af', ar: 'رمادي' },
  grey: { swatch: '#9ca3af', ar: 'رمادي' },
  red: { swatch: '#bd4a45', ar: 'أحمر' },
}

export function getProductColorLabel(color: string, lang: 'ar' | 'en') {
  return lang === 'ar' ? productColorStyles[color.toLowerCase()]?.ar ?? color : color
}
