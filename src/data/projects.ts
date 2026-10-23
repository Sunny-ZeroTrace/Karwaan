import type { PhotoRef } from '../types';

export interface Project {
  slug: string;
  title: string;
  /** id from data/areas.ts */
  area: string;
  summary: string;
  /** null = shows "To be provided" */
  where: string | null;
  when: string | null;
  photos: PhotoRef[];
  /** Set to false once this is a real, verified project. */
  placeholder: boolean;
}

/**
 * PLACEHOLDER PROJECTS: layout demos only. They do not describe real activities.
 * Replace each entry with a real initiative (title, summary, where, when, photos).
 * Photos go in /public/photos/projects/<slug>/ and are referenced by `src`.
 */
export const projects: Project[] = [
  {
    slug: 'placeholder-initiative-a',
    title: 'Placeholder initiative A',
    area: 'animal-welfare',
    summary:
      'A short description of the initiative will appear here: what it is, who it supports and how people can take part.',
    where: null,
    when: null,
    placeholder: true,
    photos: [
      { alt: 'Main photograph for initiative A', ratio: '4/3' },
      { alt: 'Supporting photograph 1 for initiative A', ratio: '1/1' },
      { alt: 'Supporting photograph 2 for initiative A', ratio: '1/1' },
      { alt: 'Supporting photograph 3 for initiative A', ratio: '1/1' },
    ],
  },
  {
    slug: 'placeholder-initiative-b',
    title: 'Placeholder initiative B',
    area: 'community-support',
    summary:
      'A short description of the initiative will appear here: what it is, who it supports and how people can take part.',
    where: null,
    when: null,
    placeholder: true,
    photos: [
      { alt: 'Main photograph for initiative B', ratio: '4/3' },
      { alt: 'Supporting photograph 1 for initiative B', ratio: '1/1' },
      { alt: 'Supporting photograph 2 for initiative B', ratio: '1/1' },
      { alt: 'Supporting photograph 3 for initiative B', ratio: '1/1' },
    ],
  },
  {
    slug: 'placeholder-initiative-c',
    title: 'Placeholder initiative C',
    area: 'education',
    summary:
      'A short description of the initiative will appear here: what it is, who it supports and how people can take part.',
    where: null,
    when: null,
    placeholder: true,
    photos: [
      { alt: 'Main photograph for initiative C', ratio: '4/3' },
      { alt: 'Supporting photograph 1 for initiative C', ratio: '1/1' },
      { alt: 'Supporting photograph 2 for initiative C', ratio: '1/1' },
      { alt: 'Supporting photograph 3 for initiative C', ratio: '1/1' },
    ],
  },
  {
    slug: 'placeholder-initiative-d',
    title: 'Placeholder initiative D',
    area: 'environment',
    summary:
      'A short description of the initiative will appear here: what it is, who it supports and how people can take part.',
    where: null,
    when: null,
    placeholder: true,
    photos: [
      { alt: 'Main photograph for initiative D', ratio: '4/3' },
      { alt: 'Supporting photograph 1 for initiative D', ratio: '1/1' },
      { alt: 'Supporting photograph 2 for initiative D', ratio: '1/1' },
      { alt: 'Supporting photograph 3 for initiative D', ratio: '1/1' },
    ],
  },
];
