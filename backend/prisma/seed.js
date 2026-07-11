// Seed de usuarios internos para entorno de desarrollo del piloto.
// No hay registro público: el personal se crea únicamente por este medio
// (o, en producción, por un endpoint administrativo protegido en un paso posterior).

const { PrismaClient, Rol } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const SALT_ROUNDS = 12;

const USUARIOS_SEED = [
  {
    email: 'recepcion@clinica-piloto.test',
    passwordPlano: 'Recepcion#2026',
    nombres: 'Personal de Recepción',
    rol: Rol.RECEPCION,
  },
  {
    email: 'medico@clinica-piloto.test',
    passwordPlano: 'Medico#2026',
    nombres: 'Personal Médico',
    rol: Rol.MEDICO,
  },
  {
    email: 'administracion@clinica-piloto.test',
    passwordPlano: 'Administracion#2026',
    nombres: 'Personal de Administración',
    rol: Rol.ADMINISTRACION,
  },
];

async function main() {
  for (const usuario of USUARIOS_SEED) {
    const passwordHash = await bcrypt.hash(usuario.passwordPlano, SALT_ROUNDS);

    await prisma.usuario.upsert({
      where: { email: usuario.email },
      update: {
        passwordHash,
        nombres: usuario.nombres,
        rol: usuario.rol,
      },
      create: {
        email: usuario.email,
        passwordHash,
        nombres: usuario.nombres,
        rol: usuario.rol,
      },
    });

    console.log(`Usuario sembrado: ${usuario.email} (${usuario.rol})`);
  }
}

main()
  .catch((error) => {
    console.error('Error al sembrar usuarios:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
