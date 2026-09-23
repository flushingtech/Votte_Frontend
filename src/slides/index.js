import slide1 from "./slide_1.png";
import slide2 from "./slide_2.png";
import slide3 from "./slide_3.png";
import slide4 from "./slide_4.png";
import slide5 from "./slide_5.png";
import slide6 from "./slide_6.png";
import slide7 from "./slide_7.png";
import slide8 from "./slide_8.png";
import slide9 from "./slide_9.png";
import slide10 from "./slide_10.png";
import slide11 from "./slide_11.png";
import slide12 from "./slide_12.png";
import slide13 from "./slide_13.png";

// Local-only slide data for the presentation-mode MVP. Slides are bundled
// from src/slides instead of uploaded to Cloudinary, keyed by event id.
// Once slide management moves server-side (the event_slides table already
// exists for this), this map can be dropped in favor of `event.slides` from
// the API — EventScreen already prefers that when it's populated.
//
// `qrType` marks the slides that get a live QR code overlaid into their
// blank space (PresentationMode renders it and picks the destination URL
// based on the type): "checkin" -> /events/:eventId/check-in,
// "vote" -> /events/:eventId/vote.
const HACKATHON_DECK = [
  { imageUrl: slide1, order: 1 },
  { imageUrl: slide2, order: 2 },
  { imageUrl: slide3, order: 3 },
  { imageUrl: slide4, order: 4 },
  { imageUrl: slide5, order: 5, qrType: "checkin" },
  { imageUrl: slide6, order: 6 },
  { imageUrl: slide7, order: 7 },
  { imageUrl: slide8, order: 8 },
  { imageUrl: slide9, order: 9 },
  { imageUrl: slide10, order: 10 },
  { imageUrl: slide11, order: 11 },
  { imageUrl: slide12, order: 12, qrType: "vote" },
  { imageUrl: slide13, order: 13 },
];

export const LOCAL_EVENT_SLIDES = {
  75: HACKATHON_DECK, // "Flushing Tech Bi-Weekly Hackathon" (2026-03-22), now past
  107: HACKATHON_DECK, // "Test Event" (2026-09-23)
};
