# Guia de Download e Instalação de Software

## 🎥 Software de Gravação de Tela

### Opção 1: OBS Studio (Recomendado) ✅

**Link de Download**: https://obsproject.com/download

**Plataformas**: Windows, Mac, Linux  
**Preço**: Gratuito (Open Source)  
**Tamanho**: ~100MB

#### Por que escolher OBS:
- ✅ Profissional e gratuito
- ✅ Gravação em 1080p/4K
- ✅ Controle total de qualidade
- ✅ Pode adicionar overlays (webcam, etc.)
- ✅ Muito usado por profissionais

#### Instalação Windows:
1. Baixar installer do link acima
2. Executar OBS-Studio-XX.X.X-Full-Installer-x64.exe
3. Seguir wizard de instalação
4. Aceitar termos e instalar

#### Configuração Inicial (Importante!):

**Passo 1 - Criar Scene**:
- Abrir OBS Studio
- Em "Sources", clicar no "+"
- Adicionar "Display Capture" (captura tela inteira) OU
- Adicionar "Window Capture" (captura só a janela do browser)

**Passo 2 - Configurar Qualidade**:
1. Settings > Output
   - Output Mode: Simple
   - Recording Quality: High Quality, Medium File Size
   - Recording Format: MP4
   - Encoder: x264

2. Settings > Video
   - Base Resolution: 1920x1080
   - Output Resolution: 1920x1080
   - FPS: 30

3. Settings > Audio
   - Sample Rate: 44.1 kHz
   - Channels: Stereo
   - Desktop Audio Device: Default
   - Mic/Auxiliary Audio: Seu microfone

**Passo 3 - Testar**:
- Clicar em "Start Recording"
- Falar e fazer alguns cliques
- Clicar em "Stop Recording"
- Verificar arquivo em Videos > OBS

#### Atalhos Úteis OBS:
- `Ctrl + R`: Iniciar/Parar gravação
- `Ctrl + P`: Pausar gravação (útil!)

---

### Opção 2: Loom (Mais Simples) 

**Link de Download**: https://www.loom.com/download

**Plataformas**: Windows, Mac, Chrome Extension  
**Preço**: Gratuito até 5min/vídeo (suficiente para hackathon)  
**Tamanho**: ~200MB

#### Por que escolher Loom:
- ✅ Muito fácil de usar
- ✅ Upload direto para nuvem
- ✅ Pode compartilhar link imediatamente
- ✅ Boa qualidade automática
- ❌ Menos controle sobre configurações

#### Instalação:
1. Criar conta gratuita em loom.com
2. Baixar aplicativo desktop
3. Fazer login
4. Pronto para usar!

#### Como usar:
1. Abrir Loom app
2. Escolher "Screen Only" (só tela)
3. Selecionar janela ou tela inteira
4. Clicar para começar
5. Quando terminar, para automaticamente e faz upload

---

### Opção 3: ShareX (Windows Only)

**Link de Download**: https://getsharex.com/

**Plataforma**: Windows apenas  
**Preço**: Gratuito (Open Source)  
**Tamanho**: ~15MB (muito leve!)

#### Por que escolher ShareX:
- ✅ Muito leve e rápido
- ✅ Boa qualidade
- ✅ Fácil de usar
- ✅ Já vem com FFmpeg incluído

#### Instalação:
1. Baixar ShareX-XX.X-setup.exe
2. Instalar normalmente
3. Primeira vez vai baixar FFmpeg (aguardar)

#### Configurar para gravação:
1. Task Settings > Screen Recorder
2. Screen recording options:
   - Video codec: x264
   - Quality: High
   - FPS: 30
3. Atalho padrão: `Shift + Print Screen`

---

## 🎬 Software de Edição de Vídeo

### Opção 1: DaVinci Resolve (Recomendado) ✅

**Link de Download**: https://www.blackmagicdesign.com/products/davinciresolve

**Plataformas**: Windows, Mac, Linux  
**Preço**: Gratuito (versão Studio é paga, mas free é suficiente)  
**Tamanho**: ~3GB (instalação grande, mas vale a pena!)

#### Por que escolher DaVinci Resolve:
- ✅ Profissional completo
- ✅ Usado em Hollywood
- ✅ Excelente para color grading
- ✅ Timeline poderosa
- ✅ Efeitos de transição lindos
- ✅ Exportação de alta qualidade
- ❌ Curva de aprendizado (mas há tutoriais)

#### Instalação:

**Windows**:
1. Ir para link acima
2. Preencher formulário rápido (nome, email)
3. Baixar "DaVinci Resolve 19" (versão free)
4. Executar installer (pode demorar 15-20 minutos)
5. Reiniciar PC após instalação

