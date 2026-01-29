import { Router } from 'express';
import * as formsController from '../controllers/forms.controller.js';
import * as submissionsController from '../controllers/submissions.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  createFormSchema,
  updateFormSchema,
  formIdParamSchema,
  paginationQuerySchema,
  createStepSchema,
  updateStepSchema,
  reorderStepsSchema,
  stepParamsSchema,
  createFieldSchema,
  updateFieldSchema,
  reorderFieldsSchema,
  fieldParamsSchema,
} from '../schemas/forms.schema.js';
import {
  createSubmissionSchema,
  createEventSchema,
} from '../schemas/submissions.schema.js';

const router = Router();

// ===========================
// FORMS
// ===========================

router.get(
  '/',
  authenticate,
  validate({ query: paginationQuerySchema }),
  formsController.listForms,
);

router.post(
  '/',
  authenticate,
  validate({ body: createFormSchema }),
  formsController.createForm,
);

router.get(
  '/:id',
  authenticate,
  validate({ params: formIdParamSchema }),
  formsController.getFormById,
);

router.put(
  '/:id',
  authenticate,
  validate({ params: formIdParamSchema, body: updateFormSchema }),
  formsController.updateForm,
);

router.delete(
  '/:id',
  authenticate,
  validate({ params: formIdParamSchema }),
  formsController.deleteForm,
);

router.patch(
  '/:id/publish',
  authenticate,
  validate({ params: formIdParamSchema }),
  formsController.publishForm,
);

router.patch(
  '/:id/archive',
  authenticate,
  validate({ params: formIdParamSchema }),
  formsController.archiveForm,
);

// Public endpoint - pas d'authentification requise
router.get(
  '/:id/schema',
  validate({ params: formIdParamSchema }),
  formsController.getFormSchema,
);

// ===========================
// STEPS
// ===========================

router.post(
  '/:id/steps',
  authenticate,
  validate({ params: formIdParamSchema, body: createStepSchema }),
  formsController.createStep,
);

router.put(
  '/:id/steps/:stepId',
  authenticate,
  validate({ params: stepParamsSchema, body: updateStepSchema }),
  formsController.updateStep,
);

router.delete(
  '/:id/steps/:stepId',
  authenticate,
  validate({ params: stepParamsSchema }),
  formsController.deleteStep,
);

router.patch(
  '/:id/steps/reorder',
  authenticate,
  validate({ params: formIdParamSchema, body: reorderStepsSchema }),
  formsController.reorderSteps,
);

// ===========================
// FIELDS
// ===========================

router.post(
  '/:id/steps/:stepId/fields',
  authenticate,
  validate({ params: stepParamsSchema, body: createFieldSchema }),
  formsController.createField,
);

router.put(
  '/:id/steps/:stepId/fields/:fieldId',
  authenticate,
  validate({ params: fieldParamsSchema, body: updateFieldSchema }),
  formsController.updateField,
);

router.delete(
  '/:id/steps/:stepId/fields/:fieldId',
  authenticate,
  validate({ params: fieldParamsSchema }),
  formsController.deleteField,
);

router.patch(
  '/:id/steps/:stepId/fields/reorder',
  authenticate,
  validate({ params: stepParamsSchema, body: reorderFieldsSchema }),
  formsController.reorderFields,
);

// ===========================
// SUBMISSIONS (public + auth)
// ===========================

// Public - soumission de formulaire (pas d'auth)
router.post(
  '/:id/submissions',
  validate({ params: formIdParamSchema, body: createSubmissionSchema }),
  submissionsController.createSubmission,
);

// Auth - liste des soumissions (owner)
router.get(
  '/:id/submissions',
  authenticate,
  validate({ params: formIdParamSchema, query: paginationQuerySchema }),
  submissionsController.listSubmissions,
);

// ===========================
// EVENTS (public)
// ===========================

// Public - tracking d'evenement (pas d'auth)
router.post(
  '/:id/events',
  validate({ params: formIdParamSchema, body: createEventSchema }),
  submissionsController.createEvent,
);

export default router;
