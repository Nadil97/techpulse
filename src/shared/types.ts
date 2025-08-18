export type Source = 'techcrunch' | 'theverge' | 'hn';

export type NewsItem = {
  source: Source;
  id: string;
  title: string;
  url: string;
  publishedAt?: string;  
  author?: string;
  points?: number;       
  commentsCount?: number;
};
