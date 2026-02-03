import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface Enrollment {
    _id?: string;
    enrollmentId: string;
    clientId: string;
    clientName: string;
    technology: string;
    trainerId?: string;
    trainerName?: string;
    duration: string;
    startDate: string | Date;
    endDate: string | Date;
    numberOfPeople: number;
    trainingMode: 'Online' | 'Offline' | 'Hybrid';
    location?: string;
    remarks?: string;
    budget?: number;
    status: 'Requested' | 'Approved' | 'Ongoing' | 'Completed';
    createdAt: Date;
}

export interface ClientPO {
    _id?: string;
    poId: string;
    enrollmentId: string;
    clientName: string;
    technology: string;
    duration: string;
    cost: number;
    paymentTerms: string;
    status: 'Submitted' | 'Accepted' | 'Rejected';
    commissionPercent?: number;
    commissionAmount?: number;
    trainerAmount?: number;
    trainerPoId?: string;
    createdAt: Date;
}

export interface TrainerPO {
    _id?: string;
    poId: string;
    enrollmentId: string;
    trainerId: string;
    trainerName: string;
    paymentType: 'Hourly' | 'Fixed';
    rate: number;
    totalAmount: number;
    status: 'Generated' | 'Sent' | 'Accepted';
    createdAt: Date;
}

export interface TrainerInvoice {
    _id?: string;
    invoiceId: string;
    enrollmentId: string;
    trainerPoId: string;
    trainerId?: string;
    trainerName?: string;
    hoursWorked?: number;
    amount: number;
    invoiceDate: Date;
    status: 'Created' | 'Verified' | 'Approved' | 'Paid';
    clientInvoiceCreated?: boolean;
}

export interface ClientInvoice {
    _id?: string;
    invoiceId: string;
    enrollmentId: string;
    clientPoId: string;
    clientId?: string;
    trainerInvoiceId?: string;
    baseAmount: number;
    tax: number;
    totalAmount: number;
    dueDate: Date;
    status: 'Generated' | 'Sent' | 'Accepted' | 'Paid';
}

@Injectable({
    providedIn: 'root'
})
export class DataService {
    private apiUrl = environment.apiUrl;

    // Signals for state
    private enrollmentsSignal = signal<Enrollment[]>([]);
    private clientPosSignal = signal<ClientPO[]>([]);
    private trainerPosSignal = signal<TrainerPO[]>([]);
    private trainerInvoicesSignal = signal<TrainerInvoice[]>([]);
    private clientInvoicesSignal = signal<ClientInvoice[]>([]);
    private pendingUsersSignal = signal<any[]>([]);

    readonly enrollments = this.enrollmentsSignal.asReadonly();
    readonly clientPos = this.clientPosSignal.asReadonly();
    readonly trainerPos = this.trainerPosSignal.asReadonly();
    readonly trainerInvoices = this.trainerInvoicesSignal.asReadonly();
    readonly clientInvoices = this.clientInvoicesSignal.asReadonly();
    readonly pendingUsers = this.pendingUsersSignal.asReadonly();

    constructor(private http: HttpClient, private auth: AuthService) { }

    private getHeaders(): HttpHeaders {
        return new HttpHeaders(this.auth.getAuthHeader());
    }

    // ============ ENROLLMENTS ============
    loadEnrollments() {
        this.http.get<Enrollment[]>(`${this.apiUrl}/enrollments`, { headers: this.getHeaders() })
            .subscribe({
                next: (data) => this.enrollmentsSignal.set(data),
                error: (err) => console.error('Error loading enrollments:', err)
            });
    }

    createEnrollment(data: Partial<Enrollment>) {
        return this.http.post<Enrollment>(`${this.apiUrl}/enrollments`, data, { headers: this.getHeaders() });
    }

    updateEnrollmentStatus(enrollmentId: string, status: string) {
        return this.http.patch<Enrollment>(`${this.apiUrl}/enrollments/${enrollmentId}/status`, { status }, { headers: this.getHeaders() });
    }

    assignTrainer(enrollmentId: string, trainerId: string, trainerName: string) {
        return this.http.patch<Enrollment>(`${this.apiUrl}/enrollments/${enrollmentId}/assign-trainer`,
            { trainerId, trainerName }, { headers: this.getHeaders() });
    }

    assignTrainerToEnrollment(enrollmentId: string, data: any) {
        return this.http.patch<Enrollment>(`${this.apiUrl}/enrollments/${enrollmentId}/assign-trainer`,
            data, { headers: this.getHeaders() });
    }

    // ============ CLIENT POs ============
    loadClientPos() {
        this.http.get<ClientPO[]>(`${this.apiUrl}/client-pos`, { headers: this.getHeaders() })
            .subscribe({
                next: (data) => this.clientPosSignal.set(data),
                error: (err) => console.error('Error loading client POs:', err)
            });
    }