**IMPORTANTE**: Requer placa de vídeo razoável. Se PC for muito antigo, considerar CapCut.

#### Requisitos Mínimos:
- Windows 10 (64-bit)
- 16GB RAM (mínimo 8GB)
- GPU: NVIDIA GTX 960 / AMD R9 380 ou melhor
- 30GB espaço em disco

#### Tutorial Rápido Recomendado:
Procurar no YouTube: "DaVinci Resolve 19 beginner tutorial 2024"
- Canais recomendados: Casey Faris, JayAreTV, Billy Rybka

#### Configuração Inicial:

**Criar Novo Projeto**:
1. Abrir DaVinci Resolve
2. New Project > "Memorybook_Video"
3. File > Project Settings:
   - Timeline resolution: 1920x1080 HD
   - Timeline framerate: 30fps
   - Playback framerate: 30fps

**Importar Arquivos**:
1. Ir para "Edit" page (menu inferior)
2. Media Pool > Drag and drop seus vídeos/áudio/imagens
3. Arrastar para timeline

**Atalhos Essenciais**:
- `Espaço`: Play/Pause
- `I` / `O`: Marcar in/out points
- `Ctrl + B`: Cortar clip
- `Ctrl + D`: Fade transition
- `Ctrl + T`: Add text
- `Ctrl + M`: Renderizar (exportar)

---

### Opção 2: CapCut Desktop (Mais Simples) ✅

**Link de Download**: https://www.capcut.com/

**Plataformas**: Windows, Mac  
**Preço**: Gratuito  
**Tamanho**: ~500MB

#### Por que escolher CapCut:
- ✅ Muito fácil de aprender
- ✅ Interface moderna e intuitiva
- ✅ Templates prontos
- ✅ Auto-legendas (muito útil!)
- ✅ Efeitos modernos
- ✅ Exporta rápido
- ❌ Menos profissional que DaVinci
- ❌ Marca d'água em algumas features (versão free)

#### Instalação:
1. Ir para capcut.com
2. Baixar versão desktop (não é o app mobile)
3. Instalar normalmente
4. Criar conta (pode usar Google)

#### Tutorial Rápido:
1. New Project > 1920x1080 30fps
2. Import > Seus arquivos
3. Arrastar para timeline
4. Usar ferramentas na barra lateral:
   - Text: Adicionar overlays
   - Audio: Música de fundo
   - Transition: Entre clipes
   - Effects: Se quiser
5. Export > 1080p 30fps

---

### Opção 3: Kdenlive (Linux / Open Source)

**Link de Download**: https://kdenlive.org/

**Plataformas**: Linux, Windows, Mac  
**Preço**: Gratuito (Open Source)

#### Por que escolher Kdenlive:
- ✅ Open source completo
- ✅ Interface limpa
- ✅ Bom para Linux users
- ✅ Estável e leve
- ❌ Menos recursos que DaVinci

---

### Opção 4: Adobe Premiere Pro (Se já tiver)

**Link**: https://www.adobe.com/products/premiere.html

**Preço**: $22.99/mês (trial grátis 7 dias)

#### Apenas use se:
- Já tem experiência com Premiere
- Já tem assinatura Creative Cloud
- Precisa de features específicas

**Não recomendado** começar a aprender agora se nunca usou (curva de aprendizado).

---

## 🎤 Software de Edição de Áudio

### Audacity (Recomendado) ✅

**Link de Download**: https://www.audacityteam.org/download/

**Plataformas**: Windows, Mac, Linux  
**Preço**: Gratuito (Open Source)  
**Tamanho**: ~30MB

#### Por que usar Audacity:
- ✅ Padrão da indústria (free)
- ✅ Fácil de usar
- ✅ Remove ruído de fundo
- ✅ Normaliza áudio
- ✅ Exporta em vários formatos

#### Instalação:
1. Baixar installer do link acima
2. Instalar normalmente
3. Pronto para usar!

#### Como Usar para Limpar Áudio:

**Remover Ruído de Fundo**:
1. Gravar 2 segundos de silêncio no início
2. Selecionar esses 2 segundos
3. Effect > Noise Reduction > Get Noise Profile
4. Selecionar todo áudio (Ctrl+A)
5. Effect > Noise Reduction > OK

**Normalizar Volume**:
1. Selecionar todo áudio (Ctrl+A)
2. Effect > Normalize > OK
3. Deixa tudo no mesmo volume

**Remover Respirações/Silêncios Longos**:
1. Effect > Truncate Silence
2. Ajustar para não cortar muito

**Exportar**:
1. File > Export > Export as WAV (melhor qualidade)
2. Ou MP3 (menor tamanho)

---

## 🎵 Onde Baixar Música Royalty-Free

### YouTube Audio Library (Recomendado) ✅

