import { Link } from 'react-router-dom';
import { cn } from '@/src/lib/utils';
import { COMPANY_INFO } from '@/src/constants';
import logoSrc from '../../../jrs_ferros_logo.jpeg';

interface BrandLogoProps {
  className?: string;
  imageClassName?: string;
  labelClassName?: string;
  taglineClassName?: string;
  showTagline?: boolean;
}

export function BrandLogo({
  className,
  imageClassName,
  labelClassName,
  taglineClassName,
  showTagline = true,
}: BrandLogoProps) {
  return (
    <Link to="/" className={cn('flex items-center gap-3 group', className)}>
      <img
        src={logoSrc}
        alt={`${COMPANY_INFO.name} logo`}
        className={cn('h-12 w-12 rounded-lg object-cover shadow-sm transition-all group-hover:shadow-md', imageClassName)}
      />
      <div className="flex flex-col">
        <span className={cn('font-display font-bold text-xl leading-none tracking-tight', labelClassName)}>
          JRS FERROS
        </span>
        {showTagline && (
          <span className={cn('text-[10px] uppercase tracking-widest font-medium', taglineClassName)}>
            {COMPANY_INFO.tagline}
          </span>
        )}
      </div>
    </Link>
  );
}
