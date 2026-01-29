import api from './api.js';
import type { Form, FormStep, FormField, FieldType } from '../types/form.types.js';
import type { ApiResponse, PaginationMeta } from '../types/api.types.js';

interface PaginatedForms {
  forms: Form[];
  meta: PaginationMeta;
}

export async function fetchForms(page = 1, limit = 20): Promise<PaginatedForms> {
  const { data } = await api.get<ApiResponse<Form[]>>('/forms', {
    params: { page, limit },
  });
  return { forms: data.data, meta: data.meta! };
}

export async function fetchFormById(id: string): Promise<Form> {
  const { data } = await api.get<ApiResponse<Form>>(`/forms/${id}`);
  return data.data;
}

export async function fetchFormSchema(id: string): Promise<Form> {
  const { data } = await api.get<ApiResponse<Form>>(`/forms/${id}/schema`);
  return data.data;
}

export async function createForm(input: {
  title: string;
  description?: string;
}): Promise<Form> {
  const { data } = await api.post<ApiResponse<Form>>('/forms', input);
  return data.data;
}

export async function updateForm(
  id: string,
  input: {
    title?: string;
    description?: string | null;
    settings?: Record<string, unknown>;
  },
): Promise<Form> {
  const { data } = await api.put<ApiResponse<Form>>(`/forms/${id}`, input);
  return data.data;
}

export async function deleteForm(id: string): Promise<void> {
  await api.delete(`/forms/${id}`);
}

export async function publishForm(id: string): Promise<Form> {
  const { data } = await api.patch<ApiResponse<Form>>(`/forms/${id}/publish`);
  return data.data;
}

export async function archiveForm(id: string): Promise<Form> {
  const { data } = await api.patch<ApiResponse<Form>>(`/forms/${id}/archive`);
  return data.data;
}

// Steps

export async function createStep(
  formId: string,
  input: { title: string; description?: string },
): Promise<FormStep> {
  const { data } = await api.post<ApiResponse<FormStep>>(
    `/forms/${formId}/steps`,
    input,
  );
  return data.data;
}

export async function updateStep(
  formId: string,
  stepId: string,
  input: { title?: string; description?: string | null },
): Promise<FormStep> {
  const { data } = await api.put<ApiResponse<FormStep>>(
    `/forms/${formId}/steps/${stepId}`,
    input,
  );
  return data.data;
}

export async function deleteStep(
  formId: string,
  stepId: string,
): Promise<void> {
  await api.delete(`/forms/${formId}/steps/${stepId}`);
}

export async function reorderSteps(
  formId: string,
  stepIds: string[],
): Promise<void> {
  await api.patch(`/forms/${formId}/steps/reorder`, { stepIds });
}

// Fields

export async function createField(
  formId: string,
  stepId: string,
  input: {
    type: FieldType;
    label: string;
    placeholder?: string;
    required?: boolean;
    options?: { label: string; value: string }[];
    validation?: Record<string, unknown>;
    config?: Record<string, unknown>;
  },
): Promise<FormField> {
  const { data } = await api.post<ApiResponse<FormField>>(
    `/forms/${formId}/steps/${stepId}/fields`,
    input,
  );
  return data.data;
}

export async function updateField(
  formId: string,
  stepId: string,
  fieldId: string,
  input: Partial<{
    type: FieldType;
    label: string;
    placeholder: string | null;
    required: boolean;
    options: { label: string; value: string }[] | null;
    validation: Record<string, unknown> | null;
    config: Record<string, unknown> | null;
  }>,
): Promise<FormField> {
  const { data } = await api.put<ApiResponse<FormField>>(
    `/forms/${formId}/steps/${stepId}/fields/${fieldId}`,
    input,
  );
  return data.data;
}

export async function deleteField(
  formId: string,
  stepId: string,
  fieldId: string,
): Promise<void> {
  await api.delete(`/forms/${formId}/steps/${stepId}/fields/${fieldId}`);
}

export async function reorderFields(
  formId: string,
  stepId: string,
  fieldIds: string[],
): Promise<void> {
  await api.patch(`/forms/${formId}/steps/${stepId}/fields/reorder`, {
    fieldIds,
  });
}
