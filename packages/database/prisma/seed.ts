import { PrismaClient, User, Post } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const sampleUsers = [
  {
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan.perez@email.com',
    username: 'juanp_dev',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    dateOfBirth: new Date('1990-05-15'),
  },
  {
    firstName: 'María',
    lastName: 'García',
    email: 'maria.garcia@email.com',
    username: 'maria_designer',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    dateOfBirth: new Date('1988-12-03'),
  },
  {
    firstName: 'Carlos',
    lastName: 'Rodriguez',
    email: 'carlos.rodriguez@email.com',
    username: 'carlos_tech',
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
    dateOfBirth: new Date('1992-08-22'),
  },
  {
    firstName: 'Ana',
    lastName: 'López',
    email: 'ana.lopez@email.com',
    username: 'ana_creative',
    avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
    dateOfBirth: new Date('1995-03-10'),
  },
  {
    firstName: 'Diego',
    lastName: 'Martínez',
    email: 'diego.martinez@email.com',
    username: 'diego_startup',
    avatar: 'https://randomuser.me/api/portraits/men/5.jpg',
    dateOfBirth: new Date('1987-11-28'),
  },
  {
    firstName: 'Sofía',
    lastName: 'Hernández',
    email: 'sofia.hernandez@email.com',
    username: 'sofia_data',
    avatar: 'https://randomuser.me/api/portraits/women/6.jpg',
    dateOfBirth: new Date('1993-07-14'),
  },
  {
    firstName: 'Luis',
    lastName: 'González',
    email: 'luis.gonzalez@email.com',
    username: 'luis_mobile',
    avatar: 'https://randomuser.me/api/portraits/men/7.jpg',
    dateOfBirth: new Date('1991-01-05'),
  },
  {
    firstName: 'Isabella',
    lastName: 'Torres',
    email: 'isabella.torres@email.com',
    username: 'isa_ux',
    avatar: 'https://randomuser.me/api/portraits/women/8.jpg',
    dateOfBirth: new Date('1989-09-18'),
  },
];

const twitterStylePosts = [
  "¡Acabó de deployar mi primer app con React Native! 🚀 #ReactNative #MobileDev",
  "Café ☕ + código = productividad máxima. ¿Cuál es su combo perfecto para programar?",
  "Tip del día: Siempre comenta tu código como si la persona que lo va a mantener fuera un psicópata violento que sabe dónde vives 😅",
  "¿Alguien más piensa que TypeScript es el mejor amigo que nunca supiste que necesitabas? 💙",
  "Debugging a las 2 AM hits different 🌙 #DevLife",
  "Recordatorio: No hay código perfecto, solo código que funciona... por ahora 🤞",
  "¿CSS Grid o Flexbox? Let the battle begin! 💥",
  "Ese momento cuando tu código funciona en la primera corrida y no sabes por qué 🤔",
  "Docker me ha cambiado la vida. Adiós 'pero en mi máquina funciona' 🐋",
  "Aprendiendo Next.js y mi mente está 🤯. Este framework es increíble!",
  "Senior devs: ¿Cuál fue su mayor error como junior? Pregunto para un amigo... 👀",
  "Git merge conflicts son el boss final de cualquier día de desarrollo 😤",
  "Cuando el cliente dice 'solo un pequeño cambio' pero afecta toda la arquitectura 💀",
  "¿Qué prefieren: tabs o espacios? (Y por favor no empiecen una guerra) 🕊️",
  "Acabé de leer Clean Code otra vez. Robert C. Martin es un genio 📚",
  "API REST vs GraphQL, fight! 🥊 ¿Cuál usan más en sus proyectos?",
  "Hoy aprendí que la documentación realmente existe para algo 📖 #LessonLearned",
  "¿Alguien más tiene pesadillas con legacy code? Pregunto por salud mental 🏥",
  "Microservicios: ¿solución mágica o dolor de cabeza distribuido? 🤷‍♂️",
  "Testing es como el ejercicio: sabes que deberías hacerlo más pero... 🏃‍♂️",
  "Vim vs VSCode: la eterna batalla de los editores ⚔️",
  "¿Cuándo fue la última vez que usaron jQuery? Me da nostalgia 💚",
  "Ese sentimiento cuando tu PR finalmente pasa todos los tests ✅",
  "¿Python o JavaScript para backend? Dejo la pregunta y me voy 🏃‍♂️",
  "Scrum Master: 'Solo sera una daily rápida' ⏰ Also daily: 45 minutos después...",
  "¿Alguien más programa mejor con música lo-fi de fondo? 🎵",
  "Refactoring code feels like renovating your house while living in it 🏠",
  "¿Cuál es su stack favorito y por qué es MERN? (es broma... o no) 😏",
  "Las 3 AM son las nuevas 3 PM para los developers 🦉 #NightOwl",
  "¿Code review o code roast? A veces no estoy seguro 🔥",
  "Cuando borras 100 líneas de código y tu app sigue funcionando igual 🎉",
  "¿Frontend, backend o fullstack? ¿En qué lado están? 🤝",
  "Machine Learning está cool pero ¿alguien más extraña cuando las apps eran simples? 🤖",
  "Deploy on Friday? I also like to live dangerously 😎",
  "¿Cuál fue su primer lenguaje de programación? El mío fue... HTML 😅",
  "Stack Overflow salvando vidas desde 2008 🙏 #ThankYouSO",
  "¿Alguien más lee tech blogs en el desayuno? Solo yo? Ok... 📱",
  "Clean architecture: más difícil de explicar que de implementar 🏗️",
  "¿Pair programming o solo programming? ¿Cuál prefieren? 👥",
  "Cuando el bug que buscabas por horas era un punto y coma 🤦‍♂️",
  "¿Web3 es el futuro o solo mucho hype? Opinions needed 🌐",
  "Remote work cambió mi vida, pero extraño la cafetera de la oficina ☕",
  "¿Cuántas tabs tienen abiertas en su browser ahora mismo? Yo: demasiadas 📱",
  "Error 500: Cuando tu servidor decide tomarse un break 💤",
  "¿Agile realmente es ágil o solo más meetings? 🤔",
  "Ese momento cuando entiendes una regex que escribiste hace 6 meses ✨",
  "¿Cuál es su herramienta de productividad favorita? Necesito recomendaciones 🛠️",
  "Open source is beautiful. Shoutout a todos los maintainers! 🌟",
  "¿DevOps es development + operations o development OF operations? 🤯",
  "Security first, features second. ¿Están de acuerdo? 🔒"
];

