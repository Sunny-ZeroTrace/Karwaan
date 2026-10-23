export const site = {
  name: 'Karwaan Foundation',
  shortName: 'Karwaan',
  motto: 'Building a Better Today, for a Brighter Tomorrow.',
  description:
    'Karwaan Foundation is a growing social-impact initiative working toward a better world through meaningful action, compassion and community participation.',
  contact: {
    person: 'Krishna Agarwal',
    phoneDisplay: '+91 6299674589',
    phoneHref: 'tel:+916299674589',
    /** The same number is the Foundation's WhatsApp number. */
    whatsappHref: 'https://wa.me/916299674589',
    email: 'karwaanfoundation070309@gmail.com',
    emailHref: 'mailto:karwaanfoundation070309@gmail.com',
    instagramHandle: '@karwaan.foundation.in',
    instagramUrl: 'https://www.instagram.com/karwaan.foundation.in/',
  },
  nav: [
    { to: '/work', label: 'Our work' },
    { to: '/gallery', label: 'Gallery' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ],
  cta: { to: '/volunteer', label: 'Become a Volunteer' },
} as const;
