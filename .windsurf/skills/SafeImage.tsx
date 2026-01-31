import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/shared/utils/cn";
import { Loader2, ImageOff } from "@/shared/utils/icons";
import { getImageUrl, isValidImage } from "@/core/utils";

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string | null;
  fallbackType?: "accommodation" | "activity" | "nature";
  aspectRatio?: "square" | "video" | "wide" | "auto";
  showSkeleton?: boolean;
}

const ASPECT_RATIOS = {
  square: "aspect-square",
  video: "aspect-video",
  wide: "aspect-[21/9]",
  auto: "",
};

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt = "Imagen",
  className,
  fallbackType = "nature",
  aspectRatio = "auto",
  showSkeleton = true,
  style,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!src) {
      setIsLoading(false);
      setError(false);
      setCurrentSrc(null);
      return;
    }

    setIsLoading(true);
    setError(false);

    if (!isValidImage(src)) {
      setError(true);
      setIsLoading(false);
      return;
    }

    const fullUrl = getImageUrl(src);
    setCurrentSrc(fullUrl);

    // Timeout de seguridad: si no carga en 15s, mostramos error
    const timer = setTimeout(() => {
      setIsLoading((loading) => {
        if (loading) {
          setError(true);
          return false;
        }
        return loading;
      });
    }, 15000);

    return () => clearTimeout(timer);
  }, [src]);

  const handleLoad = () => {
    setIsLoading(false);
    setError(false);
  };

  const handleError = () => {
    setError(true);
    setIsLoading(false);
  };

  return (
    <div 
      className={cn(
        "relative overflow-hidden bg-gray-100",
        ASPECT_RATIOS[aspectRatio],
        className
      )}
      data-fallback-type={fallbackType}
    >
      <AnimatePresence>
        {isLoading && showSkeleton && (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-10 flex items-center justify-center bg-gray-200"
          >
            <Loader2 className="w-6 h-6 text-primary/30 animate-spin" />
          </motion.div>
        )}

        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-gray-50 p-4 text-center"
          >
            <ImageOff className="w-8 h-8 text-gray-300 mb-2" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              No disponible
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {currentSrc && (
        <img
          src={currentSrc}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          style={style}
          className={cn(
            "w-full h-full object-cover block transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100"
          )}
          {...props}
        />
      )}
    </div>
  );
};
