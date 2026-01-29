import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.event.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.formField.deleteMany();
  await prisma.formStep.deleteMany();
  await prisma.form.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  // Create demo user
  const hashedPassword = await bcrypt.hash('Password1', 12);
  const user = await prisma.user.create({
    data: {
      email: 'demo@formbuilder.dev',
      password: hashedPassword,
      firstName: 'Demo',
      lastName: 'User',
      role: 'USER',
    },
  });
  console.log(`User created: ${user.email}`);

  // Create a published form with 3 steps
  const form = await prisma.form.create({
    data: {
      userId: user.id,
      title: 'Enquete de satisfaction client',
      description: 'Aidez-nous a ameliorer nos services en repondant a ce court questionnaire.',
      status: 'PUBLISHED',
      publishedAt: new Date(),
      settings: {
        successMessage: 'Merci pour votre retour ! Vos reponses nous aident a nous ameliorer.',
      },
    },
  });

  // Step 1: Informations personnelles
  const step1 = await prisma.formStep.create({
    data: {
      formId: form.id,
      title: 'Informations personnelles',
      description: 'Quelques informations pour mieux vous connaitre.',
      order: 0,
    },
  });

  const nameField = await prisma.formField.create({
    data: { stepId: step1.id, type: 'TEXT', label: 'Nom complet', placeholder: 'Jean Dupont', required: true, order: 0 },
  });
  const emailField = await prisma.formField.create({
    data: { stepId: step1.id, type: 'EMAIL', label: 'Adresse email', placeholder: 'jean@example.com', required: true, order: 1 },
  });
  const phoneField = await prisma.formField.create({
    data: { stepId: step1.id, type: 'PHONE', label: 'Telephone', placeholder: '+33 6 12 34 56 78', required: false, order: 2 },
  });

  // Step 2: Votre experience
  const step2 = await prisma.formStep.create({
    data: {
      formId: form.id,
      title: 'Votre experience',
      description: 'Dites-nous comment s\'est passee votre experience.',
      order: 1,
    },
  });

  const satisfactionField = await prisma.formField.create({
    data: {
      stepId: step2.id, type: 'RADIO', label: 'Niveau de satisfaction', required: true, order: 0,
      options: [
        { label: 'Tres satisfait', value: 'very_satisfied' },
        { label: 'Satisfait', value: 'satisfied' },
        { label: 'Neutre', value: 'neutral' },
        { label: 'Insatisfait', value: 'unsatisfied' },
      ],
    },
  });
  const serviceField = await prisma.formField.create({
    data: {
      stepId: step2.id, type: 'SELECT', label: 'Service utilise', placeholder: 'Choisissez un service', required: true, order: 1,
      options: [
        { label: 'Support technique', value: 'support' },
        { label: 'Vente', value: 'sales' },
        { label: 'Formation', value: 'training' },
        { label: 'Autre', value: 'other' },
      ],
    },
  });
  const featuresField = await prisma.formField.create({
    data: {
      stepId: step2.id, type: 'CHECKBOX', label: 'Ce que vous avez apprecie', required: false, order: 2,
      options: [
        { label: 'Rapidite', value: 'speed' },
        { label: 'Qualite', value: 'quality' },
        { label: 'Prix', value: 'price' },
        { label: 'Accompagnement', value: 'support' },
      ],
    },
  });

  // Step 3: Commentaires
  const step3 = await prisma.formStep.create({
    data: {
      formId: form.id,
      title: 'Commentaires',
      order: 2,
    },
  });

  const commentField = await prisma.formField.create({
    data: { stepId: step3.id, type: 'TEXTAREA', label: 'Vos commentaires', placeholder: 'Partagez vos impressions...', required: false, order: 0 },
  });
  const dateField = await prisma.formField.create({
    data: { stepId: step3.id, type: 'DATE', label: 'Date de votre derniere visite', required: false, order: 1 },
  });
  const scoreField = await prisma.formField.create({
    data: {
      stepId: step3.id, type: 'NUMBER', label: 'Note sur 10', placeholder: '8', required: true, order: 2,
      validation: { min: 0, max: 10 },
    },
  });

  console.log(`Form created: ${form.title} (${form.id})`);

  // Create sample submissions (10)
  const sampleNames = [
    'Marie Martin', 'Pierre Bernard', 'Sophie Petit', 'Lucas Dubois',
    'Emma Robert', 'Hugo Moreau', 'Lea Simon', 'Nathan Laurent',
    'Chloe Michel', 'Louis Lefevre',
  ];

  const satisfactionValues = ['very_satisfied', 'satisfied', 'neutral', 'unsatisfied'];
  const serviceValues = ['support', 'sales', 'training', 'other'];

  for (let i = 0; i < 10; i++) {
    const daysAgo = Math.floor(Math.random() * 28);
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - daysAgo);

    await prisma.submission.create({
      data: {
        formId: form.id,
        data: {
          [nameField.id]: sampleNames[i],
          [emailField.id]: `${sampleNames[i].toLowerCase().replace(' ', '.')}@example.com`,
          [phoneField.id]: i % 3 === 0 ? `+33 6 ${String(10 + i).padStart(2, '0')} 00 00 00` : null,
          [satisfactionField.id]: satisfactionValues[i % 4],
          [serviceField.id]: serviceValues[i % 4],
          [featuresField.id]: ['speed', 'quality'].slice(0, (i % 3) + 1),
          [commentField.id]: i % 2 === 0 ? 'Tres bonne experience, je recommande !' : null,
          [dateField.id]: i % 2 === 0 ? '2025-01-15' : null,
          [scoreField.id]: 6 + (i % 5),
        },
        metadata: { sessionId: `seed-session-${i}` },
        completedAt: createdAt,
        createdAt,
      },
    });
  }
  console.log('10 submissions created');

  // Create tracking events
  for (let i = 0; i < 50; i++) {
    const daysAgo = Math.floor(Math.random() * 28);
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - daysAgo);
    const sessionId = `seed-event-session-${i}`;

    // FORM_VIEW
    await prisma.event.create({
      data: { formId: form.id, type: 'FORM_VIEW', sessionId, createdAt },
    });

    // 70% start the form
    if (Math.random() < 0.7) {
      await prisma.event.create({
        data: { formId: form.id, type: 'FORM_START', sessionId, stepOrder: 0, createdAt },
      });

      // 80% of starters complete step 1
      if (Math.random() < 0.8) {
        await prisma.event.create({
          data: { formId: form.id, type: 'STEP_COMPLETE', sessionId, stepOrder: 0, createdAt },
        });

        // 75% of step1 completers complete step 2
        if (Math.random() < 0.75) {
          await prisma.event.create({
            data: { formId: form.id, type: 'STEP_COMPLETE', sessionId, stepOrder: 1, createdAt },
          });

          // 85% of step2 completers submit
          if (Math.random() < 0.85) {
            await prisma.event.create({
              data: { formId: form.id, type: 'STEP_COMPLETE', sessionId, stepOrder: 2, createdAt },
            });
            await prisma.event.create({
              data: { formId: form.id, type: 'FORM_SUBMIT', sessionId, createdAt },
            });
          }
        }
      }
    }
  }
  console.log('Tracking events created');

  // Create a draft form
  await prisma.form.create({
    data: {
      userId: user.id,
      title: 'Nouveau formulaire (brouillon)',
      status: 'DRAFT',
      steps: {
        create: {
          title: 'Etape 1',
          order: 0,
          fields: {
            create: [
              { type: 'TEXT', label: 'Nom', required: true, order: 0 },
              { type: 'EMAIL', label: 'Email', required: true, order: 1 },
            ],
          },
        },
      },
    },
  });
  console.log('Draft form created');

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
