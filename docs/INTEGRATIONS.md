# Guia de Integrações Futuras

Este documento descreve como integrar MinIO e Redis à aplicação SkillPro.

## MinIO - Armazenamento de Arquivos

### Por que usar MinIO?

- Armazenamento de vídeos das aulas
- Upload de materiais complementares (PDFs, slides)
- Geração e armazenamento de certificados em PDF
- Thumbnails de cursos
- Avatares de usuários

### Como Integrar

1. **Descomente os serviços no docker-compose.yml**

```yaml
minio:
  image: minio/minio:latest
  container_name: skillpro-minio
  restart: unless-stopped
  command: server /data --console-address ":9001"
  environment:
    MINIO_ROOT_USER: skillpro
    MINIO_ROOT_PASSWORD: skillpro123
  ports:
    - "9000:9000"
    - "9001:9001"
  volumes:
    - minio_data:/data
```

2. **Instale a biblioteca MinIO**

```bash
npm install minio
```

3. **Configure as variáveis de ambiente no .env**

```env
MINIO_ENDPOINT="localhost"
MINIO_PORT="9000"
MINIO_ACCESS_KEY="skillpro"
MINIO_SECRET_KEY="skillpro123"
MINIO_BUCKET="skillpro"
MINIO_USE_SSL="false"
```

4. **Renomeie o arquivo de configuração**

```bash
mv src/lib/minio.ts.example src/lib/minio.ts
```

5. **Inicialize o bucket no startup da aplicação**

No arquivo `src/app/api/route.ts` ou similar, adicione:

```typescript
import { initializeBucket } from '@/lib/minio';

export async function GET() {
  await initializeBucket();
  return Response.json({ status: 'ok' });
}
```

### Casos de Uso Implementados

#### Upload de Vídeo de Aula

```typescript
import { uploadFile } from '@/lib/minio';

// No endpoint de criação de aula
const videoBuffer = await file.arrayBuffer();
const videoUrl = await uploadFile(
  Buffer.from(videoBuffer),
  `courses/${courseId}/videos/${lessonId}.mp4`,
  'video/mp4'
);

// Salvar URL no banco
await prisma.lesson.update({
  where: { id: lessonId },
  data: { videoUrl },
});
```

#### Geração de Certificado PDF

```typescript
import { uploadFile } from '@/lib/minio';
import PDFDocument from 'pdfkit';

// Gerar PDF
const doc = new PDFDocument();
const buffers: Buffer[] = [];
doc.on('data', buffers.push.bind(buffers));
doc.on('end', async () => {
  const pdfBuffer = Buffer.concat(buffers);

  // Upload para MinIO
  const pdfUrl = await uploadFile(
    pdfBuffer,
    `certificates/${userId}/${courseId}.pdf`,
    'application/pdf'
  );

  // Atualizar certificado
  await prisma.certificate.update({
    where: { id: certificateId },
    data: { pdfUrl },
  });
});

doc.text('Certificado de Conclusão');
doc.end();
```

## Redis - Cache e Performance

### Por que usar Redis?

- Cache de consultas frequentes ao banco de dados
- Armazenamento de sessões
- Rate limiting de APIs
- Cache de páginas renderizadas
- Filas de processamento

### Como Integrar

1. **Descomente o serviço Redis no docker-compose.yml**

```yaml
redis:
  image: redis:7-alpine
  container_name: skillpro-redis
  restart: unless-stopped
  ports:
    - "6379:6379"
  volumes:
    - redis_data:/data
```

2. **Instale a biblioteca Redis**

```bash
npm install ioredis
```

3. **Configure a variável de ambiente no .env**

```env
REDIS_URL="redis://localhost:6379"
```

4. **Renomeie o arquivo de configuração**

```bash
mv src/lib/redis.ts.example src/lib/redis.ts
```

### Casos de Uso Implementados

#### Cache de Lista de Cursos

