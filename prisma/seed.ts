import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import { prisma } from '../lib/prisma';

async function main() {
  console.log('🌱 Seeding database toil_db (utilisateurs)...');

  await prisma.utilisateur.upsert({
    where: { email: 'lino@gmail.com' },
    update: {
      nom: 'Lino Lino',
      role: 'ADMIN',
      emailManager: '',
      estRH: true,
    },
    create: {
      nom: 'Lino Lino',
      email: 'lino@gmail.com',
      role: 'ADMIN',
      emailManager: '',
      estRH: true,
    },
  });

  await prisma.utilisateur.upsert({
    where: { email: 'it_helpdesk@compel-toil.com' },
    update: {
      nom: 'IT Helpdesk',
      role: 'MANAGER',
      emailManager: 'lino@gmail.com',
      estRH: false,
    },
    create: {
      nom: 'IT Helpdesk',
      email: 'it_helpdesk@compel-toil.com',
      role: 'MANAGER',
      emailManager: 'lino@gmail.com',
      estRH: false,
    },
  });

  await prisma.utilisateur.upsert({
    where: { email: 'rh@compel-toil.com' },
    update: {
      nom: 'Responsable RH',
      role: 'RH',
      emailManager: 'lino@gmail.com',
      estRH: true,
    },
    create: {
      nom: 'Responsable RH',
      email: 'rh@compel-toil.com',
      role: 'RH',
      emailManager: 'lino@gmail.com',
      estRH: true,
    },
  });

  await prisma.utilisateur.upsert({
    where: { email: 'portail_test@compel-toil.com' },
    update: {
      nom: 'Portail Test',
      role: 'EMPLOYE',
      emailManager: 'it_helpdesk@compel-toil.com',
      estRH: false,
    },
    create: {
      nom: 'Portail Test',
      email: 'portail_test@compel-toil.com',
      role: 'EMPLOYE',
      emailManager: 'it_helpdesk@compel-toil.com',
      estRH: false,
    },
  });

  console.log('✅ Seed utilisateurs terminé avec succès!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
