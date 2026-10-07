import { getProductColorLabel, productColorStyles } from '@/lib/product-variants'

type ProductVariantSelectorProps = {
  sizes?: string[]
  colors?: string[]
  selectedSize: string
  selectedColor: string
  lang: 'ar' | 'en'
  onSizeChange: (size: string) => void
  onColorChange: (color: string) => void
}

export function ProductVariantSelector({
  sizes = [],
  colors = [],
  selectedSize,
  selectedColor,
  lang,
  onSizeChange,
  onColorChange,
}: ProductVariantSelectorProps) {
  return (
    <div className="mb-5 space-y-5">
      {sizes.length > 0 && (
        <fieldset>
          <legend className="mb-2.5 text-xs font-semibold">
            {lang === 'ar' ? 'المقاس' : 'Size'}
            {selectedSize && <span className="ms-2 text-muted-foreground">{selectedSize}</span>}
          </legend>
          <div className="flex flex-wrap gap-2">
            {sizes.map(size => (
              <button
                key={size}
                type="button"
                aria-pressed={selectedSize === size}
                onClick={() => onSizeChange(size)}
                className={`min-w-11 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all duration-200 active:scale-95 ${
                  selectedSize === size
                    ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                    : 'border-border bg-card hover:border-primary hover:text-primary'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {colors.length > 0 && (
        <fieldset>
          <legend className="mb-2.5 text-xs font-semibold">
            {lang === 'ar' ? 'اللون' : 'Color'}
            {selectedColor && (
              <span className="ms-2 text-muted-foreground">
                {getProductColorLabel(selectedColor, lang)}
              </span>
            )}
          </legend>
          <div className="flex flex-wrap gap-2.5">
            {colors.map(color => {
              const style = productColorStyles[color.toLowerCase()]
              return (
                <button
                  key={color}
                  type="button"
                  aria-label={getProductColorLabel(color, lang)}
                  aria-pressed={selectedColor === color}
                  title={getProductColorLabel(color, lang)}
                  onClick={() => onColorChange(color)}
                  className={`grid h-9 w-9 place-items-center rounded-full border-2 transition-all duration-200 hover:scale-110 active:scale-95 ${
                    selectedColor === color ? 'border-primary ring-2 ring-primary/25 ring-offset-2 ring-offset-background' : 'border-border'
                  }`}
                >
                  <span
                    className="h-6 w-6 rounded-full border border-black/10"
                    style={{ backgroundColor: style?.swatch ?? '#9ca3af' }}
                  />
                </button>
              )
            })}
          </div>
        </fieldset>
      )}
    </div>
  )
}
