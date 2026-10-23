export const STATUSES = ['pending', 'accepted', 'declined'] as const;
export type Status = (typeof STATUSES)[number];
export type StatusFilter = Status | 'all';

export const statusLabels: Record<Status, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  declined: 'Declined',
};

/** One volunteer application as shown in the dashboard (timestamps converted to Date). */
export interface ApplicationRecord {
  id: string;
  referenceCode: string;
  fullName: string;
  age: number;
  whatsappNumber: string;
  email: string;
  city: string;
  preference1: string;
  preference2: string;
  availability: string;
  unexpectedSituationResponse: string;
  independentTaskResponse: string;
  initiativeResponse: string;
  additionalInformation: string;
  privacyNoticeVersion: string;
  status: Status;
  createdAt: Date | null;
  consentedAt: Date | null;
  reviewedAt: Date | null;
  reviewedBy: string;
}
