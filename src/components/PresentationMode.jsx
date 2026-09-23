import { useCallback, useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

// Full-screen slideshow. Takes an ordered `slides` array (each with an
// `imageUrl`) and renders one at a time. Next/previous is already wired up
// but only surfaced in the UI once there's more than one slide, so adding
// more slides later "just works" without further changes here.
//
// A slide with a `qrType` ("checkin" or "vote") gets a live QR code overlaid
// into its blank space instead of baked into the image, so it always points
// at the right event. Both slide templates leave the same blank region open
// (78%/40%/16%), so one overlay position serves either type.
const QR_DESTINATIONS = {
  checkin: (eventId) => `/events/${eventId}/check-in`,
  vote: (eventId) => `/events/${eventId}/vote`,
};

function PresentationMode({ slides, eventId, onExit }) {
  const [index, setIndex] = useState(0);
  const total = slides.length;

  const goNext = useCallback(() => {
    setIndex((i) => Math.min(i + 1, total - 1));
  }, [total]);

  const goPrev = useCallback(() => {
    setIndex((i) => Math.max(i - 1, 0));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onExit();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onExit, goNext, goPrev]);

  if (total === 0) return null;

  const currentSlide = slides[index];

  return (
    <div className="fixed inset-0 z-[10000] bg-black flex items-center justify-center">
      <button
        onClick={onExit}
        aria-label="Exit presentation"
        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
        Exit
      </button>

      {total > 1 && index > 0 && (
        <button
          onClick={goPrev}
          aria-label="Previous slide"
          className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-10 p-2 sm:p-3 text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-colors"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {total > 1 && index < total - 1 && (
        <button
          onClick={goNext}
          aria-label="Next slide"
          className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-10 p-2 sm:p-3 text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-colors"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      <div
        className="relative max-w-[95vw] max-h-[85vh]"
        style={{ aspectRatio: "16 / 9", width: "min(95vw, 85vh * 16 / 9)" }}
      >
        <img
          src={currentSlide.imageUrl}
          alt={`Slide ${index + 1}`}
          className="w-full h-full object-contain select-none"
        />

        {currentSlide.qrType && eventId && QR_DESTINATIONS[currentSlide.qrType] && (
          <div
            className="absolute bg-white p-3 rounded shadow-lg flex items-center justify-center"
            style={{ left: "73%", top: "39%", width: "26%", aspectRatio: "1 / 1" }}
          >
            <QRCodeSVG
              value={`${window.location.origin}${QR_DESTINATIONS[currentSlide.qrType](eventId)}`}
              className="w-full h-full"
            />
          </div>
        )}
      </div>

      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 px-3 py-1.5 text-sm font-semibold text-white bg-white/10 border border-white/20">
        {index + 1} / {total}
      </div>
    </div>
  );
}

export default PresentationMode;