async function main() {
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('password123', 12);

  const createdUsers: User[] = [];
  for (const userData of sampleUsers) {
    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        verificationCode: Math.floor(100000 + Math.random() * 900000),
        isVerified: true,
      },
    });
    createdUsers.push(user);
  }

  const posts: Post[] = [];
  for (let i = 0; i < 50; i++) {
    const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
    const randomContent = twitterStylePosts[Math.floor(Math.random() * twitterStylePosts.length)];
    
    const randomDaysAgo = Math.floor(Math.random() * 30);
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - randomDaysAgo);
    createdAt.setHours(Math.floor(Math.random() * 24));
    createdAt.setMinutes(Math.floor(Math.random() * 60));

    const post = await prisma.post.create({
      data: {
        content: randomContent,
        authorId: randomUser.id,
        createdAt: createdAt,
      },
    });
    posts.push(post);
  }

  for (let i = 0; i < 30; i++) {
    const randomPost = posts[Math.floor(Math.random() * posts.length)];
    const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
    
    const comments = [
      "¡Totalmente de acuerdo! 👍",
      "Interesante punto de vista 🤔",
      "¿Podrías compartir más detalles?",
      "Esto me pasó la semana pasada 😅",
      "Great post! Thanks for sharing 🙏",
      "No estoy seguro de estar de acuerdo 🤷‍♂️",
      "¡Excelente tip! Lo voy a probar",
      "This is the way 🚀",
      "Same here! 💯",
      "¿Tienes algún tutorial recomendado?"
    ];

    await prisma.comment.create({
      data: {
        content: comments[Math.floor(Math.random() * comments.length)],
        authorId: randomUser.id,
        postId: randomPost.id,
      },
    });
  }

  for (let i = 0; i < 100; i++) {
    const randomPost = posts[Math.floor(Math.random() * posts.length)];
    const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];

    try {
      await prisma.like.create({
        data: {
          authorId: randomUser.id,
          postId: randomPost.id,
        },
      });
    } catch (error) {
      continue;
    }
  }

}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });