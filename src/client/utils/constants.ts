import type { FieldType } from '../types/form.types.js';

export const FIELD_TYPES: { type: FieldType; label: string; icon: string }[] = [
  { type: 'TEXT', label: 'Texte', icon: 'T' },
  { type: 'EMAIL', label: 'Email', icon: '@' },
  { type: 'PHONE', label: 'Telephone', icon: '#' },
  { type: 'NUMBER', label: 'Nombre', icon: '#' },
  { type: 'TEXTAREA', label: 'Zone de texte', icon: 'P' },
  { type: 'SELECT', label: 'Liste deroulante', icon: 'V' },
  { type: 'RADIO', label: 'Choix unique', icon: 'O' },
  { type: 'CHECKBOX', label: 'Cases a cocher', icon: 'X' },
  { type: 'DATE', label: 'Date', icon: 'D' },
];

export const API_BASE_URL = '/api';

export const MAX_STEPS = 10;
export const MAX_FIELDS_PER_STEP = 20;
