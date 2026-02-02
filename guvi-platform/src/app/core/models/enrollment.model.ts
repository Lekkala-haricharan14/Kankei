export type EnrollmentStatus = 'Requested' | 'Approved' | 'Ongoing' | 'Completed';

export interface Enrollment {
    id: string;
    clientId: string;
    clientName: string;
    technology: string;
    trainerId?: string;
    trainerName?: string;
    duration: string; // e.g., "40 Hours"
    budget?: number;
    status: EnrollmentStatus;
    createdAt: Date;
}
