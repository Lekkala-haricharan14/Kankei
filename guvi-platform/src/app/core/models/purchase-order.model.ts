export type ClientPOStatus = 'Submitted' | 'Accepted' | 'Rejected';
export type TrainerPOStatus = 'Generated' | 'Sent' | 'Accepted';

export interface ClientPO {
    id: string;
    enrollmentId: string;
    clientName: string;
    technology: string;
    duration: string;
    cost: number;
    paymentTerms: string;
    status: ClientPOStatus;
    createdAt: Date;
}

export interface TrainerPO {
    id: string;
    enrollmentId: string;
    trainerId: string;
    trainerName: string;
    paymentType: 'Hourly' | 'Fixed';
    rate: number;
    totalAmount: number; // rate * duration or fixed
    status: TrainerPOStatus;
    createdAt: Date;
}
