export interface Proposal {
    id: number;
    itemId: number;
    itemName: string;
    ratios: ProposalRatio[];
    message?: string;
    createdBy: number;
    createdDate: Date;
    status: 'pending' | 'accepted' | 'withdrawn' | 'countered';
    partyAcceptances: ProposalAcceptance[];
    previousProposalId?: number;
    withdrawnBy?: number;
    withdrawnDate?: Date;
  }
  
  export interface ProposalRatio {
    partyId: number;
    percentage: number;
  }
  
  export interface ProposalAcceptance {
    partyId: number;
    accepted: boolean;
    date: Date;
  }