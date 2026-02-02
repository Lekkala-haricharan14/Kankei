import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService, ClientPO } from '../../core/services/data.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  data = inject(DataService);

  showAcceptModal = false;
  selectedPO: ClientPO | null = null;
  trainers = signal<Array<{ _id: string; name: string; email: string }>>([]);

  acceptForm = {
    commissionPercent: 20,
    trainerId: '',
    trainerName: '',
    paymentType: 'Fixed' as 'Hourly' | 'Fixed'
  };

  pendingClientPos = computed(() =>
    this.data.clientPos().filter(p => p.status === 'Submitted').length
  );

  pendingInvoices = computed(() =>
    this.data.trainerInvoices().filter(i => i.status === 'Created').length
  );

  totalRevenue = computed(() =>
    this.data.clientInvoices()
      .filter(i => i.status === 'Paid')
      .reduce((sum, i) => sum + i.totalAmount, 0)
  );

  commissionAmount = computed(() => {
    if (!this.selectedPO) return 0;
    return (this.selectedPO.cost * this.acceptForm.commissionPercent) / 100;
  });

  trainerAmount = computed(() => {
    if (!this.selectedPO) return 0;
    return this.selectedPO.cost - this.commissionAmount();
  });

  ngOnInit() {
    this.data.loadEnrollments();
    this.data.loadClientPos();
    this.data.loadTrainerPos();
    this.data.loadTrainerInvoices();
    this.data.loadClientInvoices();
    this.loadTrainers();
  }

  loadTrainers() {
    this.data.getTrainers().subscribe({
      next: (data) => this.trainers.set(data),
      error: (err) => console.error('Error loading trainers:', err)
    });
  }

  approveEnrollment(enrollmentId: string) {
    this.data.updateEnrollmentStatus(enrollmentId, 'Approved').subscribe({
      next: () => this.data.loadEnrollments(),
      error: (err) => alert('Error: ' + err.error?.error)
    });
  }

  openAcceptModal(po: ClientPO) {
    this.selectedPO = po;
    this.acceptForm = {
      commissionPercent: 20,
      trainerId: '',
      trainerName: '',
      paymentType: 'Fixed'
    };
    this.showAcceptModal = true;
  }

  onTrainerSelect(trainerId: string) {
    const trainer = this.trainers().find(t => t._id === trainerId);
    this.acceptForm.trainerName = trainer?.name || '';
  }

  calculateAmounts() {
    // Triggers recalculation via computed signals
  }

  acceptPOWithCommission() {
    if (!this.selectedPO || !this.acceptForm.trainerId) return;

    this.data.acceptClientPOWithCommission(this.selectedPO.poId, {
      commissionPercent: this.acceptForm.commissionPercent,
      trainerId: this.acceptForm.trainerId,
      trainerName: this.acceptForm.trainerName,
      paymentType: this.acceptForm.paymentType
    }).subscribe({
      next: () => {
        this.showAcceptModal = false;
        this.data.loadClientPos();
        this.data.loadTrainerPos();
        alert('PO accepted! Trainer PO has been created.');
      },
      error: (err) => alert('Error: ' + err.error?.error)
    });
  }

  rejectPO(poId: string) {
    this.data.updateClientPOStatus(poId, 'Rejected').subscribe({
      next: () => this.data.loadClientPos(),
      error: (err) => alert('Error: ' + err.error?.error)
    });
  }

  sendTrainerPO(poId: string) {
    this.data.sendTrainerPO(poId).subscribe({
      next: () => {
        this.data.loadTrainerPos();
        alert('Trainer PO sent successfully!');
      },
      error: (err) => alert('Error: ' + err.error?.error)
    });
  }
}
