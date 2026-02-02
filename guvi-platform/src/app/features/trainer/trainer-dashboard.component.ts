import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService, TrainerPO } from '../../core/services/data.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-trainer-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './trainer-dashboard.component.html',
  styleUrl: './trainer-dashboard.component.css'
})
export class TrainerDashboardComponent implements OnInit {
  data = inject(DataService);
  auth = inject(AuthService);

  showInvoiceModal = false;
  selectedPO: TrainerPO | null = null;

  invoiceForm = {
    enrollmentId: '',
    trainerPoId: '',
    hoursWorked: 0,
    amount: 0
  };

  get pendingPOsCount(): number {
    return this.data.trainerPos().filter(po => po.status === 'Sent').length;
  }

  get totalEarnings(): number {
    return this.data.trainerInvoices()
      .filter(inv => inv.status === 'Paid')
      .reduce((sum, inv) => sum + inv.amount, 0);
  }

  ngOnInit() {
    this.data.loadEnrollments();
    this.data.loadTrainerPos();
    this.data.loadTrainerInvoices();
  }

  hasInvoiceForPO(poId: string): boolean {
    return this.data.trainerInvoices().some(inv => inv.trainerPoId === poId);
  }

  acceptPo(poId: string) {
    this.data.acceptTrainerPO(poId).subscribe({
      next: () => {
        this.data.loadTrainerPos();
        alert('PO Accepted! You can now create an invoice.');
      },
      error: (err) => alert('Error: ' + err.error?.error)
    });
  }

  openInvoiceModal(po: TrainerPO) {
    this.selectedPO = po;
    this.invoiceForm = {
      enrollmentId: po.enrollmentId,
      trainerPoId: po.poId,
      hoursWorked: 0,
      amount: po.totalAmount
    };
    this.showInvoiceModal = true;
  }

  closeModal() {
    this.showInvoiceModal = false;
    this.selectedPO = null;
  }

  submitInvoice() {
    this.data.createTrainerInvoice(this.invoiceForm).subscribe({
      next: () => {
        this.closeModal();
        this.data.loadTrainerInvoices();
        alert('Invoice submitted successfully!');
      },
      error: (err) => alert('Error: ' + err.error?.error)
    });
  }
}
