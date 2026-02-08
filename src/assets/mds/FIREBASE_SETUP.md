# Firebase Setup Guide - Memory Book

Este guia detalha como configurar o Firebase para o projeto Memory Book.

## 1. Criar Projeto no Firebase Console

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Add project" / "Criar projeto"
3. Nome do projeto: `memory-book` (ou o nome desejado)
4. Desative o Google Analytics (opcional para hackathon)
5. Clique em "Create project"

## 2. Habilitar Serviços do Firebase

### 2.1 Authentication
1. No menu lateral, clique em **Authentication**
2. Clique em **Get started**
3. Na aba **Sign-in method**, habilite:
   - **Anonymous**: Clique, ative e salve (IMPORTANTE para usuários guest!)
   - **Email/Password**: Clique, ative e salve
   - **Google**: Clique, ative, configure o email de suporte e salve

### 2.2 Cloud Firestore
1. No menu lateral, clique em **Firestore Database**
2. Clique em **Create database**
3. Selecione **Start in production mode** (vamos configurar as regras depois)
4. Escolha a região mais próxima (ex: `southamerica-east1` para Brasil)
5. Clique em **Enable**

### 2.3 Firebase Storage
1. No menu lateral, clique em **Storage**
2. Clique em **Get started**
3. Aceite as regras padrão (vamos substituir depois)
4. Escolha a mesma região do Firestore
5. Clique em **Done**

## 3. Registrar App Web

1. Na página inicial do projeto, clique no ícone da Web (`</>`)
2. Nickname do app: `memory-book-web`
3. Marque **Also set up Firebase Hosting** se quiser deploy via Firebase
4. Clique em **Register app**
5. Copie as configurações do SDK:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

## 4. Configurar Variáveis de Ambiente

1. Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

2. Preencha com as credenciais do Firebase:

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

## 5. Instalar Firebase CLI

```bash
# Usando npm
npm install -g firebase-tools

# Verificar instalação
firebase --version
```

## 6. Login no Firebase CLI

```bash
firebase login
```

Isso abrirá o navegador para autenticação.

## 7. Inicializar Firebase no Projeto

O projeto já contém os arquivos de configuração. Apenas vincule ao projeto:

```bash
# Definir o projeto padrão
firebase use --add

# Selecione seu projeto e dê um alias (ex: "default" ou "production")
```

Ou crie o arquivo `.firebaserc` manualmente:

```json
{
  "projects": {
    "default": "your-project-id"
  }
}
```

## 8. Deploy das Regras e Indexes

```bash
# Deploy somente regras e indexes
firebase deploy --only firestore:rules,firestore:indexes,storage:rules

# Ou deploy completo (incluindo hosting se configurado)
firebase deploy
```

## 9. Usar Emulators (Desenvolvimento Local)

Os emulators permitem testar sem afetar o Firebase de produção:

```bash
# Instalar emulators
firebase init emulators

# Iniciar emulators
firebase emulators:start
```

Habilite no `.env`:

```env
VITE_USE_FIREBASE_EMULATORS=true
```

URLs dos emulators:
- Auth: http://localhost:9099
- Firestore: http://localhost:8080
- Storage: http://localhost:9199
- Emulator UI: http://localhost:4000

## 10. Estrutura de Dados

### Collections

```
users/{userId}
  ├── displayName: string
  ├── email: string
  ├── createdAt: timestamp
  └── lastLoginAt: timestamp

memoryBooks/{bookId}
  ├── ownerId: string
  ├── title: string
  ├── subtitle: string (optional)
  ├── bookDate: timestamp
  ├── pageCount: 10 | 15 | 20
  ├── imageStyle: "coloring" | "cartoon" | "anime" | "watercolor"
  ├── tone: "warm_simple" | "joyful" | "calm_reflective" (optional)
  ├── readingLevel: "very_simple" | "standard" (optional)
  ├── status: "draft" | "generating" | "ready" | "error"
  ├── createdAt: timestamp
  ├── updatedAt: timestamp
  │
  ├── sections/{sectionId} (childhood | teen | adult | laterLife)
  │     ├── text: string
  │     ├── skipped: boolean
  │     └── updatedAt: timestamp
  │
  ├── images/{imageId}
  │     ├── category: "profile_reference" | "childhood" | "teen" | "adult" | "laterLife"
  │     ├── storagePath: string
  │     ├── downloadUrl: string (optional)
  │     ├── caption: string (optional)
  │     ├── order: number (optional)
  │     └── createdAt: timestamp
  │
  ├── pages/{pageId}
  │     ├── pageNumber: number
  │     ├── chapter: string
  │     ├── title: string
  │     ├── body: string
  │     ├── image: { storagePath, downloadUrl }
  │     └── createdAt: timestamp
  │
  └── generationJobs/{jobId}
        ├── startedAt: timestamp
        ├── finishedAt: timestamp (optional)
        ├── inputSnapshot: map
        └── errorMessage: string (optional)
```

