ColeMadeThat — put every file below in this folder:  images/
(Paths in HTML/CSS/JS are relative to the site root, e.g. images/logo.jpg)

================================================================================
BRANDING
================================================================================
  logo.jpg
    Header + footer wordmark tile on all pages.

================================================================================
HOME PAGE — HERO (full-width behind main headline)
================================================================================
  hero.jpg
    Poster for the home hero <video>, and CSS still fallback (.hero-bg-static).
  hero.mp4
    Primary looping background video (muted).
  hero.webm
    Optional second codec for the home hero video.

================================================================================
QUOTE PAGE — CSS BACKGROUNDS (orange “Start your project” strip + fallbacks)
================================================================================
  quote-form-head.jpg
    First-choice texture for the quote page banner (see .quote-project-banner).
  quote-hero.jpg
    Second fallback if quote-form-head.jpg is missing.
  hero.jpg
    Final fallback (same file as home hero still).

================================================================================
HOME — “WHAT WE PRINT” GRID (four category tiles)
================================================================================
  cat-labels.jpg
  cat-stickers.jpg
  cat-banners.jpg
  cat-packaging.jpg

================================================================================
SERVICE PAGES — FULL-BLEED HERO (Labels, Stickers, Banners, Packaging)
================================================================================
For each row: poster = still shown before/during load; mp4 = looping background.

  labels-hero.jpg      +  labels-hero.mp4
  stickers-hero.jpg    +  stickers-hero.mp4
  banners-hero.jpg     +  banners-hero.mp4
  packaging-hero.jpg   +  packaging-hero.mp4

================================================================================
SERVICE PAGES — “GALLERY / EXAMPLES” (three-up grids)
================================================================================
  labels-more-1.jpg … labels-more-3.jpg
  stickers-more-1.jpg … stickers-more-3.jpg
  banners-more-1.jpg … banners-more-3.jpg
  packaging-more-1.jpg … packaging-more-3.jpg

================================================================================
HOME — PORTFOLIO (“Product samples”)
================================================================================
  work-1.jpg … work-6.jpg

================================================================================
HOME — DEALS CARDS
================================================================================
  deal-1.jpg   — Starter deal image
  deal-2.jpg   — Growth deal image

================================================================================
CART / PRODUCT CONFIG — THUMBNAILS (used by JS for line items & previews)
================================================================================
  labels-thumb.jpg
  stickers-thumb.jpg
  banners-thumb.jpg
  packaging-thumb.jpg
  design-thumb.jpg     — Generic / design-upsell thumbnail if that flow is used

================================================================================
NOTES
================================================================================
  • Videos: keep service hero clips short, compressed, and muted for autoplay.
  • Posters (*.jpg): wide crops (~1920px+) match the hero layout best.
  • Logo: square PNG/JPG; code expects logo.jpg (rename your export to match).
