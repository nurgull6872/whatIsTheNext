import type { Poll } from '../types/poll';

// Faz 4'te tasarım sistemini gerçek veri olmadan gösterebilmek için.
// Faz 5'te API entegrasyonuyla birlikte kaldırılacak.

const now = Date.now();
const hoursAgo = (h: number) => new Date(now - h * 60 * 60 * 1000).toISOString();
const daysFromNow = (d: number) => new Date(now + d * 24 * 60 * 60 * 1000).toISOString();

export const MOCK_POLLS: Poll[] = [
  {
    id: 'mock-1',
    question: 'Akşam ne yesek?',
    description: 'Sipariş vermeden önce bir karara varalım.',
    author: { display_name: 'kelebek_avcisi' },
    status: 'open',
    is_open: true,
    created_at: hoursAgo(2),
    closes_at: daysFromNow(5),
    allow_guest_votes: true,
    total_votes: 47,
    my_vote: null,
    options: [
      { id: 'o1', text: 'Pizza', order: 0, vote_count: 23, percentage: 48.9 },
      { id: 'o2', text: 'Mantı', order: 1, vote_count: 19, percentage: 40.4 },
      { id: 'o3', text: 'Salata', order: 2, vote_count: 5, percentage: 10.7 },
    ],
  },
  {
    id: 'mock-2',
    question: 'Hafta sonu nereye gidelim?',
    description: null,
    author: { display_name: 'ugur_bocegi42' },
    status: 'open',
    is_open: true,
    created_at: hoursAgo(20),
    closes_at: daysFromNow(2),
    allow_guest_votes: true,
    total_votes: 12,
    my_vote: 'o5',
    options: [
      { id: 'o4', text: 'Sahil', order: 0, vote_count: 7, percentage: 58.3 },
      { id: 'o5', text: 'Dağ', order: 1, vote_count: 5, percentage: 41.7 },
    ],
  },
  {
    id: 'mock-3',
    question: 'Takım için hangi renk logo?',
    description: 'Son oylama, karar verildi.',
    author: { display_name: 'papatya_99' },
    status: 'closed',
    is_open: false,
    created_at: hoursAgo(96),
    closes_at: hoursAgo(1),
    allow_guest_votes: true,
    total_votes: 31,
    my_vote: 'o6',
    options: [
      { id: 'o6', text: 'Yeşil', order: 0, vote_count: 18, percentage: 58.1 },
      { id: 'o7', text: 'Mavi', order: 1, vote_count: 9, percentage: 29.0 },
      { id: 'o8', text: 'Turuncu', order: 2, vote_count: 4, percentage: 12.9 },
    ],
  },
];
