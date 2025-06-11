import {
  ArgumentMetadata,
  HttpStatus,
  Injectable,
  PipeTransform,
  UnprocessableEntityException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';

@Injectable()
export class ValidationPipe implements PipeTransform {
  async transform(value: unknown, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value);
    const errors = await validate(object ?? {});
    const responseErrors = this.transformError(errors);

    if (responseErrors.length > 0) {
      throw new UnprocessableEntityException(
        {
          code: HttpStatus.BAD_REQUEST,
          message: 'Error de validación',
          status: 'error',
          warning: responseErrors,
          error: [],
        },
        'Error de validación',
      );
    }

    return value;
  }

  private transformError(errors: ValidationError[]) {
    return errors.map((error) => ({
      field: error.property,
      code: null,
      value: this.transformItemError(error.constraints),
      constraints:
        error.children && error.children.length > 0
          ? this.transformError(error.children)
          : error.constraints,
    }));
  }

  private transformItemError(constraints?: Record<string, string>): string {
    if (!constraints) return '';
    return Object.values(constraints).join(' ');
  }

  private toValidate(metatype: unknown): boolean {
    const types = [String, Boolean, Number, Array, Object];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return !types.includes(metatype as any);
  }
}
