import { apiClient } from './client';
import type { Paginated } from '../types/pagination';
import type { Poll, PollSort, PollStatus } from '../types/poll';

export interface ListPollsParams {
  sort?: PollSort;
  status?: PollStatus;
  page?: number;
}

export interface CreatePollPayload {
  question: string;
  description?: string;
  options: { text: string }[];
  closes_at?: string;
}

export async function listPolls(params: ListPollsParams = {}): Promise<Paginated<Poll>> {
  const { data } = await apiClient.get<Paginated<Poll>>('/polls/', { params });
  return data;
}

export async function getPoll(id: string): Promise<Poll> {
  const { data } = await apiClient.get<Poll>(`/polls/${id}/`);
  return data;
}

export async function createPoll(payload: CreatePollPayload): Promise<Poll> {
  const { data } = await apiClient.post<Poll>('/polls/', payload);
  return data;
}

export async function closePoll(id: string): Promise<Poll> {
  const { data } = await apiClient.patch<Poll>(`/polls/${id}/`, { status: 'closed' });
  return data;
}

export async function deletePoll(id: string): Promise<void> {
  await apiClient.delete(`/polls/${id}/`);
}

export async function votePoll(id: string, optionId: string): Promise<Poll> {
  const { data } = await apiClient.post<Poll>(`/polls/${id}/vote/`, { option_id: optionId });
  return data;
}

export async function myPolls(params: { page?: number } = {}): Promise<Paginated<Poll>> {
  const { data } = await apiClient.get<Paginated<Poll>>('/polls/mine/', { params });
  return data;
}
