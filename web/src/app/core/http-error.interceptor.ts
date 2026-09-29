import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';

/**
 * Глобальная обработка ошибок HTTP: показывает пользователю сообщение от API (ProblemDetails)
 * и пробрасывает ошибку дальше. Поэтому в компонентах и сервисах ошибки запросов не обрабатываются.
 */
export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      snackBar.open(errorMessage(err), 'Закрыть', { duration: 5000 });
      return throwError(() => err);
    }),
  );
};

function errorMessage(err: HttpErrorResponse): string {
  if (err.status === 0) return 'Сервер недоступен. Проверьте, что API запущен.';

  const problem = err.error;
  // ValidationProblemDetails: { errors: { Field: ['сообщение', ...] } }
  if (problem?.errors) return Object.values<string[]>(problem.errors).flat().join('\n');
  return problem?.detail ?? 'Произошла ошибка. Попробуйте ещё раз.';
}
