import * as path from 'node:path';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { Categoria, EstadoPedido, Rol } from '../src/generated/prisma/enums.js';

// Carga variables de entorno tanto si se ejecuta desde `backend/` como desde la raíz del repositorio
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '..', '.env') });

const connectionString = process.env['DATABASE_URL'];

if (!connectionString) {
  throw new Error(
    'DATABASE_URL no está definida en el archivo .env para ejecutar el seed.',
  );
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const DEFAULT_PASSWORD = 'PinkPepper!2026';
const SALT_ROUNDS = 10;

interface SeedUserInput {
  primer_nombre: string;
  segundo_nombre: string;
  primer_apellido: string;
  segundo_apellido: string;
  correo: string;
  telefono: string;
  rol: Rol;
}

interface SeedProductInput {
  nombre: string;
  descripcion: string;
  imagen_url: string;
  precio: number;
  categoria: Categoria;
}

async function ensureRole(nombreRol: Rol): Promise<number> {
  const existing = await prisma.rol_.findFirst({
    where: { nombre_rol: nombreRol },
  });

  if (existing) {
    return existing.id_rol;
  }

  const created = await prisma.rol_.create({
    data: { nombre_rol: nombreRol },
  });

  return created.id_rol;
}

async function ensureCategory(nombreCategoria: Categoria): Promise<number> {
  const existing = await prisma.categoria.findFirst({
    where: { nombre_categoria: nombreCategoria },
  });

  if (existing) {
    return existing.id_categoria;
  }

  const created = await prisma.categoria.create({
    data: { nombre_categoria: nombreCategoria },
  });

  return created.id_categoria;
}

async function ensureUser(
  input: SeedUserInput,
  roleMap: Map<Rol, number>,
  hashedPassword: string,
) {
  const existing = await prisma.usuario.findFirst({
    where: {
      correo: {
        equals: input.correo,
        mode: 'insensitive',
      },
    },
  });

  if (existing) {
    return existing;
  }

  return prisma.usuario.create({
    data: {
      id_rol: roleMap.get(input.rol)!,
      primer_nombre: input.primer_nombre,
      segundo_nombre: input.segundo_nombre,
      primer_apellido: input.primer_apellido,
      segundo_apellido: input.segundo_apellido,
      correo: input.correo,
      password: hashedPassword,
      telefono: input.telefono,
      estado: true,
      fecha_registro: new Date(),
    },
  });
}

async function ensureProduct(
  input: SeedProductInput,
  categoryMap: Map<Categoria, number>,
) {
  const existing = await prisma.producto.findFirst({
    where: {
      nombre: {
        equals: input.nombre,
        mode: 'insensitive',
      },
    },
  });

  if (existing) {
    return existing;
  }

  return prisma.producto.create({
    data: {
      id_categoria: categoryMap.get(input.categoria)!,
      nombre: input.nombre,
      descripcion: input.descripcion,
      imagen_url: input.imagen_url,
      precio: input.precio,
      estado: true,
      fecha_registro: new Date(),
    },
  });
}

async function main(): Promise<void> {
  console.log('Iniciando seed de base de datos Pink Pepper...');

  // 1. Roles
  const roleMap = new Map<Rol, number>();
  for (const rol of [
    Rol.ADMIN,
    Rol.GERENTE,
    Rol.REPARTIDOR,
    Rol.COCINA,
    Rol.CLIENTE,
  ]) {
    const idRol = await ensureRole(rol);
    roleMap.set(rol, idRol);
  }

  // 2. Categorías
  const categoryMap = new Map<Categoria, number>();
  for (const cat of [
    Categoria.HAMBURGUESAS,
    Categoria.POLLO,
    Categoria.BEBIDAS,
  ]) {
    const idCat = await ensureCategory(cat);
    categoryMap.set(cat, idCat);
  }

  // 3. Productos del menú (descripciones <= 50 caracteres según VarChar(50))
  const seedProducts: SeedProductInput[] = [
    {
      nombre: 'Hamburguesa clásica',
      descripcion: 'Carne de res, queso cheddar y vegetales',
      imagen_url: '/images/Clasica.jpg',
      precio: 270,
      categoria: Categoria.HAMBURGUESAS,
    },
    {
      nombre: 'Groovie Burger',
      descripcion: 'Doble carne, tocino y salsa especial',
      imagen_url: '/images/Groovie.jpg',
      precio: 360,
      categoria: Categoria.HAMBURGUESAS,
    },
    {
      nombre: 'Chicken fingers',
      descripcion: 'Tiras de pollo crujientes con salsa',
      imagen_url: '/images/chicken.jpg',
      precio: 220,
      categoria: Categoria.POLLO,
    },
    {
      nombre: 'Alitas BBQ',
      descripcion: 'Alitas bañadas en salsa barbacoa',
      imagen_url: '/images/chicken.jpg',
      precio: 250,
      categoria: Categoria.POLLO,
    },
    {
      nombre: 'Limonada de fresa',
      descripcion: 'Limonada natural con fresas frescas',
      imagen_url: '/images/Bebidas_Categoria.jpg',
      precio: 75,
      categoria: Categoria.BEBIDAS,
    },
    {
      nombre: 'Malteada de chocolate',
      descripcion: 'Malteada cremosa de chocolate artesanal',
      imagen_url: '/images/Bebidas_Categoria.jpg',
      precio: 130,
      categoria: Categoria.BEBIDAS,
    },
  ];

  const createdProducts: Awaited<ReturnType<typeof ensureProduct>>[] = [];
  for (const prod of seedProducts) {
    createdProducts.push(await ensureProduct(prod, categoryMap));
  }

  // 4. Usuarios: 1 Admin, 1 Gerente, 3 Repartidores, 3 Cocineros y 2 Clientes
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);

  const seedUsers: SeedUserInput[] = [
    // 1 Admin
    {
      primer_nombre: 'Admin',
      segundo_nombre: 'Principal',
      primer_apellido: 'Pink',
      segundo_apellido: 'Pepper',
      correo: 'admin@pinkpepper.com',
      telefono: '8888-0001',
      rol: Rol.ADMIN,
    },
    // 1 Gerente
    {
      primer_nombre: 'Laura',
      segundo_nombre: 'Sofía',
      primer_apellido: 'Martínez',
      segundo_apellido: 'Rivas',
      correo: 'gerente@pinkpepper.com',
      telefono: '8888-0002',
      rol: Rol.GERENTE,
    },
    // 3 Repartidores
    {
      primer_nombre: 'Roberto',
      segundo_nombre: 'José',
      primer_apellido: 'Salgado',
      segundo_apellido: 'Mora',
      correo: 'repartidor1@pinkpepper.com',
      telefono: '8888-1001',
      rol: Rol.REPARTIDOR,
    },
    {
      primer_nombre: 'Daniela',
      segundo_nombre: 'Lucía',
      primer_apellido: 'Pérez',
      segundo_apellido: 'Solís',
      correo: 'repartidor2@pinkpepper.com',
      telefono: '8888-1002',
      rol: Rol.REPARTIDOR,
    },
    {
      primer_nombre: 'Javier',
      segundo_nombre: 'Antonio',
      primer_apellido: 'Obando',
      segundo_apellido: 'Cruz',
      correo: 'repartidor3@pinkpepper.com',
      telefono: '8888-1003',
      rol: Rol.REPARTIDOR,
    },
    // 3 Cocineros
    {
      primer_nombre: 'Carlos',
      segundo_nombre: 'Eduardo',
      primer_apellido: 'Morales',
      segundo_apellido: 'Vega',
      correo: 'cocina1@pinkpepper.com',
      telefono: '8888-2001',
      rol: Rol.COCINA,
    },
    {
      primer_nombre: 'Elena',
      segundo_nombre: 'Patricia',
      primer_apellido: 'Rivas',
      segundo_apellido: 'Cano',
      correo: 'cocina2@pinkpepper.com',
      telefono: '8888-2002',
      rol: Rol.COCINA,
    },
    {
      primer_nombre: 'Mario',
      segundo_nombre: 'Alberto',
      primer_apellido: 'Zelaya',
      segundo_apellido: 'Lara',
      correo: 'cocina3@pinkpepper.com',
      telefono: '8888-2003',
      rol: Rol.COCINA,
    },
    // 2 Clientes
    {
      primer_nombre: 'María',
      segundo_nombre: 'Fernanda',
      primer_apellido: 'López',
      segundo_apellido: 'Díaz',
      correo: 'cliente1@pinkpepper.com',
      telefono: '8845-2210',
      rol: Rol.CLIENTE,
    },
    {
      primer_nombre: 'Andrés',
      segundo_nombre: 'Felipe',
      primer_apellido: 'Castillo',
      segundo_apellido: 'Ruiz',
      correo: 'cliente2@pinkpepper.com',
      telefono: '8712-5634',
      rol: Rol.CLIENTE,
    },
  ];

  const usersByEmail = new Map<
    string,
    Awaited<ReturnType<typeof ensureUser>>
  >();
  for (const u of seedUsers) {
    const record = await ensureUser(u, roleMap, hashedPassword);
    usersByEmail.set(u.correo, record);
  }

  // 5. Pedido inicial (si aún no existen pedidos en la BD)
  const existingOrdersCount = await prisma.pedido.count();

  if (existingOrdersCount === 0) {
    const cliente1 = usersByEmail.get('cliente1@pinkpepper.com')!;
    const repartidor1 = usersByEmail.get('repartidor1@pinkpepper.com')!;
    const hamburguesa = createdProducts[0]; // 270
    const limonada = createdProducts[4]; // 75

    const subtotal1 = 270 * 2; // 540
    const subtotal2 = 75 * 2; // 150
    const costoEnvio = 50;
    const total = subtotal1 + subtotal2 + costoEnvio; // 740

    const now = new Date();

    await prisma.pedido.create({
      data: {
        id_cliente: cliente1.id_usuario,
        id_repartidor: repartidor1.id_usuario,
        fecha_creacion: now,
        fecha_entrega: now,
        direccion:
          'Residencial Altamira, del Hotel Crowne Plaza 2 c. al sur, casa #14',
        referencia: 'Casa azul con portón negro',
        notas_cliente: 'Tocar el timbre al llegar',
        metodo_pago: 'EFECTIVO',
        comprobante: '',
        costo_envio: costoEnvio,
        total,
        estado_pedido: EstadoPedido.RECIBIDO,
        motivo_cancelacion: '',
        detalle_pedido: {
          create: [
            {
              id_producto: hamburguesa.id_producto,
              cantidad: 2,
              precio_unitario: 270,
              subtotal: subtotal1,
            },
            {
              id_producto: limonada.id_producto,
              cantidad: 2,
              precio_unitario: 75,
              subtotal: subtotal2,
            },
          ],
        },
      },
    });
  }

  console.log('Seed completado exitosamente.');
  console.log(`Contraseña por defecto de prueba: ${DEFAULT_PASSWORD}`);
}

main()
  .catch((error: unknown) => {
    console.error('Error ejecutando el seed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
