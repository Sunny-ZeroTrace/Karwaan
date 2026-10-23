import type { PhotoRef } from '../types';

export const galleryCategories = [
  'Animal Welfare',
  'Community Support',
  'Education',
  'Environment',
  'Events & Ground Support',
] as const;

export type GalleryCategory = (typeof galleryCategories)[number];

export interface GalleryItem extends PhotoRef {
  id: string;
  category: GalleryCategory;
  caption: string;
}

/**
 * PLACEHOLDER GALLERY: layout demo only.
 * To add a photo: drop the file in /public/photos/gallery/, then add an entry with
 * its src, alt text, ratio, category and caption.
 * To reorder: move entries up or down. To remove: delete the entry.
 * The page layout never needs editing.
 */
export const gallery: GalleryItem[] = [
  { id: 'g-01', category: 'Animal Welfare', ratio: '4/5', alt: 'Placeholder photo 1', caption: 'Caption for photo 1 goes here.' },
  { id: 'g-02', category: 'Community Support', ratio: '3/2', alt: 'Placeholder photo 2', caption: 'Caption for photo 2 goes here.' },
  { id: 'g-03', category: 'Education', ratio: '1/1', alt: 'Placeholder photo 3', caption: 'Caption for photo 3 goes here.' },
  { id: 'g-04', category: 'Environment', ratio: '3/4', alt: 'Placeholder photo 4', caption: 'Caption for photo 4 goes here.' },
  { id: 'g-05', category: 'Events & Ground Support', ratio: '16/10', alt: 'Placeholder photo 5', caption: 'Caption for photo 5 goes here.' },
  { id: 'g-06', category: 'Animal Welfare', ratio: '1/1', alt: 'Placeholder photo 6', caption: 'Caption for photo 6 goes here.' },
  { id: 'g-07', category: 'Community Support', ratio: '4/5', alt: 'Placeholder photo 7', caption: 'Caption for photo 7 goes here.' },
  { id: 'g-08', category: 'Education', ratio: '3/2', alt: 'Placeholder photo 8', caption: 'Caption for photo 8 goes here.' },
  { id: 'g-09', category: 'Environment', ratio: '4/5', alt: 'Placeholder photo 9', caption: 'Caption for photo 9 goes here.' },
  { id: 'g-10', category: 'Events & Ground Support', ratio: '1/1', alt: 'Placeholder photo 10', caption: 'Caption for photo 10 goes here.' },
  { id: 'g-11', category: 'Animal Welfare', ratio: '3/4', alt: 'Placeholder photo 11', caption: 'Caption for photo 11 goes here.' },
  { id: 'g-12', category: 'Community Support', ratio: '16/10', alt: 'Placeholder photo 12', caption: 'Caption for photo 12 goes here.' },
];