### Storage Structure

```
users/{userId}/books/{bookId}/
  ├── profile-references/
  │     └── {filename}
  ├── section-references/
  │     ├── childhood/
  │     ├── teen/
  │     ├── adult/
  │     └── laterLife/
  └── generated-pages/
        ├── 1/
        ├── 2/
        └── ...
```

## 11. Uso no React App

### Criar Memory Book

```typescript
import { 
  createMemoryBook, 
  uploadProfileReferences, 
  addImage,
  upsertSection,
  updateMemoryBookStatus 
} from '@/lib/firebase';

// 1. Criar o book
const bookId = await createMemoryBook(userId, {
  title: "Maria's Memory Book",
  pageCount: 15,
  imageStyle: 'watercolor',
  tone: 'warm_simple',
  readingLevel: 'standard',
});

// 2. Upload das fotos de referência
const uploadResults = await uploadProfileReferences(userId, bookId, files);

// 3. Salvar referências no Firestore
for (const result of uploadResults) {
  await addImage(bookId, {
    category: 'profile_reference',
    storagePath: result.storagePath,
    downloadUrl: result.downloadUrl,
  });
}

// 4. Salvar seções conforme o wizard avança
await upsertSection(bookId, 'childhood', {
  text: 'Born in São Paulo in 1942...',
  skipped: false,
});

// 5. Quando pronto para gerar
await updateMemoryBookStatus(bookId, 'generating');

// 6. Após gerar páginas
await updateMemoryBookStatus(bookId, 'ready');
```

### Buscar Memory Books do Usuário

```typescript
import { getUserMemoryBooks } from '@/lib/firebase';

const books = await getUserMemoryBooks(userId, {
  status: 'ready', // opcional: filtrar por status
  limitCount: 10,  // opcional: limitar quantidade
});
```

## 12. Comandos Úteis

```bash
# Login
firebase login

# Logout
firebase logout

# Listar projetos
firebase projects:list

# Selecionar projeto
firebase use <project-id>

# Deploy rules e indexes
firebase deploy --only firestore:rules,firestore:indexes,storage:rules

# Deploy hosting
firebase deploy --only hosting

# Iniciar emulators
firebase emulators:start

# Ver logs
firebase functions:log
```

## 13. Troubleshooting

### Erro de permissão no Firestore
- Verifique se o usuário está autenticado
- Verifique se o `ownerId` corresponde ao `auth.uid`
- Teste no Emulator UI para ver logs detalhados

### Erro de CORS no Storage
- O Storage está configurado corretamente para o domínio
- Use `getDownloadURL()` para obter URLs públicas

### Emulators não conectam
- Verifique se `VITE_USE_FIREBASE_EMULATORS=true` está no `.env`
- Verifique se os emulators estão rodando nas portas corretas

---

## Checklist de Deploy

- [ ] Criar projeto no Firebase Console
- [ ] Habilitar Authentication (Email/Password + Google)
- [ ] Criar Firestore Database
- [ ] Criar Storage Bucket
- [ ] Registrar app web e copiar config
- [ ] Criar arquivo `.env` com credenciais
- [ ] Criar arquivo `.firebaserc`
- [ ] `firebase login`
- [ ] `firebase deploy --only firestore:rules,firestore:indexes,storage:rules`
- [ ] Testar autenticação
- [ ] Testar criação de Memory Book
- [ ] Testar upload de imagens