```typescript
import { getCache, setCache, CACHE_KEYS, CACHE_TTL } from '@/lib/redis';

export async function GET() {
  // Tentar obter do cache
  const cachedCourses = await getCache(CACHE_KEYS.COURSES_LIST);
  if (cachedCourses) {
    return Response.json(cachedCourses);
  }

  // Buscar do banco
  const courses = await prisma.course.findMany({
    where: { isPublished: true },
  });

  // Armazenar no cache por 30 minutos
  await setCache(CACHE_KEYS.COURSES_LIST, courses, CACHE_TTL.MEDIUM);

  return Response.json(courses);
}
```

#### Invalidação de Cache ao Atualizar Curso

```typescript
import { invalidateCourseCache } from '@/lib/redis';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const course = await prisma.course.update({
    where: { id: params.id },
    data: await req.json(),
  });

  // Invalidar cache
  await invalidateCourseCache(params.id);

  return Response.json(course);
}
```

#### Rate Limiting de API

```typescript
import { checkRateLimit } from '@/lib/redis';

export async function POST(req: Request) {
  const userId = await getCurrentUserId();

  // Limite: 100 requisições por minuto
  const allowed = await checkRateLimit(`api:${userId}`, 100, 60);

  if (!allowed) {
    return Response.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  // Processar requisição
  // ...
}
```

#### Cache de Certificados do Usuário

```typescript
import { getCachedCertificates, setCachedCertificates } from '@/lib/redis';

export async function GET() {
  const userId = await getCurrentUserId();

  // Tentar obter do cache
  const cached = await getCachedCertificates(userId);
  if (cached) {
    return Response.json(cached);
  }

  // Buscar do banco
  const certificates = await prisma.certificate.findMany({
    where: { studentId: userId },
    include: { course: true },
  });

  // Armazenar no cache por 1 hora
  await setCachedCertificates(userId, certificates);

  return Response.json(certificates);
}
```

## Monitoramento

### MinIO Console

Acesse http://localhost:9001 para gerenciar buckets e arquivos.

- Usuário: skillpro
- Senha: skillpro123

### Redis Commander (Opcional)

Para visualizar dados no Redis, adicione ao docker-compose.yml:

```yaml
redis-commander:
  image: rediscommander/redis-commander:latest
  container_name: skillpro-redis-commander
  restart: unless-stopped
  environment:
    - REDIS_HOSTS=local:redis:6379
  ports:
    - "8081:8081"
  depends_on:
    - redis
```

Acesse http://localhost:8081

## Performance Esperada

### Sem Cache (Redis)
- Listagem de cursos: ~200-500ms
- Detalhes do curso: ~150-300ms

### Com Cache (Redis)
- Listagem de cursos: ~5-20ms (40x mais rápido)
- Detalhes do curso: ~3-15ms (50x mais rápido)

### MinIO vs Database Storage
- Upload de vídeo para banco: Não recomendado
- Upload de vídeo para MinIO: Streaming eficiente
- Certificados PDF no banco: ~10MB de espaço/certificado
- Certificados PDF no MinIO: Armazenamento escalável

## Próximos Passos

1. **Implementar upload de vídeos**
   - Adicionar componente de upload no admin
   - Processar vídeos com FFmpeg (opcional)
   - Armazenar no MinIO

2. **Gerar certificados PDF**
   - Usar biblioteca pdfkit ou puppeteer
   - Template customizável
   - Download direto do MinIO

3. **Otimizar queries com cache**
   - Identificar queries mais lentas
   - Implementar cache estratégico
   - Monitorar hit rate

4. **Implementar rate limiting**
   - Proteger APIs públicas
   - Prevenir abuso
   - Configurar limites por role

## Recursos Adicionais

- [MinIO Documentation](https://min.io/docs/minio/linux/index.html)
- [Redis Documentation](https://redis.io/docs/)
- [ioredis GitHub](https://github.com/luin/ioredis)
- [MinIO Node.js SDK](https://min.io/docs/minio/linux/developers/javascript/minio-javascript.html)
