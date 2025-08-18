export type Source = 'techcrunch' | 'theverge' | 'hn';

export type Category =
  | 'AI/ML'
  | 'Startups'
  | 'Cybersecurity'
  | 'Mobile'
  | 'Web3'
  | 'Cloud/DevOps'
  | 'Programming'
  | 'Hardware'
  | 'Gaming'
  | 'Policy/Regulation'
  | 'Science'
  | 'Other';

export const ALL_CATEGORIES: Category[] = [
  'AI/ML',
  'Startups',
  'Cybersecurity',
  'Mobile',
  'Web3',
  'Cloud/DevOps',
  'Programming',
  'Hardware',
  'Gaming',
  'Policy/Regulation',
  'Science',
  'Other'
];

export type NewsItem = {
  source: Source;
  id: string;
  title: string;
  url: string;
  publishedAt?: string;   // ISO
  author?: string;
  points?: number;        // HN
  commentsCount?: number; // HN
  categories: Category[]; // <- NEW
};

// Internal structure for RSS parsing
export type ParsedRssItem = {
  title: string;
  link: string;
  guid: string;
  isoDate?: string;
  author?: string;
  tags?: string[]; // raw <category> tags from RSS
};
