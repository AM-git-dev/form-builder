import { describe, it, expect } from 'vitest';
import { useFormValidation } from '../../src/client/composables/useFormValidation.js';
import type { FormField } from '../../src/client/types/form.types.js';

function createField(overrides: Partial<FormField> = {}): FormField {
  return {
    id: 'field-1',
    type: 'TEXT',
    label: 'Test Field',
    placeholder: null,
    required: false,
    order: 0,
    options: null,
    validation: null,
    config: null,
    ...overrides,
  };
}

describe('useFormValidation', () => {
  describe('required field validation', () => {
    it('should fail when required field has no value', () => {
      const { validateFields, getError, hasErrors } = useFormValidation();

      const fields = [createField({ required: true })];
      const valid = validateFields(fields, {});

      expect(valid).toBe(false);
      expect(hasErrors.value).toBe(true);
      expect(getError('field-1')).toBe('Ce champ est requis');
    });

    it('should pass when required field has a value', () => {
      const { validateFields, hasErrors } = useFormValidation();

      const fields = [createField({ required: true })];
      const valid = validateFields(fields, { 'field-1': 'some value' });

      expect(valid).toBe(true);
      expect(hasErrors.value).toBe(false);
    });

    it('should fail when required field has empty string value', () => {
      const { validateFields, getError } = useFormValidation();

      const fields = [createField({ required: true })];
      const valid = validateFields(fields, { 'field-1': '' });

      expect(valid).toBe(false);
      expect(getError('field-1')).toBe('Ce champ est requis');
    });

    it('should fail when required field has null value', () => {
      const { validateFields, getError } = useFormValidation();

      const fields = [createField({ required: true })];
      const valid = validateFields(fields, { 'field-1': null });

      expect(valid).toBe(false);
      expect(getError('field-1')).toBe('Ce champ est requis');
    });
  });

  describe('email validation', () => {
    it('should fail when email format is invalid', () => {
      const { validateFields, getError } = useFormValidation();

      const fields = [createField({ type: 'EMAIL', required: true })];
      const valid = validateFields(fields, { 'field-1': 'not-email' });

      expect(valid).toBe(false);
      expect(getError('field-1')).toBe('Adresse email invalide');
    });

    it('should pass when email format is valid', () => {
      const { validateFields } = useFormValidation();

      const fields = [createField({ type: 'EMAIL', required: true })];
      const valid = validateFields(fields, { 'field-1': 'test@example.com' });

      expect(valid).toBe(true);
    });
  });

  describe('phone validation', () => {
    it('should fail when phone format is invalid', () => {
      const { validateFields, getError } = useFormValidation();

      const fields = [createField({ type: 'PHONE', required: true })];
      const valid = validateFields(fields, { 'field-1': 'abc' });

      expect(valid).toBe(false);
      expect(getError('field-1')).toBe('Numero de telephone invalide');
    });

    it('should pass when phone format is valid', () => {
      const { validateFields } = useFormValidation();

      const fields = [createField({ type: 'PHONE', required: true })];
      const valid = validateFields(fields, { 'field-1': '+33612345678' });

      expect(valid).toBe(true);
    });
  });

  describe('number min/max validation', () => {
    it('should fail when number is below min', () => {
      const { validateFields, getError } = useFormValidation();

      const fields = [createField({
        type: 'NUMBER',
        required: true,
        validation: { min: 0, max: 10 },
      })];

      const valid = validateFields(fields, { 'field-1': '-1' });

      expect(valid).toBe(false);
      expect(getError('field-1')).toBe('La valeur minimale est 0');
    });

    it('should fail when number is above max', () => {
      const { validateFields, getError } = useFormValidation();

      const fields = [createField({
        type: 'NUMBER',
        required: true,
        validation: { min: 0, max: 10 },
      })];

      const valid = validateFields(fields, { 'field-1': '11' });

      expect(valid).toBe(false);
      expect(getError('field-1')).toBe('La valeur maximale est 10');
    });

    it('should pass when number is within range', () => {
      const { validateFields } = useFormValidation();

      const fields = [createField({
        type: 'NUMBER',
        required: true,
        validation: { min: 0, max: 10 },
      })];

      const valid = validateFields(fields, { 'field-1': '5' });

      expect(valid).toBe(true);
    });

    it('should fail when value is not a valid number', () => {
      const { validateFields, getError } = useFormValidation();

      const fields = [createField({
        type: 'NUMBER',
        required: true,
      })];

      const valid = validateFields(fields, { 'field-1': 'abc' });

      expect(valid).toBe(false);
      expect(getError('field-1')).toBe('Veuillez entrer un nombre valide');
    });
  });

  describe('string length validation', () => {
    it('should fail when string is shorter than minLength', () => {
      const { validateFields, getError } = useFormValidation();

      const fields = [createField({
        required: true,
        validation: { minLength: 3, maxLength: 10 },
      })];

      const valid = validateFields(fields, { 'field-1': 'ab' });

      expect(valid).toBe(false);
      expect(getError('field-1')).toBe('Minimum 3 caracteres');
    });

    it('should fail when string exceeds maxLength', () => {
      const { validateFields, getError } = useFormValidation();

      const fields = [createField({
        required: true,
        validation: { minLength: 3, maxLength: 10 },
      })];

      const valid = validateFields(fields, { 'field-1': 'a very long text that exceeds' });

      expect(valid).toBe(false);
      expect(getError('field-1')).toBe('Maximum 10 caracteres');
    });

    it('should pass when string length is within bounds', () => {
      const { validateFields } = useFormValidation();

      const fields = [createField({
        required: true,
        validation: { minLength: 3, maxLength: 10 },
      })];

      const valid = validateFields(fields, { 'field-1': 'hello' });

      expect(valid).toBe(true);
    });
  });

  describe('pattern validation', () => {
    it('should fail when value does not match pattern', () => {
      const { validateFields, getError } = useFormValidation();

      const fields = [createField({
        required: true,
        validation: { pattern: '^[A-Z]+$' },
      })];

      const valid = validateFields(fields, { 'field-1': 'lowercase' });

      expect(valid).toBe(false);
      expect(getError('field-1')).toBe('Format invalide');
    });

    it('should pass when value matches pattern', () => {
      const { validateFields } = useFormValidation();

      const fields = [createField({
        required: true,
        validation: { pattern: '^[A-Z]+$' },
      })];

      const valid = validateFields(fields, { 'field-1': 'UPPERCASE' });

      expect(valid).toBe(true);
    });
  });

  describe('error management', () => {
    it('should clear a single field error', () => {
      const { validateFields, clearFieldError, getError } = useFormValidation();

      const fields = [createField({ required: true })];
      validateFields(fields, {});
      expect(getError('field-1')).toBeDefined();

      clearFieldError('field-1');
      expect(getError('field-1')).toBeUndefined();
    });

    it('should clear all errors', () => {
      const { validateFields, clearErrors, hasErrors } = useFormValidation();

      const fields = [
        createField({ id: 'f1', required: true }),
        createField({ id: 'f2', required: true }),
      ];
      validateFields(fields, {});
      expect(hasErrors.value).toBe(true);

      clearErrors();
      expect(hasErrors.value).toBe(false);
    });

    it('should replace previous errors on re-validation', () => {
      const { validateFields, getError, hasErrors } = useFormValidation();

      const fields = [createField({ required: true })];

      // First validation: fails
      validateFields(fields, {});
      expect(getError('field-1')).toBe('Ce champ est requis');

      // Second validation: passes
      validateFields(fields, { 'field-1': 'value' });
      expect(hasErrors.value).toBe(false);
      expect(getError('field-1')).toBeUndefined();
    });
  });

  describe('non-required field behavior', () => {
    it('should skip validation for non-required empty fields', () => {
      const { validateFields } = useFormValidation();

      const fields = [createField({ type: 'EMAIL', required: false })];
      const valid = validateFields(fields, {});

      expect(valid).toBe(true);
    });

    it('should still validate format when non-required field has a value', () => {
      const { validateFields, getError } = useFormValidation();

      const fields = [createField({ type: 'EMAIL', required: false })];
      const valid = validateFields(fields, { 'field-1': 'invalid' });

      expect(valid).toBe(false);
      expect(getError('field-1')).toBe('Adresse email invalide');
    });
  });

  describe('multiple fields', () => {
    it('should report errors for all invalid fields', () => {
      const { validateFields, getError } = useFormValidation();

      const fields = [
        createField({ id: 'name', required: true }),
        createField({ id: 'email', type: 'EMAIL', required: true }),
      ];
      const valid = validateFields(fields, { email: 'bad' });

      expect(valid).toBe(false);
      expect(getError('name')).toBe('Ce champ est requis');
      expect(getError('email')).toBe('Adresse email invalide');
    });
  });
});
