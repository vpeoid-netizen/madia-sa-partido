import Image from 'next/image';
import { isExternalImageUrl, PROVINCIAL_FALLBACK } from '@/lib/image-utils';

interface MadiaImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  frameClassName?: string;
}

export function MadiaImage({
  src,
  alt,
  className = '',
  priority = false,
  fill = false,
  sizes,
  frameClassName = 'madia-image-frame',
}: MadiaImageProps) {
  const resolved = src || PROVINCIAL_FALLBACK;
  const external = isExternalImageUrl(resolved);

  const content = external ? (
    <img
      src={resolved}
      alt={alt}
      className={`madia-photo ${fill ? 'madia-photo-fill' : ''} ${className}`.trim()}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      referrerPolicy="no-referrer-when-downgrade"
    />
  ) : (
    <Image
      src={resolved}
      alt={alt}
      fill={fill}
      width={fill ? undefined : 800}
      height={fill ? undefined : 500}
      priority={priority}
      sizes={sizes || (fill ? '100vw' : '800px')}
      className={`madia-photo ${fill ? 'madia-photo-fill' : ''} ${className}`.trim()}
    />
  );

  if (fill) {
    return <div className={frameClassName}>{content}</div>;
  }

  return content;
}
