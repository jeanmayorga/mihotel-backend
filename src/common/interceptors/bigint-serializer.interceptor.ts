import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

function isDecimal(value: unknown): value is { toNumber(): number } {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof (value as { toNumber?: unknown }).toNumber === 'function'
  );
}

function replaceBigInt(value: unknown): unknown {
  if (typeof value === 'bigint') return Number(value);
  if (isDecimal(value)) return value.toNumber();
  if (Array.isArray(value)) return value.map(replaceBigInt);
  if (value instanceof Date) return value;
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, replaceBigInt(v)]),
    );
  }
  return value;
}

@Injectable()
export class BigIntSerializerInterceptor implements NestInterceptor {
  intercept(_ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(map(replaceBigInt));
  }
}
