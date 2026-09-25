import { Component, Inject, signal } from '@angular/core';
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
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  Ticket,
  TicketCategory,
  TicketPriority,
} from '../../data-access/ticket.model';
import { TicketStore } from '../../data-access/ticket.store';

@Component({
  selector: 'app-ticket-form',
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
  templateUrl: './ticket-form.component.html',
  styleUrl: './ticket-form.component.scss',
})
export class TicketFormComponent {
  protected readonly ticket: Ticket | null;
  protected readonly isEdit: boolean;
  protected readonly saving = signal(false);
  protected readonly serverError = signal<string | null>(null);

  protected readonly categories = TICKET_CATEGORIES;
  protected readonly priorities = TICKET_PRIORITIES;
  protected readonly categoryLabels = CATEGORY_LABELS;
  protected readonly priorityLabels = PRIORITY_LABELS;

  protected readonly form: FormGroup<{
    title: FormControl<string>;
    description: FormControl<string>;
    userEmail: FormControl<string>;
    category: FormControl<TicketCategory>;
    priority: FormControl<TicketPriority>;
  }>;

  constructor(
    private readonly store: TicketStore,
    private readonly dialogRef: MatDialogRef<TicketFormComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) ticket: Ticket | null,
  ) {
    this.ticket = ticket;
    this.isEdit = !!ticket;

    this.form = new FormGroup({
      title: new FormControl(ticket?.title ?? '', {
        nonNullable: true,
        validators: Validators.required,
      }),
      description: new FormControl(ticket?.description ?? '', { nonNullable: true }),
      userEmail: new FormControl(ticket?.userEmail ?? '', {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      }),
      category: new FormControl<TicketCategory>(ticket?.category ?? 'Other', {
        nonNullable: true,
      }),
      priority: new FormControl<TicketPriority>(ticket?.priority ?? 'Medium', {
        nonNullable: true,
      }),
    });
  }

  protected save(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const dto = {
      title: value.title.trim(),
      description: value.description.trim() || null,
      userEmail: value.userEmail.trim(),
      category: value.category,
      priority: value.priority,
    };

    this.saving.set(true);
    this.serverError.set(null);

    const request$ = this.ticket ? this.store.update(this.ticket.id, dto) : this.store.create(dto);

    request$.subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => {
        this.saving.set(false);
        this.serverError.set(err.error?.detail ?? 'Не удалось сохранить заявку');
      },
    });
  }
}