**Link**: https://studio.youtube.com/channel/UC_CHANNEL_ID/music

**Como acessar**:
1. Fazer login no YouTube Studio
2. Ir para "Audio Library" no menu esquerdo
3. Filtrar por:
   - Mood: Emotional, Inspirational
   - Genre: Ambient, Piano
   - Duration: 2-3 minutos mínimo

**Buscar por**:
- "emotional piano"
- "inspirational soft"
- "hopeful ambient"

**Uso**: 100% livre para usar no YouTube

---

### Epidemic Sound (Trial Grátis)

**Link**: https://www.epidemicsound.com/

**Preço**: Trial grátis 30 dias (cancelar antes de cobrar)

**Qualidade**: Muito alta, música profissional

---

### Artlist (Trial Grátis)

**Link**: https://artlist.io/

**Preço**: Trial pode dar algumas músicas grátis

---

### Pixabay Music

**Link**: https://pixabay.com/music/

**Preço**: 100% gratuito
**Qualidade**: Boa, mas mais limitado

---

## 🎨 Onde Baixar Stock Footage

### Pexels Videos (Recomendado) ✅

**Link**: https://www.pexels.com/videos/

**Preço**: 100% gratuito  
**Qualidade**: Excelente

**Buscar por**:
- "elderly person looking at photos"
- "grandmother memories"
- "caregiver senior"
- "family reading book"
- "old photos album"

**Download**: 1080p ou 4K disponível

---

### Pixabay Videos

**Link**: https://pixabay.com/videos/

**Preço**: 100% gratuito  
**Qualidade**: Boa

---

### Unsplash (Fotos)

**Link**: https://unsplash.com/

**Preço**: 100% gratuito  
**Qualidade**: Excelente

Para fotos estáticas de apoio.

---

## 🖼️ Ferramentas Extras Úteis

### Canva (Para Thumbnail)

**Link**: https://www.canva.com/

**Preço**: Gratuito (pro tem mais templates)

**Use para**: Criar thumbnail chamativa do YouTube
- Tamanho: 1280x720px
- Texto grande e legível
- Cores vibrantes

---

### ZoomIt (Windows - Zoom durante apresentação)

**Link**: https://learn.microsoft.com/en-us/sysinternals/downloads/zoomit

**Preço**: Gratuito  
**Uso**: Zoom na tela durante gravação (para destacar elementos)

**Atalho padrão**: `Ctrl + 1` para zoom

---

### Presentify (Mac - Destacar cursor)

**Link**: https://presentify.compzets.com/

**Preço**: Gratuito básico / $20 pro

**Uso**: Destacar cursor e cliques durante apresentação

---

## 📦 Ordem de Instalação Recomendada

### Para Workflow Completo:

1. **OBS Studio** (gravar tela) - 10 min instalação
2. **Audacity** (editar áudio) - 5 min instalação
3. **DaVinci Resolve** ou **CapCut** (editar vídeo) - 20 min instalação
4. **ZoomIt** (Windows) - 2 min instalação
5. Criar conta no **YouTube** (se não tiver)
6. Criar conta no **Canva** (para thumbnail)

**Tempo total de instalação**: ~40 minutos

---

## ✅ Checklist Pós-Instalação

Após instalar tudo, testar:

- [ ] OBS grava tela corretamente
- [ ] OBS captura áudio do microfone
- [ ] Audacity abre e grava
- [ ] DaVinci/CapCut abre sem erros
- [ ] Importar vídeo teste no editor funciona
- [ ] Exportar vídeo teste funciona
- [ ] Música baixada e salva
- [ ] Stock footage baixado e salvo

**Quando tudo estiver funcionando: Pronto para gravar! 🎬**

---

## 🆘 Troubleshooting Comum

### OBS não captura áudio:
- Settings > Audio > Verificar device correto selecionado
- Testar microfone em outras apps primeiro

### DaVinci Resolve não abre:
- Verificar requisitos mínimos (GPU adequada)
- Atualizar drivers da placa de vídeo
- Se não funcionar: usar CapCut

### Vídeo exportado muito grande:
- Usar bitrate menor (5000 kbps é suficiente)
- Exportar em H.264, não em ProRes

### Áudio dessincronizado:
- Garantir que gravou em 30fps (não 60fps)
- Converter vídeo para 30fps antes de editar

---

**Links Rápidos - Resumo**:

- OBS: https://obsproject.com/download
- DaVinci: https://www.blackmagicdesign.com/products/davinciresolve
- CapCut: https://www.capcut.com/
- Audacity: https://www.audacityteam.org/download/
- YouTube Audio: https://studio.youtube.com/
- Pexels Videos: https://www.pexels.com/videos/

---

**Pronto para começar! Boa sorte! 🚀**
