export interface MascotProps {
  /** Ek Tailwind sınıfları (boyut, konumlandırma, animasyon). */
  className?: string;
  /** Piksel cinsinden genişlik/yükseklik. Varsayılan bileşene göre değişir. */
  size?: number;
  /** Erişilebilirlik etiketi. Boş bırakılırsa dekoratif kabul edilir (aria-hidden). */
  title?: string;
}
