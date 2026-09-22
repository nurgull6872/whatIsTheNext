// Backend sozlesmesiyle birebir (PROJE_PLANI.md §5.4). Faz 5'te API
// entegrasyonunda ayni tipler kullanilacak; simdilik mock veri icin de gecerli.

export interface PollOption {
  id: string;
  text: string;
  order: number;
  vote_count: number;
  percentage: number;
}

export interface PollAuthor {
  display_name: string;
}

export type PollStatus = 'open' | 'closed';

export interface Poll {
  id: string;
  question: string;
  description: string | null;
  author: PollAuthor;
  status: PollStatus;
  is_open: boolean;
  created_at: string;
  closes_at: string | null;
  allow_guest_votes: boolean;
  total_votes: number;
  my_vote: string | null;
  options: PollOption[];
}

export type PollSort = 'new' | 'hot' | 'top';
