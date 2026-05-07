import type { ImgHTMLAttributes } from 'react';
import { cn } from '@/src/lib/utils';
import type { CmsImageVariantMeta } from '@/src/types/cms';

interface CmsImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  meta?: CmsImageVariantMeta;
  imageClassName?: string;
}

export function CmsImage({ src, meta, alt, className, imageClassName, ...props }: CmsImageProps) {
  const source = meta?.url ?? src;
  const objectFit = meta?.objectFit ?? (meta?.mode === 'contain' || meta?.mode === 'original' ? 'contain' : 'cover');

  return (
    <div
      className={cn('relative h-full w-full overflow-hidden', className)}
      style={{ backgroundColor: objectFit === 'contain' ? meta?.background ?? '#f1f5f9' : undefined }}
    >
      <img
        src={source}
        alt={alt}
        className={cn(
          'h-full w-full',
          objectFit === 'contain' ? 'object-contain' : 'object-cover',
          imageClassName
        )}
        {...props}
      />
    </div>
  );
}
