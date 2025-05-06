export type NotificationType = 
  | 'PROPOSAL_CREATED' 
  | 'PROPOSAL_WITHDRAWN' 
  | 'PROPOSAL_ACCEPTED' 
  | 'PROPOSAL_COUNTERED'
  | 'PROPOSAL_ACCEPTED_BY_PARTY';


export interface Notification {
    id: number;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    timestamp: Date;
    read: boolean;
    itemId?: number;
    partyId?: number;
    proposalId?: number;
    clearedBy?: number[];
  }