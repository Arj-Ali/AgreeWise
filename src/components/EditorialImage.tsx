import { useState } from 'react';
import { FileText } from 'lucide-react';

interface EditorialImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}

export function EditorialImage({
  src,
  alt,
  className = '',
  fallbackTitle = 'AgreeWise Visual',
}: EditorialImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#EFE9DD] via-[#E7DFD0] to-[#DDD2BF] text-[#4A433B] p-6 ${className}`}
      >
        <div className="w-11 h-11 rounded-xl bg-[#FFFDF9] border border-[#DFD7C8] flex items-center justify-center mb-2.5 text-[#8A5A20]">
          <FileText className="w-5 h-5" aria-hidden="true" />
        </div>
        <span className="text-xs font-medium tracking-tight text-center">{fallbackTitle}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
