import { ref, computed } from 'vue';
import type { FormField, FieldType } from '../types/form.types.js';
import { isValidEmail, isValidPhone, isNotEmpty } from '../utils/validators.js';

export interface FieldError {
  fieldId: string;
  message: string;
}

export function useFormValidation() {
  const errors = ref<Map<string, string>>(new Map());

  function validateField(field: FormField, value: unknown): string | null {
    // required check
    if (field.required && !isNotEmpty(value)) {
      return 'Ce champ est requis';
    }

    // skip further if empty & not required
    if (!isNotEmpty(value)) return null;

    const strValue = String(value);

    // type-specific validation
    switch (field.type) {
      case 'EMAIL':
        if (!isValidEmail(strValue)) return 'Adresse email invalide';
        break;
      case 'PHONE':
        if (!isValidPhone(strValue)) return 'Numero de telephone invalide';
        break;
      case 'NUMBER': {
        const num = Number(strValue);
        if (isNaN(num)) return 'Veuillez entrer un nombre valide';
        if (field.validation?.min !== undefined && num < field.validation.min)
          return `La valeur minimale est ${field.validation.min}`;
        if (field.validation?.max !== undefined && num > field.validation.max)
          return `La valeur maximale est ${field.validation.max}`;
        break;
      }
      default:
        break;
    }

    // string length validation
    if (typeof value === 'string' && field.validation) {
      if (field.validation.minLength && strValue.length < field.validation.minLength)
        return `Minimum ${field.validation.minLength} caracteres`;
      if (field.validation.maxLength && strValue.length > field.validation.maxLength)
        return `Maximum ${field.validation.maxLength} caracteres`;
      if (field.validation.pattern) {
        const regex = new RegExp(field.validation.pattern);
        if (!regex.test(strValue)) return 'Format invalide';
      }
    }

    return null;
  }

  function validateFields(fields: FormField[], values: Record<string, unknown>): boolean {
    errors.value.clear();
    let isValid = true;

    for (const field of fields) {
      const error = validateField(field, values[field.id]);
      if (error) {
        errors.value.set(field.id, error);
        isValid = false;
      }
    }

    return isValid;
  }

  function getError(fieldId: string): string | undefined {
    return errors.value.get(fieldId);
  }

  function clearErrors(): void {
    errors.value.clear();
  }

  function clearFieldError(fieldId: string): void {
    errors.value.delete(fieldId);
  }

  const hasErrors = computed(() => errors.value.size > 0);

  return {
    errors,
    hasErrors,
    validateField,
    validateFields,
    getError,
    clearErrors,
    clearFieldError,
  };
}
