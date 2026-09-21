import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  Subject,
  catchError,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  map,
  of,
  startWith,
  switchMap,
  tap,
} from 'rxjs';

import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import {
  CATEGORY_LABELS,
  PRIORITY_LABELS,
  STATUS_LABELS,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  Ticket,
  TicketPriority,
  TicketStatus,
} from '../../models/ticket.model';
import { TicketService, extractErrorMessage } from '../../services/ticket.service';
import { TicketFormDialogComponent } from '../ticket-form-dialog/ticket-form-dialog.component';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSnackBarModule,
  ],
  templateUrl: './ticket-list.component.html',
  styleUrl: './ticket-list.component.scss',
})
export class TicketListComponent implements OnInit {
  private readonly api = inject(TicketService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly tickets = signal<Ticket[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly hasFilters = signal(false);

  protected readonly searchControl = new FormControl('', { nonNullable: true });
  protected readonly statusControl = new FormControl<TicketStatus | null>(null);
  protected readonly priorityControl = new FormControl<TicketPriority | null>(null);

  protected readonly statuses = TICKET_STATUSES;
  protected readonly priorities = TICKET_PRIORITIES;
  protected readonly statusLabels = STATUS_LABELS;
  protected readonly priorityLabels = PRIORITY_LABELS;
  protected readonly categoryLabels = CATEGORY_LABELS;

  private readonly reload$ = new Subject<void>();

  ngOnInit(): void {
    const search$ = this.searchControl.valueChanges.pipe(
      map((v) => v.trim()),
      debounceTime(300),
      startWith(''),
      distinctUntilChanged(),
    );
    const status$ = this.statusControl.valueChanges.pipe(startWith(this.statusControl.value));
    const priority$ = this.priorityControl.valueChanges.pipe(
      startWith(this.priorityControl.value),
    );

    combineLatest([search$, status$, priority$, this.reload$.pipe(startWith(undefined))])
      .pipe(
        tap(([search, status, priority]) => {
          this.loading.set(true);
          this.error.set(null);
          this.hasFilters.set(!!search || !!status || !!priority);
        }),
        switchMap(([search, status, priority]) =>
          this.api.getAll({ search, status, priority }).pipe(
            catchError((err) => {
              this.error.set(extractErrorMessage(err));
              return of(null);
            }),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((result) => {
        if (result) this.tickets.set(result);
        this.loading.set(false);
      });
  }

  protected reload(): void {
    this.reload$.next();
  }

  protected resetFilters(): void {
    this.searchControl.setValue('');
    this.statusControl.setValue(null);
    this.priorityControl.setValue(null);
  }

  protected openForm(ticket: Ticket | null = null): void {
    this.dialog
      .open<TicketFormDialogComponent, Ticket | null, boolean>(TicketFormDialogComponent, {
        data: ticket,
        width: '600px',
        maxWidth: '95vw',
        autoFocus: 'first-tabbable',
      })
      .afterClosed()
      .subscribe((saved) => {
        if (saved) {
          this.snackBar.open(ticket ? 'Заявка обновлена' : 'Заявка создана', 'OK', {
            duration: 3000,
          });
          this.reload();
        }
      });
  }

  protected confirmDelete(ticket: Ticket): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: 'Удалить заявку?',
          message: `Заявка «${ticket.title}» будет удалена без возможности восстановления.`,
        },
        maxWidth: '95vw',
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.api.delete(ticket.id).subscribe({
          next: () => {
            this.snackBar.open('Заявка удалена', 'OK', { duration: 3000 });
            this.reload();
          },
          error: (err) =>
            this.snackBar.open(extractErrorMessage(err), 'Закрыть', { duration: 5000 }),
        });
      });
  }
}
