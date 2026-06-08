'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ProductMediaImage from '@/components/products/ProductMediaImage';
import {
  buildProductMediaItems,
  cloudinaryVideoThumbnail,
  type ProductMediaItem,
} from '@/utils/productMedia.util';

type ProductDetailGalleryProps = {
  productName: string;
  images: string[];
  videos: string[];
};

const LENS = 140;
const ZOOM = 2.8;

export default function ProductDetailGallery({
  productName,
  images,
  videos,
}: ProductDetailGalleryProps) {
  const mediaItems = useMemo(
    () => buildProductMediaItems(images, videos),
    [images, videos]
  );

  const [mediaIndex, setMediaIndex] = useState(0);
  const imgContainerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState({ x: 0, y: 0, show: false });

  useEffect(() => {
    setMediaIndex(0);
  }, [images, videos]);

  useEffect(() => {
    if (mediaIndex >= mediaItems.length) setMediaIndex(0);
  }, [mediaItems.length, mediaIndex]);

  const currentMedia = mediaItems[mediaIndex] ?? mediaItems[0];
  const imageThumbs = mediaItems.filter((m) => m.kind === 'image');
  const videoThumbs = mediaItems.filter((m) => m.kind === 'video');
  const hasMultiple = mediaItems.length > 1;

  const goPrev = useCallback(() => {
    setMediaIndex((i) => (i - 1 + mediaItems.length) % mediaItems.length);
  }, [mediaItems.length]);

  const goNext = useCallback(() => {
    setMediaIndex((i) => (i + 1) % mediaItems.length);
  }, [mediaItems.length]);

  const handleImageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = imgContainerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setZoom({ x: e.clientX - rect.left, y: e.clientY - rect.top, show: true });
  };

  return (
    <div>
      <div className="relative mb-4 group">
        <div
          ref={imgContainerRef}
          className={`relative h-[min(600px,70vh)] overflow-hidden rounded-lg bg-[#EEF5F9] ${
            currentMedia?.kind === 'image' ? 'cursor-crosshair' : ''
          }`}
          onMouseMove={currentMedia?.kind === 'image' ? handleImageMouseMove : undefined}
          onMouseLeave={() => setZoom((z) => ({ ...z, show: false }))}
          onMouseEnter={() =>
            currentMedia?.kind === 'image' && setZoom((z) => ({ ...z, show: true }))
          }
        >
          {currentMedia?.kind === 'image' ? (
            <>
              <ProductMediaImage
                src={currentMedia.src}
                alt={productName}
                fill
                className="bg-[#E5E5E5] object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />

              {zoom.show && imgContainerRef.current && (() => {
                const cw = imgContainerRef.current.offsetWidth;
                const ch = imgContainerRef.current.offsetHeight;
                const lx = Math.max(0, Math.min(zoom.x - LENS / 2, cw - LENS));
                const ly = Math.max(0, Math.min(zoom.y - LENS / 2, ch - LENS));
                const imgW = cw * ZOOM;
                const imgH = ch * ZOOM;
                const imgLeft = -(zoom.x * ZOOM - LENS / 2);
                const imgTop = -(zoom.y * ZOOM - LENS / 2);
                return (
                  <div
                    className="absolute rounded-full overflow-hidden pointer-events-none z-20 shadow-2xl"
                    style={{
                      width: LENS,
                      height: LENS,
                      left: lx,
                      top: ly,
                      border: '2px solid #E36630',
                      boxShadow:
                        '0 0 0 1px rgba(227,102,48,0.3), 0 8px 32px rgba(0,0,0,0.35)',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={currentMedia.src}
                      alt=""
                      style={{
                        position: 'absolute',
                        width: imgW,
                        height: imgH,
                        left: imgLeft,
                        top: imgTop,
                        maxWidth: 'none',
                        pointerEvents: 'none',
                      }}
                    />
                  </div>
                );
              })()}

              {!zoom.show && (
                <div className="absolute bottom-3 right-3 bg-black/50 text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                  Hover to zoom
                </div>
              )}
            </>
          ) : currentMedia?.kind === 'video' ? (
            <video
              key={currentMedia.src}
              src={currentMedia.src}
              controls
              playsInline
              className="h-full w-full bg-[#E5E5E5] object-contain"
            >
              Your browser does not support the video tag.
            </video>
          ) : null}

          {hasMultiple && (
            <>
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md hover:bg-white"
                aria-label="Previous image"
              >
                <svg className="h-5 w-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={goNext}
                className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md hover:bg-white"
                aria-label="Next image"
              >
                <svg className="h-5 w-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <div className="absolute bottom-3 left-3 rounded-full bg-black/50 px-2.5 py-0.5 text-xs text-white">
                {mediaIndex + 1} / {mediaItems.length}
              </div>
            </>
          )}
        </div>

        {zoom.show && currentMedia?.kind === 'image' && imgContainerRef.current && (() => {
          const cw = imgContainerRef.current.offsetWidth;
          const ch = imgContainerRef.current.offsetHeight;
          const panelW = cw;
          const panelH = ch;
          const imgW = cw * ZOOM;
          const imgH = ch * ZOOM;
          const bgX = -((zoom.x / cw) * imgW - panelW / 2);
          const bgY = -((zoom.y / ch) * imgH - panelH / 2);
          return (
            <div
              className="absolute top-0 pointer-events-none rounded-xl overflow-hidden shadow-2xl border border-[#E36630]/30 z-30 hidden lg:block"
              style={{ left: cw + 12, width: panelW, height: panelH }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentMedia.src}
                alt=""
                style={{
                  position: 'absolute',
                  width: imgW,
                  height: imgH,
                  left: bgX,
                  top: bgY,
                  maxWidth: 'none',
                }}
              />
            </div>
          );
        })()}
      </div>

      <div className="grid grid-cols-5 gap-2">
        {imageThumbs.map((item, index) => (
          <ThumbButton
            key={`img-${item.src}-${index}`}
            item={item}
            isActive={mediaIndex === item.index}
            productName={productName}
            onSelect={() => setMediaIndex(item.index)}
          />
        ))}
        {videoThumbs.map((item, index) => (
          <ThumbButton
            key={`vid-${item.src}-${index}`}
            item={item}
            isActive={mediaIndex === item.index}
            productName={productName}
            onSelect={() => setMediaIndex(item.index)}
            isVideo
          />
        ))}
      </div>
    </div>
  );
}

function ThumbButton({
  item,
  isActive,
  productName,
  onSelect,
  isVideo,
}: {
  item: ProductMediaItem;
  isActive: boolean;
  productName: string;
  onSelect: () => void;
  isVideo?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative w-full aspect-square overflow-hidden rounded-lg border-2 bg-[#E5E5E5] transition-all ${
        isActive ? 'border-[#E36630]' : 'border-gray-200'
      }`}
    >
      {isVideo || item.kind === 'video' ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cloudinaryVideoThumbnail(item.src)}
            alt={`${productName} video`}
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/85 shadow">
              <svg className="ml-0.5 h-4 w-4 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
          <div className="absolute bottom-1 right-1 rounded bg-black/50 px-1.5 py-0.5 text-[10px] font-medium text-white">
            Video
          </div>
        </>
      ) : (
        <ProductMediaImage
          src={item.src}
          alt={`${productName} thumbnail`}
          fill
          className="bg-[#E5E5E5] object-cover transition-transform hover:scale-105"
          sizes="80px"
        />
      )}
    </button>
  );
}