    createClientPO(data: Partial<ClientPO>) {
        return this.http.post<ClientPO>(`${this.apiUrl}/client-pos`, data, { headers: this.getHeaders() });
    }

    updateClientPOStatus(poId: string, status: string) {
        return this.http.patch<ClientPO>(`${this.apiUrl}/client-pos/${poId}/status`, { status }, { headers: this.getHeaders() });
    }

    acceptClientPOWithCommission(poId: string, data: {
        commissionPercent: number;
        trainerId: string;
        trainerName: string;
        paymentType: 'Hourly' | 'Fixed';
    }) {
        return this.http.patch<{ clientPo: ClientPO; trainerPo: TrainerPO }>(
            `${this.apiUrl}/client-pos/${poId}/status`,
            { status: 'Accepted', ...data },
            { headers: this.getHeaders() }
        );
    }

    getTrainers() {
        return this.http.get<Array<{ _id: string; name: string; email: string; expertise?: string }>>(
            `${this.apiUrl}/auth/trainers`,
            { headers: this.getHeaders() }
        );
    }

    // ============ TRAINER POs ============
    loadTrainerPos() {
        this.http.get<TrainerPO[]>(`${this.apiUrl}/trainer-pos`, { headers: this.getHeaders() })
            .subscribe({
                next: (data) => this.trainerPosSignal.set(data),
                error: (err) => console.error('Error loading trainer POs:', err)
            });
    }

    createTrainerPO(data: Partial<TrainerPO>) {
        return this.http.post<TrainerPO>(`${this.apiUrl}/trainer-pos`, data, { headers: this.getHeaders() });
    }

    sendTrainerPO(poId: string) {
        return this.http.patch<TrainerPO>(`${this.apiUrl}/trainer-pos/${poId}/send`, {}, { headers: this.getHeaders() });
    }

    acceptTrainerPO(poId: string) {
        return this.http.patch<TrainerPO>(`${this.apiUrl}/trainer-pos/${poId}/accept`, {}, { headers: this.getHeaders() });
    }

    // ============ INVOICES ============
    loadTrainerInvoices() {
        this.http.get<TrainerInvoice[]>(`${this.apiUrl}/invoices/trainer`, { headers: this.getHeaders() })
            .subscribe({
                next: (data) => this.trainerInvoicesSignal.set(data),
                error: (err) => console.error('Error loading trainer invoices:', err)
            });
    }

    createTrainerInvoice(data: Partial<TrainerInvoice>) {
        return this.http.post<TrainerInvoice>(`${this.apiUrl}/invoices/trainer`, data, { headers: this.getHeaders() });
    }

    updateTrainerInvoiceStatus(invoiceId: string, status: string) {
        return this.http.patch<TrainerInvoice>(`${this.apiUrl}/invoices/trainer/${invoiceId}/status`, { status }, { headers: this.getHeaders() });
    }

    loadClientInvoices() {
        this.http.get<ClientInvoice[]>(`${this.apiUrl}/invoices/client`, { headers: this.getHeaders() })
            .subscribe({
                next: (data) => this.clientInvoicesSignal.set(data),
                error: (err) => console.error('Error loading client invoices:', err)
            });
    }

    createClientInvoice(data: Partial<ClientInvoice>) {
        return this.http.post<ClientInvoice>(`${this.apiUrl}/invoices/client`, data, { headers: this.getHeaders() });
    }

    // Send client invoice (Admin)
    sendClientInvoice(invoiceId: string) {
        return this.http.patch<ClientInvoice>(`${this.apiUrl}/invoices/client/${invoiceId}/send`, {}, { headers: this.getHeaders() });
    }

    // Mark client invoice as paid (Admin)
    markClientInvoiceAsPaid(invoiceId: string) {
        return this.http.patch<ClientInvoice>(`${this.apiUrl}/invoices/client/${invoiceId}/paid`, {}, { headers: this.getHeaders() });
    }

    acceptClientInvoice(invoiceId: string) {
        return this.http.patch<ClientInvoice>(`${this.apiUrl}/invoices/client/${invoiceId}/accept`, {}, { headers: this.getHeaders() });
    }

    // ============ USER APPROVAL (Admin only) ============
    loadPendingUsers() {
        this.http.get<any[]>(`${this.apiUrl}/auth/pending-users`, { headers: this.getHeaders() })
            .subscribe({
                next: (data) => this.pendingUsersSignal.set(data),
                error: (err) => console.error('Error loading pending users:', err)
            });
    }

    approveUser(userId: string) {
        return this.http.patch<any>(`${this.apiUrl}/auth/users/${userId}/approve`, {}, { headers: this.getHeaders() });
    }

    rejectUser(userId: string) {
        return this.http.patch<any>(`${this.apiUrl}/auth/users/${userId}/reject`, {}, { headers: this.getHeaders() });
    }
}

