import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService, ClientInvoice } from '../../core/services/data.service';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './client-dashboard.component.html',
  styleUrl: './client-dashboard.component.css'
})
export class ClientDashboardComponent implements OnInit {
  data = inject(DataService);

  showRequestModal = false;
  showPoModal = false;
  showInvoiceModal = false;
  selectedInvoice: ClientInvoice | null = null;
  // Payment modal (simulated, no integrations)
  showPaymentModal = false;
  paymentInvoice: ClientInvoice | null = null;
  paymentForm = {
    method: 'Card',
    reference: ''
  };

  requestForm = {
    technology: '',
    duration: '',
    budget: 0
  };

  poForm = {
    enrollmentId: '',
    technology: '',
    duration: '',
    cost: 0,
    paymentTerms: 'Net 30'
  };

  ngOnInit() {
    this.data.loadEnrollments();
    this.data.loadClientPos();
    this.data.loadClientInvoices();
  }

  submitRequest() {
    this.data.createEnrollment(this.requestForm).subscribe({
      next: () => {
        this.showRequestModal = false;
        this.requestForm = { technology: '', duration: '', budget: 0 };
        this.data.loadEnrollments();
        alert('Training request submitted successfully!');
      },
      error: (err) => alert('Error: ' + err.error?.error)
    });
  }

  openPoModal(enr: any) {
    this.poForm = {
      enrollmentId: enr.enrollmentId,
      technology: enr.technology,
      duration: enr.duration,
      cost: enr.budget || 0,
      paymentTerms: 'Net 30'
    };
    this.showPoModal = true;
  }

  submitPO() {
    this.data.createClientPO(this.poForm).subscribe({
      next: () => {
        this.showPoModal = false;
        this.data.loadClientPos();
        alert('Purchase Order submitted successfully!');
      },
      error: (err) => alert('Error: ' + err.error?.error)
    });
  }

  openInvoiceModal(inv: ClientInvoice) {
    this.selectedInvoice = inv;
    this.showInvoiceModal = true;
  }

  // Open simulated payment modal
  openPaymentModal(inv: ClientInvoice) {
    this.paymentInvoice = inv;
    this.paymentForm = { method: 'Card', reference: '' };
    this.showPaymentModal = true;
  }

  // Confirm payment (simulated): mark invoice as Accepted
  confirmPayment() {
    if (!this.paymentInvoice) return;
    this.data.acceptClientInvoice(this.paymentInvoice.invoiceId).subscribe({
      next: () => {
        this.showPaymentModal = false;
        this.showInvoiceModal = false;
        this.paymentInvoice = null;
        this.data.loadClientInvoices();
        alert('Payment simulated: invoice accepted. Admin will confirm payment.');
      },
      error: (err) => alert('Error: ' + err.error?.error)
    });
  }

  hasPoForEnrollment(enrollmentId: string): boolean {
    return this.data.clientPos().some(po => po.enrollmentId === enrollmentId);
  }
}
