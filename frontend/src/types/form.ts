import type { InputHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react';
import type { BaseFormProps } from './generic';

export interface FormInputProps extends InputHTMLAttributes<HTMLInputElement>, BaseFormProps {}

export interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement>, BaseFormProps {
  children: ReactNode;
}

export interface FormCheckboxProps extends InputHTMLAttributes<HTMLInputElement>, BaseFormProps {}

export interface FormInputDateProps extends InputHTMLAttributes<HTMLInputElement>, BaseFormProps {}

export interface FormInputFileProps extends InputHTMLAttributes<HTMLInputElement>, BaseFormProps {
  accept?: string;
}

export interface FormTextProps extends InputHTMLAttributes<HTMLTextAreaElement>, BaseFormProps {
  rows?: number;
} 