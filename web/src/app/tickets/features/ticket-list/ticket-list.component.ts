import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, signal } from '@angular/core';
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
import { Observable, Subject, combineLatest, debounceTime, distinctUntilChanged, map, startWith } from 'rxjs';

import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { TicketMetaService } from '../../data-access/ticket-meta.service';
import { Ticket, TicketPriority, TicketStatus } from '../../data-access/ticket.model';
import { TicketStore } from '../../data-access/ticket.store';
import { TicketFormComponent } from '../ticket-form/ticket-form.component';

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
  protected readonly hasFilters = signal(false);

  protected readonly searchControl = new FormControl('', { nonNullable: true });
  protected readonly statusControl = new FormControl<TicketStatus | null>(null);
  protected readonly priorityControl = new FormControl<TicketPriority | null>(null);

  private readonly reload$ = new Subject<void>();

  constructor(
    protected readonly store: TicketStore,
    protected readonly meta: TicketMetaService,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
    private readonly destroyRef: DestroyRef,
  ) {}

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
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([search, status, priority]) => {
        this.hasFilters.set(!!search || !!status || !!priority);
        this.store.load({ search, status, priority });
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
      .open<TicketFormComponent, Ticket | null, boolean>(TicketFormComponent, {
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
        this.runMutation(this.store.delete(ticket.id), 'Заявка удалена');
      });
  }

  protected changeStatus(ticket: Ticket, status: TicketStatus): void {
    if (status === ticket.status) return;

    this.runMutation(this.store.changeStatus(ticket.id, status), 'Статус обновлён');
  }

  /** Выполняет изменяющий запрос; при успехе — тост и перезагрузка списка. Ошибки показывает httpErrorInterceptor. */
  private runMutation(request$: Observable<unknown>, successText: string): void {
    request$.subscribe(() => {
      this.snackBar.open(successText, 'OK', { duration: 3000 });
      this.reload();
    });
  }
}
