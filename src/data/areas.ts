import type { Area } from '../types';

/**
 * Areas of impact, taken from the Foundation's current website copy.
 * They are presented as directions of focus, not as confirmed programmes.
 */
export const areas: Area[] = [
  {
    id: 'animal-welfare',
    name: 'Animal Welfare',
    summary: 'Supporting animals through feeding, care, compassion, and meaningful initiatives.',
  },
  {
    id: 'community-support',
    name: 'Community Support',
    summary:
      'Helping people and communities where practical, on-the-ground support can make a difference.',
  },
  {
    id: 'opportunity-employment',
    name: 'Opportunity & Employment',
    summary:
      'Working toward opportunities that help people build greater independence and stability.',
  },
  {
    id: 'education',
    name: 'Education',
    summary: 'Supporting learning, awareness, growth, and access to opportunity.',
  },
  {
    id: 'environment',
    name: 'Environment',
    summary:
      'Encouraging actions that contribute to a healthier, more responsible environment.',
  },
  {
    id: 'human-welfare',
    name: 'Human Welfare',
    summary:
      'Supporting initiatives that aim to improve quality of life and community wellbeing.',
  },
];

export const areaName = (id: string) => areas.find((a) => a.id === id)?.name ?? 'Area to be set';
