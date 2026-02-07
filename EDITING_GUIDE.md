# Guia Completo de Edição de Vídeo

Guia passo a passo para editar o vídeo no DaVinci Resolve ou CapCut.

---

## 🎬 PARTE 1: ESCOLHER SEU EDITOR

### DaVinci Resolve (Recomendado se PC potente)

**Use se**:
- ✅ Tem PC com boa GPU (NVIDIA GTX 960+ ou AMD R9 380+)
- ✅ Quer qualidade profissional
- ✅ Não tem pressa em aprender (1-2h de curva de aprendizado)
- ✅ Quer controle total sobre edição

**Pule para**: Seção "Edição no DaVinci Resolve"

---

### CapCut Desktop (Alternativa mais simples)

**Use se**:
- ✅ PC mais fraco ou antigo
- ✅ Quer facilidade e rapidez
- ✅ Prefere interface intuitiva estilo mobile
- ✅ Não precisa de recursos super avançados

**Pule para**: Seção "Edição no CapCut"

---

## 🎨 PARTE 2: EDIÇÃO NO DAVINCI RESOLVE

### Configuração Inicial do Projeto

#### 1. Criar Novo Projeto

1. Abrir DaVinci Resolve
2. Clicar em "New Project"
3. Nome: "Memorybook_Hackathon_Video"
4. Criar

#### 2. Configurar Project Settings

1. File > Project Settings (ou atalho: `Shift + 9`)
2. **Timeline Settings**:
   - Timeline resolution: 1920x1080 HD
   - Timeline frame rate: 30 fps
   - Playback frame rate: 30
3. **Master Settings**:
   - Video format: HD 1080p 30
4. Save

---

### Importar Todos os Arquivos

#### 3. Importar Media

1. Ir para **"Media" page** (botão no menu inferior)
2. Arrastar e soltar todos os arquivos para o Media Pool:

**Organizar em Bins (pastas)**:
- Criar bin "Screen Recording" → colocar takes de tela
- Criar bin "Narration" → colocar arquivos de áudio
- Criar bin "Music" → música de fundo
- Criar bin "Stock Footage" → vídeos stock
- Criar bin "Photos" → fotos da Maria, logos, etc.

**Arquivos para importar**:
- [ ] Todas as gravações de tela
- [ ] Todos os áudios de narração
- [ ] 3 músicas de fundo
- [ ] Stock footage (pessoa idosa, cuidador)
- [ ] Fotos (Maria, logos Gemini/Memorybook)
- [ ] Screenshots de serviços caros (se tiver)

---

### Montar a Timeline

#### 4. Ir para Edit Page

1. Clicar em **"Edit"** (menu inferior)
2. Agora você vê a timeline

#### 5. Estratégia de Montagem

**Começar com estrutura de áudio (espinha dorsal)**:

1. Arrastar todas as **narrações** para a timeline em ordem:
   - Track Audio 1: narration_scene1.wav
   - Seguido de narration_scene2.wav
   - E assim por diante...

2. Deixar pequenos gaps (0.5-1s) entre cada bloco se precisar respirar

3. **Timing check**: Tocar do início ao fim. Deve ter ~2:40 de narração total.

---

#### 6. Adicionar Vídeos Sincronizados com Narração

**Cena 1 (0:00-0:25) - Gancho Emocional**:

- Track V1: Stock footage "pessoa idosa com fotos"
  - Duração: 0:00-0:08 (8s)
  - Cortar clip: Apertar `I` no início bom, `O` no final, arrastar para timeline
  
- Track V1: Logo do Memorybook (imagem estática)
  - Duração: 0:08-0:17 (9s)
  - Dica: Adicionar zoom suave (veremos em "Efeitos")
  
- Track V1: Livro sendo folheado
  - Duração: 0:17-0:25 (8s)
  - Pode ser gravação sua OU stock footage

**Transições entre clips**:
- Selecionar entre dois clips
- Effects Library > Video Transitions > Dissolve > "Cross Dissolve"
- Arrastar entre clips
- Duração: 0.5-1 segundo

---

**Cena 2 (0:25-0:45) - O Problema**:

- Track V1: Stock footage "cuidador/família" (0:25-0:32)
  - Ou split screen com 2 vídeos (mais avançado)
  
- Track V1: Screenshots de serviços caros (0:32-0:40)
  - Importar imagens
  - Cada screenshot 3-4 segundos
  - Pode fazer montagem rápida
  
- Track V1: Tela com estatística (0:40-0:45)
  - Criar no Fusion (overlay de texto - veremos depois)

---

**Cena 3 (0:45-1:50) - Demo ao Vivo**:

Esta é a parte PRINCIPAL. Usar suas gravações de tela:

- Track V1: Gravação de tela completa (ou montagem dos takes)
  - 0:45-1:50 (65 segundos de demo)
  
**Dicas de edição**:
- **Acelerar partes lentas**: 
  - Selecionar clip de digitação
  - Botão direito > Change Clip Speed > 200% ou 300%
  - Áudio fica estranho? Desativar áudio do clip (M)

- **Cortar partes desnecessárias**:
  - Use `B` (Blade tool) para cortar
  - Selecione e delete pedaços ruins
  - Clips ao lado se juntam automaticamente

- **Adicionar zooms** para destacar elementos:
  - Selecionar clip
  - Inspector (direita) > Transform > Zoom
  - Keyframe no início e fim para zoom smooth

---

**Cena 4 (1:50-2:20) - Tecnologia Gemini**:

Pode ser mix de:
- Gravação de tela (mostrando código/logs)
- Animações simples (Fusion)
- Split screens
- Texto overlay com ícones

**Split Screen** (mostrar 2 coisas ao mesmo tempo):
1. Colocar um clip em V1
2. Outro clip em V2 (acima)
3. Selecionar clip V2
4. Inspector > Transform > Position X (mover para lado)
5. Inspector > Crop (cortar metade)

---

**Cena 5 (2:20-2:40) - Impacto**:

- Stock footage: Cuidador lendo com pessoa idosa
- Intercalar com: Screenshots do app (seletor de idiomas, livros diferentes)

---

**Cena 6 (2:40-2:50) - Call to Action**:

- Tela limpa com URL grande
- Logos (Gemini + Memorybook)
- Fade out suave

---

### Adicionar Música de Fundo

#### 7. Música nas Tracks de Áudio

1. Track Audio 2: Música emocional (0:00-0:45)
2. Track Audio 2: Música animada (0:45-2:20)
3. Track Audio 2: Música inspiracional (2:20-2:50)

**Ajustar volume da música**:
- Selecionar clip de música
- Inspector > Volume: ~-20dB a -15dB (música deve ser BAIXA)
- Ou: Linha branca no clip = volume, arrastar para baixo

**Fade in/out na música**:
- Início da música: Arrastar círculo no canto do clip para criar fade
- Final: Idem

**Crossfade entre músicas**:
- Sobrepor clips de música por 2-3 segundos
- Fade out na primeira, fade in na segunda

---

### Adicionar Overlays de Texto

#### 8. Criar Text Overlays

**Texto simples**:
1. Effects Library > Titles > Text
2. Arrastar para Track V2 (acima do vídeo)
3. Duração: ajustar conforme necessário
4. Inspector > Texto: Digitar seu texto
5. Inspector > Font: Escolher fonte (Inter, Montserrat, Roboto)
6. Inspector > Size: 60-80 (para 1080p)
7. Inspector > Color: Branco (#FFFFFF)

**Adicionar fundo ao texto** (mais legível):
1. Clicar no texto na timeline
2. Inspector > Background > Enable
3. Background Type: Solid
4. Background Color: Preto
5. Background Opacity: 60%
6. Padding: 20

**Animação de entrada/saída**:
1. Selecionar texto
2. Effects > Video Transitions > Fade
3. Aplicar no início e fim do clip

---

**Textos necessários (lista da Cena)**:

**Cena 1**:
- Timing: 0:17-0:25
- Texto: "For Alzheimer's & Dementia Families"
- Posição: Terço inferior

**Cena 2**:
- Timing 1: 0:32-0:40
- Texto: "$500-$2,000 + weeks of work"
- Timing 2: 0:40-0:45
- Texto: "50M+ families need memory preservation"

**Cena 3**:
- Timing 1: 0:50-1:00
- Texto: "Step 1: Upload Photos"
- Timing 2: 1:00-1:15
- Texto: "Step 2: Add Memories"
- Timing 3: 1:15-1:25
- Texto: "Step 3: Select Style"
- Timing 4: 1:25-1:50
- Texto: "Step 4: Generate with AI"
- Timing 5: 1:35-1:45
- Texto: "11 AI Agents Working Together"

**Cena 4**:
- Timing 1: 1:58-2:06
- Texto: "Gemini Multimodal Vision"
- Timing 2: 2:06-2:13
- Texto: "Gemini 2.5 Flash Image"
- Timing 3: 2:13-2:20
- Texto: "3 Models Working Together"

**Cena 5**:
- Timing: 2:28-2:35
- Texto (aparecendo progressivamente):
  - "✓ Stimulate Memory"
  - "✓ Create Connection"
  - "✓ Preserve Dignity"
- Timing 2: 2:35-2:40
- Texto: "6 Languages Supported"

**Cena 6**:
- Timing: 2:44-2:50
- Texto GRANDE: "memory-book-app-1bfd7.web.app"
- Font size: 100+
- Texto menor: "GitHub: github.com/[user]/Memorybook"
- Logos: Gemini 3 + Memorybook

---

### Efeitos e Polimento

#### 9. Color Correction (Opcional mas recomendado)

1. Ir para **"Color" page** (menu inferior)
2. Selecionar clip que quer ajustar
3. **Ajustes básicos**:
   - Lift (sombras): Aumentar levemente se muito escuro
   - Gamma (meio-tons): Ajustar para balanço
   - Gain (luzes): Cuidado para não estourar
4. Pode usar **Auto Color** para começar: Botão "A" na paleta
5. **Não exagere!** Sutil é melhor.

Para vídeos de demonstração: Garantir que texto está legível é prioridade.

---

#### 10. Smooth Transitions

**Entre cenas principais**, usar transições:

**Dissolve (Cross Dissolve)**: Mais comum
- Transição suave de fade entre clips

**Dip to Color**: Fade para preto/branco e volta
- Use entre seções grandes (Cena 1 → Cena 2)

**Aplicar**:
1. Effects Library > Video Transitions
2. Arrastar para entre dois clips
3. Ajustar duração (0.5-1 segundo é bom)

**EVITAR**: Transições chamativas (wipe, cube, etc.) - não profissional

---

#### 11. Audio Mixing

**Balancear todos os áudios**:

1. Ir para **"Fairlight" page** (menu inferior) - é o mixer de áudio profissional
2. Ver todas as tracks de áudio
3. **Ajustar volumes**:
   - Narração (Track 1): -6dB a -3dB (mais alto)
   - Música (Track 2): -20dB a -15dB (baixo, fundo)
   - Som ambiente de stock footage (se tiver): -25dB ou mutar
4. **Normalização**:
   - Selecionar todos os clips de narração
   - Botão direito > Normalize Audio
5. **EQ na narração** (opcional):
   - Effects > Parametric EQ
   - Boost leve em 3kHz (claridade)
   - Cut abaixo de 80Hz (rumble)

**Teste final**: Ouvir vídeo inteiro. Narração deve ser SEMPRE audível acima da música.

---

### Revisão Final

#### 12. Assistir Vídeo Completo

**Checklist de revisão**:
- [ ] Assistir do início ao fim sem parar
- [ ] Verificar se todos os textos aparecem no tempo certo
- [ ] Verificar se transições estão suaves
- [ ] Verificar se música não está muito alta
- [ ] Verificar se narração está clara
- [ ] Verificar duração total (~2:50 ou menos)
- [ ] Verificar se não há frames pretos/vazios indesejados
- [ ] Verificar se URL está legível e correto

**Fazer ajustes** conforme necessário e assistir novamente.

---

## 🎨 PARTE 3: EDIÇÃO NO CAPCUT (Alternativa Simples)

### Se escolheu CapCut em vez de DaVinci:

#### 1. Criar Novo Projeto

1. Abrir CapCut Desktop
2. "Create Project"
3. Arraste TODOS os arquivos para a área de import

#### 2. Montar Timeline

**Muito similar ao DaVinci, mas interface mais simples**:

1. Arrastar narrações para timeline (Track Audio 1)
2. Arrastar vídeos de tela para timeline (Track Video 1)
3. Ajustar timing arrastando e cortando

**Cortar clips**: Botão de tesoura ou `Ctrl + B`

**Acelerar**: Selecionar clip > Speed > 2x ou 3x

---

#### 3. Adicionar Textos

1. Barra lateral: "Text"
2. "Add text"
3. Digitar texto
4. Ajustar fonte, tamanho, cor
5. Arrastar na timeline para duração desejada

**CapCut tem templates**: Pode usar se quiser efeitos prontos.

---

#### 4. Adicionar Música

1. Arrastar música para timeline
2. Ajustar volume: Selecionar clip > Volume slider (deixar ~20%)
3. Fade in/out: Botão "Fade" quando clip selecionado

---

#### 5. Transições

1. Barra lateral: "Transitions"
2. Escolher "Dissolve" ou "Fade"
3. Arrastar entre clips

---

#### 6. Auto-Legendas (Feature Incrível do CapCut)

**Opcional mas útil para acessibilidade**:

1. Barra lateral: "Captions"
2. "Auto captions"
3. Language: English
4. Generate
5. Aguardar processamento
6. Revisar e corrigir erros
7. Ajustar estilo das legendas

---

#### 7. Exportar (ver próxima seção)

---

## 📤 PARTE 4: EXPORTAR O VÍDEO

### Configurações de Export (DaVinci Resolve)

#### 1. Ir para Deliver Page

1. Clicar em **"Deliver"** (menu inferior)

#### 2. Configurar Export

**Preset**: Escolher ou criar custom

**Configurações recomendadas**:

1. **Format**: MP4
2. **Codec**: H.264
3. **Resolution**: 1920x1080 (HD)
4. **Frame Rate**: 30fps
5. **Quality**:
   - Bitrate: 8000-10000 Kbps (boa qualidade, tamanho razoável)
   - OU: Quality: 75-80 (slider)
6. **Audio**:
   - Codec: AAC
   - Bitrate: 256 Kbps ou 320 Kbps
   - Sample Rate: 48kHz

**Filename**: `Memorybook_Hackathon_Final_v1.mp4`

**Location**: Escolher pasta (Desktop ou pasta do projeto)

#### 3. Render

1. Clicar em "Add to Render Queue"
2. Clicar em "Render All"
3. Aguardar (pode levar 5-15 minutos dependendo do PC)
4. Verificar arquivo final

---

### Configurações de Export (CapCut)

1. Botão "Export" (canto superior direito)
2. **Resolution**: 1080P
3. **Frame rate**: 30 FPS
4. **Format**: MP4
5. **Quality**: High
6. Clicar em "Export"
7. Aguardar processamento

---

### Verificação do Arquivo Final

**Antes de fazer upload, verificar**:

- [ ] Arquivo abre sem erros
- [ ] Áudio e vídeo sincronizados
- [ ] Qualidade está boa (não pixelado)
- [ ] Duração: 2:50 ou menos
- [ ] Tamanho do arquivo: Idealmente <500MB (se muito maior, re-exportar com bitrate menor)

**Se algo estiver errado**: Voltar para edição, corrigir, exportar novamente.

**Se tudo estiver OK**: FAZER BACKUP do arquivo antes de fazer qualquer coisa!

---

## ✅ CHECKLIST FINAL DE EDIÇÃO

Antes de considerar edição completa:

- [ ] Vídeo tem duração correta (~2:50)
- [ ] Todos os textos aparecem e são legíveis
- [ ] Música de fundo está em volume adequado
- [ ] Narração está clara em todas as partes
- [ ] Transições estão suaves
- [ ] Não há frames pretos/vazios indesejados
- [ ] URL está correto e legível
- [ ] Logos aparecem no final
- [ ] Exportação finalizada com sucesso
- [ ] Arquivo final verificado e funcionando
- [ ] Backup feito

---

## ⏱️ TEMPO ESTIMADO

### DaVinci Resolve:
- Setup e import: 15 min
- Montagem de vídeo/áudio: 1-2 horas
- Adicionar textos e efeitos: 45-60 min
- Color correction e audio mix: 30 min
- Revisão e ajustes: 30 min
- Export: 10-15 min
- **Total**: 3-4 horas

### CapCut:
- Setup e import: 10 min
- Montagem: 45-60 min
- Textos e transições: 30 min
- Ajustes finais: 20 min
- Export: 10 min
- **Total**: 2-2.5 horas

**Dica**: Primeira vez sempre demora mais. Se já tiver experiência, pode ser 30-50% mais rápido.

---

## 🆘 TROUBLESHOOTING DE EDIÇÃO

### Problema: Vídeo exportado está dessincronizado (áudio atrasado/adiantado)
**Solução**:
- Verificar que todos os clips têm mesmo frame rate (30fps)
- Re-importar arquivos e tentar novamente
- Usar "Match Timeline Frame Rate" nas configurações

### Problema: Música muito alta, não consigo ouvir narração
**Solução**:
- Reduzir volume da música para -20dB ou menos
- Aumentar volume da narração
- Usar compressor no áudio (Fairlight page)

### Problema: Texto não aparece ou está cortado
**Solução**:
- Verificar que texto está em track acima do vídeo (V2 ou V3)
- Verificar timing do clip de texto
- Verificar que texto está dentro da "safe area"

### Problema: Export demora muito (horas)
**Solução**:
- Verificar se selecionou H.264 (não ProRes ou sem compressão)
- Reduzir bitrate para 6000-8000
- Fechar outros programas
- Verificar que não está exportando em 4K acidentalmente

### Problema: Arquivo exportado muito grande (>1GB)
**Solução**:
- Reduzir bitrate para 6000-7000 Kbps
- Verificar duração (deve ser ~2:50, não mais)
- Re-exportar com compressão maior

---

## 💡 DICAS PRO

1. **Salve frequentemente**: Ctrl+S a cada 10 minutos
2. **Versionamento**: Salvar como "v1", "v2", etc. Se estragar algo, pode voltar
3. **Render in Place**: Se algo está lento, pode renderizar parte da timeline
4. **Proxy Mode**: Se PC está lento, use arquivos proxy (menor resolução para editar)
5. **Atalhos úteis**:
   - `Espaço`: Play/Pause
   - `I` / `O`: Marcar in/out
   - `B`: Blade tool (cortar)
   - `A`: Selection tool (padrão)
   - `Ctrl + B`: Cortar no playhead
   - `Ctrl + Z`: Desfazer
   - `J` / `K` / `L`: Retroceder / Parar / Avançar

---

**Quando tiver arquivo final exportado e verificado: Hora de fazer upload! 🚀**

**Próximo passo**: Criar thumbnail e fazer upload no YouTube (ver próximo guia).

**Você está quase lá! Continue firme! 💪✨**
