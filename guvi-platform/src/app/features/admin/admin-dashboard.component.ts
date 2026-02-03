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
  // Trainer invoice -> client invoice modal
  showGenerateInvoiceModal = false;
  selectedTrainerInvoice: any = null;
  generateInvoiceForm: any = {
    baseAmount: 0,
    dueDate: new Date().toISOString().slice(0, 10),
    clientPoId: '',
    clientId: ''
  };
  trainers = signal<Array<{ _id: string; name: string; email: string }>>([]);

  // Toast notification state
  toastMessage = '';
  toastType: 'success' | 'error' | 'info' = 'info';
  showToast = false;

  // Confirmation state
  confirmAction: { userId: string; action: 'approve' | 'reject' } | null = null;

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

  pendingUsersCount = computed(() => this.data.pendingUsers().length);

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
    this.data.loadPendingUsers(); // Load pending users for approval
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

  // ====== Trainer Invoice -> Client Invoice ======
  openGenerateInvoiceModal(inv: any) {
    this.selectedTrainerInvoice = inv;
    // Try to pre-fill client PO if exists
    const clientPo = this.data.clientPos().find(p => p.enrollmentId === inv.enrollmentId);
    this.generateInvoiceForm = {
      baseAmount: clientPo ? clientPo.cost : inv.amount,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), // +7 days
      clientPoId: clientPo ? clientPo.poId : '',
      clientId: clientPo ? (clientPo as any).clientId : ''
    };
    this.showGenerateInvoiceModal = true;
  }

  createClientInvoiceFromTrainer() {
    if (!this.selectedTrainerInvoice) return;
    const payload = {
      enrollmentId: this.selectedTrainerInvoice.enrollmentId,
      clientPoId: this.generateInvoiceForm.clientPoId,
      clientId: this.generateInvoiceForm.clientId,
      trainerInvoiceId: this.selectedTrainerInvoice.invoiceId,
      baseAmount: Number(this.generateInvoiceForm.baseAmount),
      dueDate: this.generateInvoiceForm.dueDate
    };

    this.data.createClientInvoice(payload).subscribe({
      next: (created) => {
        // Optionally send immediately
        this.data.sendClientInvoice(created.invoiceId).subscribe({
          next: () => {
            this.showGenerateInvoiceModal = false;
            this.data.loadClientInvoices();
            this.data.loadTrainerInvoices();
            alert('Client invoice created and sent to client successfully!');
          },
          error: (err) => {
            console.error(err);
            alert('Client invoice created but failed to send: ' + err.error?.error);
          }
        });
      },
      error: (err) => alert('Error creating client invoice: ' + err.error?.error)
    });
  }

  updateTrainerInvoice(invoiceId: string, status: string) {
    this.data.updateTrainerInvoiceStatus(invoiceId, status).subscribe({
      next: () => {
        this.data.loadTrainerInvoices();
        this.showToastNotification(`Invoice ${invoiceId} marked ${status}`, 'success');
      },
      error: (err) => this.showToastNotification('Error: ' + (err.error?.error || 'Unknown'), 'error')
    });
  }

  // Show confirmation dialog
  showConfirmApprove(userId: string) {
    this.confirmAction = { userId, action: 'approve' };
  }

  showConfirmReject(userId: string) {
    this.confirmAction = { userId, action: 'reject' };
  }

  cancelConfirm() {
    this.confirmAction = null;
  }

  confirmApproveReject() {
    if (!this.confirmAction) return;

    const { userId, action } = this.confirmAction;

    if (action === 'approve') {
      this.data.approveUser(userId).subscribe({
        next: () => {
          this.data.loadPendingUsers();
          this.showToastNotification('User approved successfully!', 'success');
          this.confirmAction = null;
        },
        error: (err) => {
          this.showToastNotification('Error: ' + (err.error?.error || 'Unknown error'), 'error');
          this.confirmAction = null;
        }
      });
    } else {
      this.data.rejectUser(userId).subscribe({
        next: () => {
          this.data.loadPendingUsers();
          this.showToastNotification('User rejected', 'info');
          this.confirmAction = null;
        },
        error: (err) => {
          this.showToastNotification('Error: ' + (err.error?.error || 'Unknown error'), 'error');
          this.confirmAction = null;
        }
      });
    }
  }

  showToastNotification(message: string, type: 'success' | 'error' | 'info') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;

    // Auto-hide after 3 seconds
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }
}
