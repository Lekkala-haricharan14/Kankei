export type TrainerInvoiceStatus = 'Created' | 'Verified' | 'Approved' | 'Paid';
export type ClientInvoiceStatus = 'Generated' | 'Sent' | 'Paid';

export interface TrainerInvoice {
    id: string;
    enrollmentId: string;
    trainerPoId: string;
    hoursWorked?: number; // if hourly
    amount: number;
    invoiceDate: Date;
    status: TrainerInvoiceStatus;
}

export interface ClientInvoice {
    id: string;
    enrollmentId: string;
    clientPoId: string;
    trainerInvoiceId?: string; // Linkage for traceability
    baseAmount: number;
    tax: number; // GST
    totalAmount: number;
    dueDate: Date;
    status: ClientInvoiceStatus;
}
