const EARTHSOUND_MARK_SRC = '/manus-storage/async-images/NU77aXd7C2W4Ha55l9VLly/image-1.webp';

type BrandMarkProps = {
  className: string;
};

export function BrandMark({ className }: BrandMarkProps) {
  return (
    <img
      className={className}
      src={EARTHSOUND_MARK_SRC}
      alt=""
      aria-hidden="true"
      width={48}
      height={48}
      decoding="async"
    />
  );
}
