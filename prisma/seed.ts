import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@skillpro.com" },
    update: {},
    create: {
      email: "admin@skillpro.com",
      password: adminPassword,
      name: "Admin User",
      role: "ADMIN",
    },
  });

  console.log("Created admin:", admin.email);

  // Create student user
  const studentPassword = await bcrypt.hash("student123", 10);
  const student = await prisma.user.upsert({
    where: { email: "student@skillpro.com" },
    update: {},
    create: {
      email: "student@skillpro.com",
      password: studentPassword,
      name: "Student User",
      role: "STUDENT",
    },
  });

  console.log("Created student:", student.email);

  // Create demo course
  const course = await prisma.course.create({
    data: {
      title: "Introdução ao Desenvolvimento Web",
      description: "Aprenda os fundamentos do desenvolvimento web com HTML, CSS e JavaScript.",
      level: "Iniciante",
      duration: "40 horas",
      price: 199.90,
      targetAudience: "Iniciantes em programação que desejam aprender desenvolvimento web",
      passingScore: 70,
      isPublished: true,
      createdById: admin.id,
      modules: {
        create: [
          {
            title: "Módulo 1 - Fundamentos Web",
            description: "Aprenda HTML, CSS e JavaScript do zero",
            order: 1,
            lessons: {
              create: [
                {
                  title: "Introdução ao HTML",
                  description: "Aprenda os conceitos básicos de HTML",
                  content: "HTML é a linguagem de marcação padrão para criar páginas web...",
                  order: 1,
                  quizzes: {
                    create: {
                      title: "Quiz: HTML Básico",
                      description: "Teste seus conhecimentos em HTML",
                      passingScore: 70,
                      questions: {
                        create: [
                          {
                            question: "O que significa HTML?",
                            order: 1,
                            answers: {
                              create: [
                                { answer: "HyperText Markup Language", isCorrect: true },
                                { answer: "High Tech Modern Language", isCorrect: false },
                                { answer: "Home Tool Markup Language", isCorrect: false },
                                { answer: "Hyperlinks and Text Markup Language", isCorrect: false },
                              ],
                            },
                          },
                        ],
                      },
                    },
                  },
                },
                {
                  title: "Introdução ao CSS",
                  description: "Aprenda a estilizar suas páginas web",
                  content: "CSS é usado para estilizar e dar layout às páginas web...",
                  order: 2,
                },
                {
                  title: "Introdução ao JavaScript",
                  description: "Adicione interatividade às suas páginas",
                  content: "JavaScript é a linguagem de programação da web...",
                  order: 3,
                },
              ],
            },
          },
        ],
      },
      finalExam: {
        create: {
          title: "Prova Final - Desenvolvimento Web",
          description: "Avaliação final do curso",
          passingScore: 70,
          questions: {
            create: [
              {
                question: "Qual é a função principal do HTML em uma página web?",
                order: 1,
                answers: {
                  create: [
                    { answer: "Estruturar o conteúdo", isCorrect: true },
                    { answer: "Estilizar a página", isCorrect: false },
                    { answer: "Adicionar interatividade", isCorrect: false },
                    { answer: "Conectar ao banco de dados", isCorrect: false },
                  ],
                },
              },
            ],
          },
        },
      },
    },
  });

  console.log("Created demo course:", course.title);

  // Create another course for testing
  const course2 = await prisma.course.create({
    data: {
      title: "Python para Iniciantes",
      description: "Aprenda programação Python do zero ao avançado.",
      level: "Iniciante",
      duration: "30 horas",
      price: 149.90,
      targetAudience: "Pessoas que querem aprender programação com Python",
      passingScore: 70,
      isPublished: true,
      createdById: admin.id,
      modules: {
        create: [
          {
            title: "Módulo 1 - Fundamentos Python",
            description: "Aprenda os conceitos básicos de Python",
            order: 1,
            lessons: {
              create: [
                {
                  title: "Variáveis e Tipos de Dados",
                  description: "Aprenda sobre variáveis em Python",
                  content: "Python é uma linguagem dinâmica e tipada...",
                  order: 1,
                },
                {
                  title: "Estruturas de Controle",
                  description: "If, else, loops e mais",
                  content: "Estruturas de controle permitem executar código condicionalmente...",
                  order: 2,
                },
              ],
            },
          },
          {
            title: "Módulo 2 - Python Avançado",
            description: "Conceitos avançados de Python",
            order: 2,
            lessons: {
              create: [
                {
                  title: "Funções e Decoradores",
                  description: "Aprenda sobre funções em Python",
                  content: "Funções são blocos de código reutilizáveis...",
                  order: 1,
                },
              ],
            },
          },
        ],
      },
      finalExam: {
        create: {
          title: "Prova Final - Python",
          description: "Avaliação final do curso de Python",
          passingScore: 70,
          questions: {
            create: [
              {
                question: "Qual é o tipo de dado correto para armazenar texto em Python?",
                order: 1,
                answers: {
                  create: [
                    { answer: "str", isCorrect: true },
                    { answer: "text", isCorrect: false },
                    { answer: "string", isCorrect: false },
                    { answer: "char", isCorrect: false },
                  ],
                },
              },
            ],
          },
        },
      },
    },
  });

  console.log("Created second demo course:", course2.title);

  // Create a complete course with videos
  const course3 = await prisma.course.create({
    data: {
      title: "JavaScript Moderno - Do Básico ao Avançado",
      description: "Domine JavaScript moderno com este curso completo incluindo ES6+, async/await, promises e muito mais.",
      level: "Intermediário",
      duration: "50 horas",
      price: 249.90,
      targetAudience: "Desenvolvedores que querem dominar JavaScript moderno",
      passingScore: 70,
      isPublished: true,
      createdById: admin.id,
      modules: {
        create: [
          {
            title: "Módulo 1 - Fundamentos do JavaScript",
            description: "Aprenda os conceitos fundamentais do JavaScript",
            order: 1,
            lessons: {
              create: [
                {
                  title: "Introdução ao JavaScript",
                  description: "O que é JavaScript e por que aprender",
                  content: `JavaScript é uma linguagem de programação de alto nível, interpretada e multiparadigma.

É uma das três tecnologias principais da World Wide Web, juntamente com HTML e CSS. JavaScript permite que você crie conteúdo dinâmico e interativo em sites.

Principais características:
- Linguagem interpretada (não precisa ser compilada)
- Tipagem dinâmica
- Orientada a objetos baseada em protótipos
- Suporta programação funcional
- Executa tanto no cliente (navegador) quanto no servidor (Node.js)

Nesta aula, você aprenderá os conceitos básicos que formam a base da linguagem JavaScript.`,
                  videoUrl: "https://www.youtube.com/embed/Ptbk2af68e8",
                  order: 1,
                },
                {
                  title: "Variáveis e Tipos de Dados",
                  description: "Entenda let, const, var e os tipos de dados em JS",
                  content: `Em JavaScript, temos três formas de declarar variáveis:

1. var (forma antiga, evite usar)
2. let (para variáveis que podem mudar)
3. const (para constantes)

Tipos de dados primitivos:
- String: texto
- Number: números
- Boolean: true/false
- Undefined: valor não definido
- Null: ausência intencional de valor
- Symbol: identificadores únicos
- BigInt: números inteiros grandes

Exemplo:
let nome = "João"; // String
const idade = 25; // Number
let ativo = true; // Boolean

JavaScript é dinamicamente tipado, ou seja, não precisa declarar o tipo da variável.`,
                  videoUrl: "https://www.youtube.com/embed/pL02AeZHd08",
                  order: 2,
                  quizzes: {
                    create: {
                      title: "Quiz: Variáveis e Tipos",
                      description: "Teste seus conhecimentos sobre variáveis",
                      passingScore: 70,
                      questions: {
                        create: [
                          {
                            question: "Qual palavra-chave deve ser usada para declarar uma constante?",
                            order: 1,
                            answers: {
                              create: [
                                { answer: "const", isCorrect: true },
                                { answer: "let", isCorrect: false },
                                { answer: "var", isCorrect: false },
                                { answer: "constant", isCorrect: false },
                              ],
                            },
                          },
                          {
                            question: "Qual NÃO é um tipo primitivo em JavaScript?",
                            order: 2,
                            answers: {
                              create: [
                                { answer: "Array", isCorrect: true },
                                { answer: "String", isCorrect: false },
                                { answer: "Number", isCorrect: false },
                                { answer: "Boolean", isCorrect: false },
                              ],
                            },
                          },
                        ],
                      },
                    },
                  },
                },
                {
                  title: "Operadores e Expressões",
                  description: "Aprenda sobre operadores aritméticos, lógicos e de comparação",
                  content: `Operadores são símbolos que realizam operações em valores e variáveis.

Operadores Aritméticos:
+ (adição)
- (subtração)
* (multiplicação)
/ (divisão)
% (módulo/resto)
** (exponenciação)

Operadores de Comparação:
== (igualdade)
=== (igualdade estrita)
!= (diferente)
!== (diferente estrito)
> (maior que)
< (menor que)
>= (maior ou igual)
<= (menor ou igual)

Operadores Lógicos:
&& (E/AND)
|| (OU/OR)
! (NÃO/NOT)

Dica: Sempre use === ao invés de == para evitar coerção de tipos inesperada!`,
                  videoUrl: "https://www.youtube.com/embed/EC8yc1BZro0",
                  order: 3,
                },
              ],
            },
          },
          {
            title: "Módulo 2 - Estruturas de Controle",
            description: "Domine condicionais e loops",
            order: 2,
            lessons: {
              create: [
                {
                  title: "Condicionais: if, else, switch",
                  description: "Aprenda a tomar decisões no código",
                  content: `Estruturas condicionais permitem que seu código tome decisões.

IF/ELSE:
if (condicao) {
  // código se verdadeiro
} else if (outraCondicao) {
  // código se outra condição for verdadeira
} else {
  // código se todas forem falsas
}

SWITCH:
switch (valor) {
  case 1:
    // código
    break;
  case 2:
    // código
    break;
  default:
    // código padrão
}

Operador Ternário (forma curta):
const resultado = condicao ? valorSeVerdadeiro : valorSeFalso;

Use if/else para condições complexas e switch quando tiver múltiplos valores para comparar.`,
                  videoUrl: "https://www.youtube.com/embed/IsG4Xd6LlsM",
                  order: 1,
                },
                {
                  title: "Loops: for, while, do-while",
                  description: "Repita código de forma eficiente",
                  content: `Loops permitem executar código repetidamente.

FOR:
for (let i = 0; i < 10; i++) {
  console.log(i);
}

WHILE:
while (condicao) {
  // código
}

DO-WHILE:
do {
  // código
} while (condicao);

FOR...OF (para arrays):
for (const item of array) {
  console.log(item);
}

FOR...IN (para objetos):
for (const chave in objeto) {
  console.log(chave, objeto[chave]);
}

Comandos especiais:
- break: sai do loop
- continue: pula para a próxima iteração`,
                  videoUrl: "https://www.youtube.com/embed/s9wW2PpJsmQ",
                  order: 2,
                  quizzes: {
                    create: {
                      title: "Quiz: Estruturas de Controle",
                      description: "Teste seus conhecimentos sobre loops e condicionais",
                      passingScore: 70,
                      questions: {
                        create: [
                          {
                            question: "Qual loop executa o código pelo menos uma vez?",
                            order: 1,
                            answers: {
                              create: [
                                { answer: "do-while", isCorrect: true },
                                { answer: "while", isCorrect: false },
                                { answer: "for", isCorrect: false },
                                { answer: "for...of", isCorrect: false },
                              ],
                            },
                          },
                        ],
                      },
                    },
                  },
                },
              ],
            },
          },
          {
            title: "Módulo 3 - Funções",
            description: "Aprenda a criar e usar funções",
            order: 3,
            lessons: {
              create: [
                {
                  title: "Declaração de Funções",
                  description: "Diferentes formas de criar funções",
                  content: `Funções são blocos de código reutilizáveis.

DECLARAÇÃO DE FUNÇÃO:
function somar(a, b) {
  return a + b;
}

EXPRESSÃO DE FUNÇÃO:
const somar = function(a, b) {
  return a + b;
};

ARROW FUNCTION (ES6+):
const somar = (a, b) => a + b;

// Com múltiplas linhas
const somar = (a, b) => {
  const resultado = a + b;
  return resultado;
};

PARÂMETROS PADRÃO:
function cumprimentar(nome = "visitante") {
  return \`Olá, \${nome}!\`;
}

REST PARAMETERS:
function somar(...numeros) {
  return numeros.reduce((acc, num) => acc + num, 0);
}

As arrow functions são mais concisas e não têm seu próprio "this".`,
                  videoUrl: "https://www.youtube.com/embed/N8ap4k_1QEQ",
                  order: 1,
                },
              ],
            },
          },
        ],
      },
      finalExam: {
        create: {
          title: "Prova Final - JavaScript Moderno",
          description: "Avaliação final do curso de JavaScript",
          passingScore: 70,
          questions: {
            create: [
              {
                question: "Qual é a diferença entre let e const?",
                order: 1,
                answers: {
                  create: [
                    { answer: "const não pode ser reatribuída, let pode", isCorrect: true },
                    { answer: "let é mais rápido que const", isCorrect: false },
                    { answer: "const só funciona com números", isCorrect: false },
                    { answer: "Não há diferença", isCorrect: false },
                  ],
                },
              },
              {
                question: "O que arrow functions NÃO fazem?",
                order: 2,
                answers: {
                  create: [
                    { answer: "Criar seu próprio contexto 'this'", isCorrect: true },
                    { answer: "Retornar valores", isCorrect: false },
                    { answer: "Aceitar parâmetros", isCorrect: false },
                    { answer: "Ser usadas como callbacks", isCorrect: false },
                  ],
                },
              },
            ],
          },
        },
      },
    },
  });

  console.log("Created complete demo course:", course3.title);

  // Create enrollments for the student
  const enrollment1 = await prisma.enrollment.create({
    data: {
      studentId: student.id,
      courseId: course.id,
      status: "APPROVED",
    },
  });

  const enrollment2 = await prisma.enrollment.create({
    data: {
      studentId: student.id,
      courseId: course2.id,
      status: "APPROVED",
    },
  });

  const enrollment3 = await prisma.enrollment.create({
    data: {
      studentId: student.id,
      courseId: course3.id,
      status: "APPROVED",
    },
  });

  console.log("Created enrollments for student:", student.email);

  // Create testimonials
  const testimonials = await Promise.all([
    prisma.testimonial.create({
      data: {
        studentId: student.id,
        courseId: course.id,
        rating: 5,
        comment: "Excelente curso! Consegui aprender desenvolvimento web de forma clara e objetiva. Os exemplos práticos ajudaram muito no entendimento.",
        isApproved: true,
      },
    }),
    prisma.testimonial.create({
      data: {
        studentId: student.id,
        courseId: course2.id,
        rating: 5,
        comment: "Python ficou muito mais fácil de entender com este curso. O professor explica de forma simples e os exercícios são muito práticos.",
        isApproved: true,
      },
    }),
    prisma.testimonial.create({
      data: {
        studentId: student.id,
        courseId: course3.id,
        rating: 4,
        comment: "Ótimo conteúdo sobre JavaScript moderno. Aprendi muito sobre ES6+ e agora me sinto mais confiante para desenvolver aplicações.",
        isApproved: true,
      },
    }),
    prisma.testimonial.create({
      data: {
        studentId: student.id,
        courseId: null, // Depoimento geral da plataforma
        rating: 5,
        comment: "A plataforma SkillPro mudou minha vida profissional. Consegui fazer a transição de carreira graças aos cursos de qualidade oferecidos aqui!",
        isApproved: true,
      },
    }),
    prisma.testimonial.create({
      data: {
        studentId: student.id,
        courseId: null,
        rating: 5,
        comment: "Melhor investimento que fiz na minha carreira. Os certificados são reconhecidos e o conteúdo é atualizado. Recomendo muito!",
        isApproved: true,
      },
    }),
    prisma.testimonial.create({
      data: {
        studentId: student.id,
        courseId: null,
        rating: 5,
        comment: "Suporte incrível e material didático de primeira qualidade. Consegui estudar no meu ritmo e já estou aplicando o conhecimento no trabalho.",
        isApproved: true,
      },
    }),
  ]);

  console.log(`Created ${testimonials.length} testimonials`);

  console.log("Seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
