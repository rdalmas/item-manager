export interface Item {
    id: number;
    name: string;
    description: string;
    ownerIds: number[];
    totalCost: number;
    createdDate?: Date;
    lastModified?: Date;
    hasProposals?: boolean;
}