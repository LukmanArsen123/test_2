import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import {
  CATEGORY_LABELS,
  PRIORITY_LABELS,
  STATUS_LABELS,
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  Ticket,
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from '../../models/ticket.model';
import { TicketService, extractErrorMessage } from '../../services/ticket.service';

@Component({
  selector: 'app-ticket-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './ticket-form-dialog.component.html',
  styleUrl: './ticket-form-dialog.component.scss',
})
export class TicketFormDialogComponent {
  private readonly api = inject(TicketService);
  private readonly dialogRef = inject(MatDialogRef<TicketFormDialogComponent, boolean>);
  protected readonly ticket = inject<Ticket | null>(MAT_DIALOG_DATA);

  protected readonly isEdit = !!this.ticket;
  protected readonly saving = signal(false);
  protected readonly serverError = signal<string | null>(null);

  protected readonly categories = TICKET_CATEGORIES;
  protected readonly priorities = TICKET_PRIORITIES;
  protected readonly statuses = TICKET_STATUSES;
  protected readonly categoryLabels = CATEGORY_LABELS;
  protected readonly priorityLabels = PRIORITY_LABELS;
  protected readonly statusLabels = STATUS_LABELS;

  protected readonly form = new FormGroup({
    title: new FormControl(this.ticket?.title ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3), Validators.maxLength(100)],
    }),
    description: new FormControl(this.ticket?.description ?? '', {
      nonNullable: true,
      validators: [Validators.maxLength(2000)],
    }),
    requesterEmail: new FormControl(this.ticket?.requesterEmail ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.email, Validators.maxLength(254)],
    }),
    category: new FormControl<TicketCategory>(this.ticket?.category ?? 'Other', {
      nonNullable: true,
    }),
    priority: new FormControl<TicketPriority>(this.ticket?.priority ?? 'Medium', {
      nonNullable: true,
    }),
    status: new FormControl<TicketStatus>(this.ticket?.status ?? 'New', { nonNullable: true }),
  });

  protected save(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const base = {
      title: value.title.trim(),
      description: value.description.trim() || null,
      requesterEmail: value.requesterEmail.trim(),
      category: value.category,
      priority: value.priority,
    };

    this.saving.set(true);
    this.serverError.set(null);

    const request$ = this.ticket
      ? this.api.update(this.ticket.id, { ...base, status: value.status })
      : this.api.create(base);

    request$.subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => {
        this.saving.set(false);
        this.serverError.set(extractErrorMessage(err));
      },
    });
  }
}
