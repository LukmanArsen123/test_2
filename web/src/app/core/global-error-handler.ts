import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, Injectable, Injector, NgZone, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly injector = inject(Injector);
  private readonly zone = inject(NgZone);

  handleError(error: unknown): void {
    if (error instanceof HttpErrorResponse) {
      const snackBar = this.injector.get(MatSnackBar);
      this.zone.run(() => snackBar.open(this.messageOf(error), 'Закрыть', { duration: 5000 }));
    }
    console.error(error);
  }

  private messageOf(error: HttpErrorResponse): string {
    if (error.status === 0) return 'Сервер недоступен. Проверьте, что API запущен.';

    const problem = error.error;
    if (problem?.errors) return Object.values<string[]>(problem.errors).flat().join('\n');
    return problem?.detail ?? 'Произошла ошибка. Попробуйте ещё раз.';
  }
}
