/** Supported image ratios. Pick the one that matches the photo you add. */
export type Ratio = '1/1' | '4/5' | '3/4' | '4/3' | '3/2' | '16/10' | '16/9';

/**
 * A photo reference. Leave `src` empty to show a labelled placeholder.
 * To use a real photo: put the file in /public/photos/... and set
 * src: '/photos/gallery/your-file.jpg'.
 * `focal` is the point (0–100, percent) that stays visible when the image is cropped.
 */
export interface PhotoRef {
  src?: string;
  alt: string;
  ratio: Ratio;
  focal?: { x: number; y: number };
}

export interface Area {
  id: string;
  name: string;
  summary: string;
  /** Optional photo shown when hovering this area on the home page. */
  photo?: PhotoRef;
}
