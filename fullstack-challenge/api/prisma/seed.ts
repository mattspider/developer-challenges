import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const senhaHash = await bcrypt.hash('senha123', 10);
  await prisma.usuario.upsert({
    where: { email: 'admin@dynapredict.com' },
    update: {},
    create: {
      email: 'admin@dynapredict.com',
      senha: senhaHash,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
