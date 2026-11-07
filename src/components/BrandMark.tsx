const EARTHSOUND_MARK_SRC = '/brand/earthsound-mark.png';

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
