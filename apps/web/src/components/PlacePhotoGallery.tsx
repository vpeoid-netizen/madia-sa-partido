import { MadiaImage } from '@/components/MadiaImage';
import type { PlaceImageInfo } from '@/lib/image-utils';

export function PlacePhotoGallery({
  images,
  title,
}: {
  images: PlaceImageInfo[];
  title: string;
}) {
  if (images.length === 0) return null;

  return (
    <section className="photo-gallery" aria-label={`Photos of ${title}`}>
      <h2>Photos</h2>
      <ul className="photo-gallery-grid">
        {images.map((image, index) => (
          <li key={image.photo_id || `${image.url}-${index}`} className="photo-gallery-item madia-glass">
            <MadiaImage
              src={image.url}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              frameClassName="madia-image-frame gallery-frame"
            />
            {image.attribution && (
              <p className="photo-attribution">{image.attribution}</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
