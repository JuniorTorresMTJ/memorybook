/**
 * Sample Books Data
 *
 * 5 pre-built example memory books showcasing different styles and family members.
 * Book 0: Original watercolor book (local assets) — "As Memórias do Papai" (Carlos)
 * Book 1: Cartoon   — "As Aventuras do Papai João" (father, fisherman from Bahia)
 * Book 2: Anime     — "Minha Mãe, Minha Heroína" (mother, nurse from São Paulo)
 * Book 3: Coloring  — "O Livro do Vovô Antônio" (grandfather, farmer from Goiás)
 * Book 4: Watercolor — "As Receitas da Tia Rosa" (aunt, baker from Minas Gerais)
 *
 * Books 1-4 load images from Firebase Storage.
 */

import type { BookPage } from '../components/book/BookViewer';
import type { SampleBookDisplay } from './sampleBook';
import type { LanguageCode } from '../constants/translations';

// ─── Firebase Storage URL builder ────────────────────────────
const BUCKET = 'memory-book-app-1bfd7.firebasestorage.app';
const storageUrl = (bookId: string, filename: string) =>
    `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o/public%2Fsample-books%2F${bookId}%2F${filename}?alt=media`;

// ─── Types ──────────────────────────────────────────────────
interface PageText {
    title: string;
    description: string;
}

interface BookTexts {
    bookTitle: string;
    bookSubtitle: string;
    displayDate: string;
    displayDescription: string;
    backCoverText: string;
    pages: PageText[];
}

export interface SampleBookConfig {
    id: string;
    style: string;
    styleBadge: { pt: string; en: string };
    character: string;
    texts: { pt: BookTexts; en: BookTexts };
}

// ─── Page dates per life-phase index ────────────────────────
const PHASE_DATES = ['cover', 'young', 'young', 'adolescent', 'adolescent', 'adult', 'adult', 'adult', 'adult', 'elderly', 'elderly', 'cover'];

// ════════════════════════════════════════════════════════════
// BOOK 1 — Cartoon · Pai João (fisherman, Bahia)
// ════════════════════════════════════════════════════════════
const CARTOON_PAI: SampleBookConfig = {
    id: 'cartoon-pai',
    style: 'cartoon',
    styleBadge: { pt: 'Cartoon', en: 'Cartoon' },
    character: 'João, pescador da Bahia',
    texts: {
        pt: {
            bookTitle: 'As Aventuras do Papai João',
            bookSubtitle: 'Uma homenagem do seu filho Lucas',
            displayDate: '10 de Março, 2026',
            displayDescription: 'Um livro de memórias em estilo cartoon criado por um filho para seu pai pescador — uma celebração da vida no mar e do amor de família.',
            backCoverText: 'O mar ensina que a vida vem em ondas — algumas nos derrubam, outras nos carregam longe. Mas o que importa mesmo é ter com quem navegar. Obrigado, pai, por me ensinar a navegar pelas ondas da vida com coragem, humildade e alegria. Seu filho que te ama infinitamente, Lucas.',
            pages: [
                {
                    title: 'O Menino da Praia de Itapuã',
                    description: 'Papai João cresceu na Praia de Itapuã, em Salvador, numa casinha de madeira pintada de azul que ficava a poucos passos da areia. Todas as manhãs, antes mesmo do sol nascer, ele já estava acordado, sentindo o cheiro do mar entrar pela janela do quarto que dividia com seus três irmãos. O quintal da casa era a própria praia — ali ele construía castelos de areia enormes, com torres, pontes e fossos que as ondas vinham destruir à tarde. Sua mãe, Dona Conceição, sempre dizia que João tinha sal no sangue, porque não havia força no mundo que tirasse aquele menino da beira do mar. Aos cinco anos, já sabia nadar melhor que muitos adultos, e mergulhava de olhos abertos procurando conchas coloridas para dar de presente para a avó.',
                },
                {
                    title: 'As Lições do Velho Raimundo',
                    description: 'Seu avô Raimundo era o pescador mais respeitado de toda a costa. Tinha as mãos calejadas de décadas puxando redes e um sorriso que iluminava o rosto bronzeado como o sol da manhã. Aos sete anos, João começou a acompanhá-lo nas pescarias de madrugada na jangada de madeira que o avô construiu com as próprias mãos. "Olha pro mar, meu neto", dizia o velho Raimundo enquanto a jangada balançava suavemente, "ele te conta tudo — quando vem peixe, quando vem tempestade, quando é hora de voltar pra casa." João aprendeu a ler as correntes, a amarrar nós que não soltavam, a ter paciência quando o peixe não vinha. Mas a maior lição que o avô ensinou foi outra: "O mar não é nosso, João. A gente só pede emprestado."',
                },
                {
                    title: 'Gol de Placa na Areia',
                    description: 'Na adolescência, João dividia o coração entre o mar e o futebol. Todas as tardes depois da escola, ele e os amigos — Dinho, Marquinhos e Pelé (que não jogava tão bem assim, mas ninguém tinha coragem de dizer) — montavam times na praia e jogavam até o sol se pôr. João era o camisa 10, o craque, o que fazia dribles impossíveis com os pés descalços na areia fofa. No campeonato do bairro de 1978, ele fez um gol de bicicleta que a vizinhança inteira comentou por semanas. O sonho de ser jogador profissional era grande, mas o mar chamava mais forte. Quando precisou escolher, João olhou para a jangada do avô e soube: seu destino estava nas ondas, não no gramado.',
                },
                {
                    title: 'O Primeiro Barco Próprio',
                    description: 'Aos dezoito anos, depois de trabalhar duro durante três anos vendendo peixes no mercado de São Joaquim e fazendo bicos no porto, João finalmente juntou dinheiro suficiente para comprar seu primeiro barco. Era pequeno, de madeira, com a pintura descascando — mas para João era o maior tesouro do mundo. Ele mesmo o reformou durante semanas, lixando, pintando de azul e branco, consertando o motor temperamental que tossia mais do que funcionava. Quando finalmente o colocou na água, com o nome "Estrela do Mar" pintado na proa em homenagem à mãe, chorou escondido. Aquele barco não era só um barco — era a prova de que o menino descalço da Praia de Itapuã podia construir seu próprio caminho.',
                },
                {
                    title: 'A Moça da Festa de São João',
                    description: 'Foi numa noite de São João, com o céu explodindo em fogos de artifício e o cheiro de milho assado tomando conta de tudo, que João viu Carmen pela primeira vez. Ela estava dançando forró com as amigas, o vestido de chita rodando, o sorriso tão largo que iluminava mais que a fogueira. João, que enfrentava o mar bravo sem medo, ficou paralisado. "Vai lá, covarde!", gritou Dinho, empurrando-o. João tropeçou, derrubou um copo de quentão no próprio pé, e quando olhou pra cima, Carmen estava rindo — não dele, mas com ele. Dançaram a noite inteira. No caminho de volta, sob as estrelas da Bahia, João soube com uma certeza que nem o mar conseguia explicar: aquela moça seria a companheira de todas as suas viagens.',
                },
                {
                    title: 'O Casamento na Igrejinha do Porto',
                    description: 'Casaram-se numa manhã de sábado na igrejinha branca perto do porto, com o barulho das ondas servindo de música de fundo. Carmen entrou vestida de branco simples, com flores de jasmim no cabelo, e João chorou antes mesmo dela chegar ao altar. O padre precisou repetir as palavras dos votos três vezes porque João não conseguia falar de tanta emoção. A festa foi na praia — os amigos pescadores trouxeram o melhor peixe, a mãe de Carmen fez o bolo, e Dinho tocou violão a noite inteira. Quando o sol nasceu no dia seguinte, João e Carmen estavam sentados na areia, de mãos dadas, olhando o horizonte. "Pra onde a gente vai agora?", perguntou Carmen. "Pra onde o vento levar", respondeu João, "desde que seja junto."',
                },
                {
                    title: 'O Choro Mais Bonito do Mundo',
                    description: 'Quando Lucas nasceu, numa terça-feira chuvosa de março, João estava no hospital andando de um lado pro outro como se fosse um peixe fora d\'água. Quando a enfermeira finalmente chamou seu nome e colocou aquele bebezinho minúsculo nos seus braços, as mãos enormes de pescador tremeram como nunca tinham tremido — nem na pior tempestade do mar. Lucas era tão pequeno, tão perfeito, com os olhinhos fechados e os dedinhos agarrando o dedo do pai com uma força que parecia impossível. João ficou ali parado, embalando o filho, cantando baixinho uma cantiga que o avô Raimundo cantava nas madrugadas no mar. Naquela noite, prometeu ao bebê adormecido: "Vou te ensinar tudo que o mar me ensinou, meu filho. E o que o mar não ensinou, a gente descobre junto."',
                },
                {
                    title: 'A Primeira Pescaria do Lucas',
                    description: 'No dia em que Lucas completou seis anos, João acordou o menino antes do sol nascer, como o avô Raimundo fazia com ele. "Vem, filho, hoje você vai pro mar comigo." Os olhos de Lucas se arregalaram de excitação enquanto vestia a camiseta e corria pro barco. No Estrela do Mar, João ensinou cada gesto com paciência infinita — como segurar a vara, como sentir o puxão do peixe, como ter calma quando nada acontece. Passaram horas em silêncio, pai e filho lado a lado, balançando com as ondas. Quando Lucas finalmente pescou um peixinho prateado, gritou tão alto que espantou todos os peixes num raio de cem metros. João riu até chorar, abraçou o filho e disse: "Esse é o seu primeiro. Nunca vai esquecer." E Lucas nunca esqueceu.',
                },
                {
                    title: 'O Jardim à Beira-Mar',
                    description: 'Com o passar dos anos, João descobriu uma nova paixão além do mar: seu jardim. Na lateral da casa, onde antes só havia areia e mato, ele plantou um paraíso. Tinha hibiscos vermelhos que floresciam o ano inteiro, um pé de coqueiro que ele trouxe de uma viagem ao Recôncavo, manjericão, hortelã, e um canteiro de temperos que Carmen usava na cozinha. Todas as tardes, depois de voltar do mar, João regava cada planta como se conversasse com elas — e talvez conversasse mesmo. O papagaio Marujo, que vivia solto no quintal, acompanhava tudo do galho do coqueiro, gritando "Boa tarde, capitão!" com uma voz rouca que fazia toda a vizinhança rir. O jardim de João era sua praia particular, seu pedaço de paz depois de décadas enfrentando o mar.',
                },
                {
                    title: 'O Reencontro na Praia',
                    description: 'No último Natal, a família inteira se reuniu na Praia de Itapuã — filhos, noras, netos, sobrinhos, até o velho Dinho apareceu, de muletas mas sorrindo como sempre. Armaram uma mesa enorme na areia, com toalha branca, pratos coloridos e o peixe que João preparou no capricho. Quando todos se sentaram, João olhou ao redor e ficou em silêncio por um longo momento. Viu nos olhos dos netos a mesma curiosidade que ele tinha quando menino; viu em Lucas o mesmo amor pelo mar que herdou do avô Raimundo; viu em Carmen, depois de tantos anos, a mesma moça que dançava na festa de São João. "Tá tudo bem, pai?", perguntou Lucas. João sorriu — aquele sorriso largo que era igual ao do velho Raimundo — e respondeu: "Tá tudo perfeito, meu filho. Tá tudo perfeito."',
                },
            ],
        },
        en: {
            bookTitle: "Dad João's Adventures",
            bookSubtitle: 'A tribute from his son Lucas',
            displayDate: 'March 10, 2026',
            displayDescription: "A cartoon-style memory book created by a son for his fisherman father — a celebration of life by the sea and family love.",
            backCoverText: "The sea teaches us that life comes in waves — some knock us down, others carry us far. But what truly matters is having someone to sail with. Thank you, Dad, for teaching me to ride life's waves with courage, humility, and joy. Your son who loves you endlessly, Lucas.",
            pages: [
                { title: 'The Boy from Itapuã Beach', description: "Dad João grew up on Itapuã Beach in Salvador, in a little blue wooden house just steps from the sand. Every morning, before the sun rose, he was already awake, breathing in the scent of the sea that drifted through the window of the room he shared with his three brothers. His backyard was the beach itself — there he built enormous sandcastles with towers, bridges, and moats that the afternoon waves came to destroy. His mother, Dona Conceição, always said João had salt in his blood, because there was no force in the world that could pull that boy from the shore." },
                { title: "Old Raimundo's Lessons", description: "His grandfather Raimundo was the most respected fisherman along the entire coast. He had hands calloused from decades of pulling nets and a smile that lit up his sun-bronzed face. At seven years old, João began accompanying him on dawn fishing trips on the wooden jangada his grandfather had built with his own hands. 'Watch the sea, my grandson,' old Raimundo would say as the jangada rocked gently, 'it tells you everything — when the fish are coming, when the storm approaches, when it's time to go home.'" },
                { title: 'A Spectacular Goal on Sand', description: "As a teenager, João's heart was split between the sea and football. Every afternoon after school, he and his friends would set up teams on the beach and play until sunset. João was the number 10, the star who pulled off impossible dribbles with bare feet on the soft sand. In the 1978 neighborhood championship, he scored a bicycle kick goal that the whole community talked about for weeks." },
                { title: 'His First Own Boat', description: "At eighteen, after working hard for three years selling fish at São Joaquim market and doing odd jobs at the port, João finally saved enough to buy his first boat. It was small, wooden, with peeling paint — but to João it was the greatest treasure in the world. He renovated it himself over weeks, sanding, painting blue and white, fixing the temperamental engine that coughed more than it ran." },
                { title: "The Girl from the São João Festival", description: "It was on a São João night, with the sky exploding in fireworks and the smell of roasted corn filling the air, that João first saw Carmen. She was dancing forró with her friends, her chintz dress swirling, her smile so wide it shone brighter than the bonfire. João, who faced the rough sea fearlessly, stood paralyzed." },
                { title: 'The Wedding at the Port Chapel', description: "They married on a Saturday morning at the little white church near the port, with the sound of waves serving as background music. Carmen walked in wearing simple white, with jasmine flowers in her hair, and João cried before she even reached the altar." },
                { title: "The Most Beautiful Cry in the World", description: "When Lucas was born on a rainy Tuesday in March, João was at the hospital pacing back and forth like a fish out of water. When the nurse finally called his name and placed that tiny baby in his arms, his enormous fisherman's hands trembled as they never had — not even in the worst storm at sea." },
                { title: "Lucas's First Fishing Trip", description: "On the day Lucas turned six, João woke the boy before sunrise, just as Grandfather Raimundo had done with him. 'Come on, son, today you're going to sea with me.' Lucas's eyes went wide with excitement as he pulled on his shirt and ran to the boat." },
                { title: 'The Garden by the Sea', description: "Over the years, João discovered a new passion beyond the sea: his garden. On the side of the house, where once there was only sand and weeds, he planted a paradise. Red hibiscus that bloomed year-round, a coconut palm he brought from a trip, basil, mint, and a spice bed that Carmen used in the kitchen." },
                { title: 'The Reunion on the Beach', description: "At last Christmas, the entire family gathered at Itapuã Beach — children, daughters-in-law, grandchildren, nephews, even old Dinho showed up on crutches but smiling as always. They set up an enormous table on the sand with a white tablecloth, colorful plates, and the fish João prepared with love." },
            ],
        },
    },
};

// ════════════════════════════════════════════════════════════
// BOOK 2 — Anime · Mãe Helena (nurse, São Paulo)
// ════════════════════════════════════════════════════════════
const ANIME_MAE: SampleBookConfig = {
    id: 'anime-mae',
    style: 'anime',
    styleBadge: { pt: 'Anime', en: 'Anime' },
    character: 'Helena, enfermeira de São Paulo',
    texts: {
        pt: {
            bookTitle: 'Minha Mãe, Minha Heroína',
            bookSubtitle: 'Com amor, da sua filha Beatriz',
            displayDate: '12 de Maio, 2026',
            displayDescription: 'Um livro de memórias em estilo anime criado por uma filha para sua mãe enfermeira — uma história de dedicação, amor e cuidado.',
            backCoverText: 'Mãe, você me ensinou que cuidar dos outros é a forma mais pura de amor. Cada curativo que você colocou, cada mão que segurou, cada noite que passou acordada — tudo isso me mostrou o que significa ser forte de verdade. Este livro é minha forma de cuidar de você, como você sempre cuidou de todos nós. Com todo o amor do mundo, Beatriz.',
            pages: [
                {
                    title: 'A Menina do Apartamento 302',
                    description: 'Mamãe Helena cresceu num apartamento pequeno na Vila Mariana, em São Paulo, no terceiro andar de um prédio antigo de tijolinhos aparentes. O apartamento 302 era apertado — dois quartos para cinco pessoas — mas cheio de vida. Da janela do quarto que dividia com a irmã Lúcia, ela via as copas das árvores da praça e sonhava acordada por horas. Seu pai, Seu Geraldo, era motorista de ônibus e saía antes do amanhecer; sua mãe, Dona Tereza, costurava pra fora para ajudar nas contas. Helena era a mais velha de três irmãos, e desde cedo aprendeu a cuidar dos menores. Dava banho no Paulinho, ajudava Lúcia com a lição de casa, esquentava o leite quando a mãe chegava tarde. O apartamento era pequeno, mas o coração daquela família era imenso.',
                },
                {
                    title: 'A Contadora de Histórias',
                    description: 'Todas as noites, antes de dormir, Helena inventava histórias para os irmãos. Sentava na cama, com uma lanterna debaixo do lençol, e criava mundos inteiros: princesas que eram médicas, dragões que tinham medo de agulha, reinos onde ninguém ficava doente. Os irmãos ouviam hipnotizados, e sempre pediam "mais uma, mais uma!". Dona Tereza, que ouvia tudo da cozinha enquanto terminava a costura, sorria orgulhosa. Helena não sabia ainda, mas aquelas histórias eram os primeiros sinais do que seria sua vida: a capacidade de acolher, acalmar e fazer os outros se sentirem seguros. Anos depois, quando se tornou enfermeira, muitos pacientes disseram a mesma coisa: "Helena, sua voz acalma a gente." E ela sempre respondia: "Aprendi com meus irmãos."',
                },
                {
                    title: 'O Sonho Que Nasceu no Hospital',
                    description: 'Aos quatorze anos, Helena passou uma semana no hospital acompanhando a avó Isaura, que havia quebrado o fêmur. Foi ali, naqueles corredores brancos cheios de gente precisando de ajuda, que Helena descobriu o que queria ser. Observava as enfermeiras com admiração: como cuidavam dos pacientes com gentileza, como explicavam os procedimentos sem pressa, como seguravam a mão de quem tinha medo. Uma enfermeira chamada Marlene notou a jovem Helena sempre por perto e perguntou: "Quer aprender a medir a pressão?" Helena aprendeu naquele dia, e nunca mais parou. Voltou do hospital com uma certeza inabalável. Quando disse para o pai que queria ser enfermeira, Seu Geraldo a abraçou e disse com a voz embargada: "Filha, você vai cuidar do mundo."',
                },
                {
                    title: 'A Formatura Que Emocionou Todos',
                    description: 'A formatura da faculdade de enfermagem foi o dia mais bonito da família. Dona Tereza costurou um vestido especial para a ocasião — azul-marinho com rendas, o mais bonito que já fez. Seu Geraldo tirou folga do trabalho pela primeira vez em anos. Quando Helena subiu ao palco para receber o diploma, a família inteira — irmãos, tios, primos, a avó Isaura de cadeira de rodas — levantou e aplaudiu. Helena procurou os olhos da mãe na plateia e viu Dona Tereza chorando com o rosto iluminado de orgulho. Naquele momento, Helena entendeu que aquele diploma não era só dela — era de cada noite que a mãe passou costurando até tarde, de cada sacrifício do pai no trânsito de São Paulo, de cada história que ela contou pros irmãos naquele apartamento apertado da Vila Mariana.',
                },
                {
                    title: 'O Primeiro Plantão',
                    description: 'O primeiro plantão de Helena no Hospital das Clínicas foi de 12 horas — das sete da noite às sete da manhã. Ela estava nervosa, com as mãos tremendo e o coração acelerado. Mas bastou o primeiro paciente chamar "enfermeira!" com voz fraca para todo o nervosismo desaparecer. Helena correu, verificou os sinais vitais, ajustou o soro, acomodou o travesseiro e disse: "Pode ficar tranquilo, estou aqui." Era como se tivesse nascido para aquilo. Ao longo da noite, atendeu dezenas de pacientes, consolou famílias, auxiliou médicos em procedimentos. Quando o sol nasceu e seu turno terminou, Helena saiu do hospital exausta mas radiante. No ônibus de volta pra casa, adormeceu com um sorriso no rosto — o sorriso de quem encontrou seu lugar no mundo.',
                },
                {
                    title: 'O Encontro na Livraria',
                    description: 'Helena conheceu Roberto numa tarde de sábado na livraria do Conjunto Nacional, na Avenida Paulista. Ela procurava um livro sobre pediatria; ele, um romance de Gabriel García Márquez. Os dois esticaram a mão para o mesmo livro na prateleira — "Cem Anos de Solidão" — e se olharam. Roberto era professor de literatura, tinha olhos castanhos e um sorriso tímido que Helena achou encantador. Conversaram por horas tomando café na livraria. Ele citava Drummond e Clarice; ela contava histórias de pacientes com tanta emoção que Roberto ouvia de boca aberta. Quando a livraria fechou, trocaram telefones e se despediram com um aperto de mão que durou um segundo a mais que o necessário. Roberto ligou no dia seguinte. E no outro. E nunca mais parou de ligar.',
                },
                {
                    title: 'O Casamento Simples e Perfeito',
                    description: 'Helena e Roberto casaram num sábado de manhã, numa cerimônia simples no jardim da casa dos pais de Helena na Vila Mariana. Dona Tereza decorou o quintal com margaridas e velas. Helena estava linda no vestido branco que a mãe costurou com as próprias mãos — o mesmo carinho de sempre, só que desta vez cada ponto era bordado com lágrimas de alegria. Roberto, que era bom com palavras nos livros, ficou completamente mudo quando viu Helena. Os votos foram escritos por eles mesmos: Helena prometeu cuidar dele como cuida dos seus pacientes — "com toda a gentileza do mundo"; Roberto prometeu ler pra ela todas as noites — "até que você durma sorrindo". E assim fizeram, por todos os anos que se seguiram.',
                },
                {
                    title: 'A Chegada da Beatriz',
                    description: 'Beatriz nasceu num domingo de manhã, com o sol entrando pela janela do quarto do hospital. Helena, que havia ajudado centenas de mães a dar à luz ao longo da carreira, sentiu-se completamente perdida quando segurou a própria filha pela primeira vez. As mãos que colocavam soro com precisão milimétrica tremiam ao tocar aquele rostinho minúsculo. Roberto filmava tudo, chorando tanto que a câmera tremia. Quando Beatriz abriu os olhos e olhou para a mãe, Helena sentiu algo que nenhum livro de enfermagem poderia ensinar: o amor que não precisa de explicação, que nasce pronto e inteiro. "Minha princesa", sussurrou Helena, "você é a melhor história que eu já contei." E daquele dia em diante, cada história de Helena começava e terminava com Beatriz.',
                },
                {
                    title: 'A Festa de Aposentadoria',
                    description: 'Depois de 35 anos de enfermagem, Helena se aposentou do Hospital das Clínicas numa cerimônia que reuniu colegas de todas as épocas. A diretora fez um discurso lembrando que Helena era a enfermeira que nunca recusava um plantão extra, que sempre tinha uma palavra gentil para cada paciente, que ensinou gerações de enfermeiras novatas. Mas o momento mais emocionante veio quando Dona Marlene — aquela mesma enfermeira que ensinou Helena a medir pressão quando tinha quatorze anos, agora com oitenta e poucos — entrou de surpresa no auditório. As duas se abraçaram por um longo momento. "Eu sabia que você ia longe, garota", disse Marlene, "mas você foi muito mais longe do que eu imaginava." Helena chorou. E todos choraram com ela.',
                },
                {
                    title: 'O Jardim e as Tardes com Beatriz',
                    description: 'Na aposentadoria, Helena descobriu a jardinagem — ou, como ela diz, "outro tipo de cuidado". No quintal da casa que comprou com Roberto, plantou roseiras, lavandas, um pé de jabuticaba e ervas aromáticas que perfumam a cozinha inteira. Todas as tardes de sábado, Beatriz vem visitar e as duas passam horas no jardim: podando, regando, plantando. Entre uma planta e outra, Helena conta histórias — as mesmas que inventava para os irmãos, agora contadas para a filha e, às vezes, para os vizinhos que espiam pelo muro. Roberto assiste da varanda com um livro no colo, sorrindo. "Você cuida das plantas como cuidava dos pacientes", observa ele. Helena sorri e responde: "Cuido de tudo com amor, Roberto. É a única forma que eu conheço."',
                },
            ],
        },
        en: {
            bookTitle: 'My Mom, My Hero',
            bookSubtitle: 'With love, from your daughter Beatriz',
            displayDate: 'May 12, 2026',
            displayDescription: "An anime-style memory book created by a daughter for her nurse mother — a story of dedication, love, and care.",
            backCoverText: "Mom, you taught me that caring for others is the purest form of love. Every bandage you placed, every hand you held, every night you stayed awake — all of that showed me what true strength means. This book is my way of caring for you, just as you always cared for all of us. With all the love in the world, Beatriz.",
            pages: [
                { title: 'The Girl from Apartment 302', description: "Mom Helena grew up in a small apartment in Vila Mariana, São Paulo, on the third floor of an old exposed-brick building. Apartment 302 was cramped — two bedrooms for five people — but full of life. From the bedroom window she shared with her sister Lúcia, she could see the treetops of the square and dream for hours." },
                { title: 'The Storyteller', description: "Every night before bed, Helena invented stories for her siblings. She'd sit on the bed with a flashlight under the blankets and create entire worlds: princesses who were doctors, dragons afraid of needles, kingdoms where nobody got sick. Her siblings listened mesmerized, always begging 'one more, one more!'" },
                { title: 'The Dream Born in the Hospital', description: "At fourteen, Helena spent a week at the hospital accompanying her grandmother Isaura, who had broken her femur. It was there, in those white corridors full of people needing help, that Helena discovered what she wanted to be." },
                { title: 'The Graduation That Moved Everyone', description: "The nursing school graduation was the most beautiful day for the family. When Helena walked onto the stage to receive her diploma, the entire family — siblings, uncles, cousins, grandmother Isaura in a wheelchair — stood and applauded." },
                { title: 'The First Night Shift', description: "Helena's first shift at Hospital das Clínicas was 12 hours — from seven in the evening to seven in the morning. She was nervous, with trembling hands and a racing heart. But all it took was the first patient calling 'nurse!' in a weak voice for all the nervousness to disappear." },
                { title: 'The Meeting at the Bookstore', description: "Helena met Roberto on a Saturday afternoon at the bookstore on Paulista Avenue. She was looking for a pediatrics book; he, a Gabriel García Márquez novel. They both reached for the same book on the shelf — 'One Hundred Years of Solitude' — and their eyes met." },
                { title: 'The Simple and Perfect Wedding', description: "Helena and Roberto married on a Saturday morning in a simple ceremony in the garden of Helena's parents' house. Helena was beautiful in the white dress her mother sewed with her own hands." },
                { title: "Beatriz's Arrival", description: "Beatriz was born on a Sunday morning with sunlight streaming through the hospital room window. Helena, who had helped hundreds of mothers give birth throughout her career, felt completely lost when she held her own daughter for the first time." },
                { title: 'The Retirement Celebration', description: "After 35 years of nursing, Helena retired from Hospital das Clínicas in a ceremony that brought together colleagues from every era. The most emotional moment came when Dona Marlene — the same nurse who taught Helena to take blood pressure at fourteen — walked in by surprise." },
                { title: 'The Garden and Afternoons with Beatriz', description: "In retirement, Helena discovered gardening — or, as she puts it, 'another kind of caring.' Every Saturday afternoon, Beatriz visits and the two spend hours in the garden: pruning, watering, planting." },
            ],
        },
    },
};

// ════════════════════════════════════════════════════════════
// BOOK 3 — Coloring · Vovô Antônio (farmer, Goiás)
// ════════════════════════════════════════════════════════════
const COLORING_AVO: SampleBookConfig = {
    id: 'coloring-avo',
    style: 'coloring',
    styleBadge: { pt: 'Colorir', en: 'Coloring' },
    character: 'Antônio, fazendeiro de Goiás',
    texts: {
        pt: {
            bookTitle: 'O Livro do Vovô Antônio',
            bookSubtitle: 'Feito com carinho pela neta Luísa',
            displayDate: '20 de Janeiro, 2026',
            displayDescription: 'Um livro de memórias em estilo para colorir criado por uma neta para seu avô fazendeiro — perfeito para colorir junto com a família.',
            backCoverText: 'Vovô, o senhor me ensinou que a terra é generosa com quem a trata com respeito. Que a paciência é a maior virtude de um plantador. Que as melhores colheitas da vida não são as que a gente vende, mas as que a gente compartilha. Este livro é uma semente que planto em sua homenagem — para que sua história floresça para sempre. Com todo o amor da sua neta, Luísa.',
            pages: [
                {
                    title: 'A Fazenda das Mangueiras',
                    description: 'Vovô Antônio nasceu e cresceu na Fazenda das Mangueiras, uma propriedade de terra vermelha no interior de Goiás que pertencia à família havia três gerações. A casa era grande e simples, de adobe e telha de barro, com uma varanda comprida onde a família inteira cabia nas tardes de domingo. O quintal era um mundo: tinha um curral com vacas que o pequeno Antônio conhecia pelo nome, um galinheiro barulhento, três cachorros vira-lata que o seguiam pra todo lado, e um pomar com mangueiras tão altas que pareciam tocar o céu. Todas as manhãs, antes de ir pra escola na cidade vizinha, Antônio ajudava o pai a alimentar os animais. O cheiro do capim fresco, o mugido das vacas, o canto do galo — esses sons foram a trilha sonora da infância mais feliz que alguém poderia ter.',
                },
                {
                    title: 'Cavalgando com o Pai',
                    description: 'O pai de Antônio, Seu Joaquim, era um homem de poucas palavras mas muita sabedoria. Todas as tardes de sábado, ele selava dois cavalos — o Trovão, grande e forte, e a Estrelinha, pequena e mansa — e levava o filho para cavalgar pelos campos. Juntos, percorriam quilômetros de cerrado, passando por riachos de água cristalina, campos de flores amarelas e morros que pareciam pintados. Seu Joaquim mostrava tudo ao filho: onde a terra era boa pra plantar, onde o gado encontrava sombra no calor, onde os pássaros faziam ninho. "Presta atenção, menino", dizia ele apontando para o horizonte, "essa terra é a nossa história. Cada árvore que seu bisavô plantou tá aqui." Antônio ouvia em silêncio, absorvendo cada palavra, sentindo nos pés do cavalo o mesmo chão que sustentava sua família havia gerações.',
                },
                {
                    title: 'A Escola na Cidade e a Volta pro Campo',
                    description: 'Na adolescência, Antônio ia de bicicleta todos os dias até a escola na cidade, pedalando doze quilômetros de estrada de terra. Chegava com os sapatos empoeirados e os cadernos amassados, mas sempre com um sorriso. Os colegas da cidade achavam graça do menino do campo, mas Antônio não se importava. Sabia coisas que eles nunca saberiam: plantar feijão olhando a lua, prever chuva pelo vento, domar um cavalo arredio com calma e carinho. Depois da aula, pedalava de volta correndo porque sabia que as vacas precisavam ser ordenhadas. Seu Joaquim esperava na porteira com orgulho silencioso, vendo o filho crescer forte e trabalhador. "Estudo é bom", dizia ele, "mas a terra ensina o que livro nenhum consegue."',
                },
                {
                    title: 'O Baile na Cidade',
                    description: 'Foi no baile da padroeira de Goiás que Antônio viu Maria pela primeira vez. Ela usava um vestido florido e dançava com uma graça que parecia desafiar a gravidade. Antônio, com seu melhor chapéu e a camisa xadrez que a mãe passou a ferro com todo o cuidado, ficou parado no canto da quadra, sem coragem de se aproximar. Foi Maria quem veio até ele. "Moço, tá esperando convite pra dançar?", disse ela com um sorriso atrevido. Antônio, vermelho como um tomate maduro, gaguejou algo incompreensível e estendeu a mão. Dançaram a noite toda — sertanejo, forró, até uma valsa desajeitada que fez todo mundo rir. Quando a festa acabou, Antônio a acompanhou até a casa dela e prometeu voltar no dia seguinte. Voltou no dia seguinte, e no outro, e no outro. Sessenta anos depois, ainda não parou de voltar.',
                },
                {
                    title: 'Construindo a Casa com as Próprias Mãos',
                    description: 'Quando Antônio e Maria se casaram, Seu Joaquim deu ao filho um pedaço de terra na Fazenda das Mangueiras para que construísse sua própria casa. Antônio não tinha dinheiro para contratar pedreiros, então fez tudo com as próprias mãos — com a ajuda dos irmãos, dos primos e de Maria, que carregava tijolos com a mesma determinação que usava pra tudo na vida. Levaram seis meses. A casa era simples mas sólida: paredes de alvenaria, piso de cimento queimado, uma cozinha ampla com fogão a lenha e uma varanda virada pro pôr do sol. No dia em que terminaram, Antônio pegou Maria no colo e atravessou a porta da frente, como tinha visto num filme. Maria riu tanto que quase caíram os dois. Aquela casa, construída com suor, amor e tijolos, ficou de pé por mais de cinquenta anos.',
                },
                {
                    title: 'A Grande Colheita',
                    description: 'O primeiro ano de plantação própria de Antônio foi de puro aprendizado — errou mais do que acertou, perdeu metade do milho pra praga e o feijão quase todo pra seca. Mas no segundo ano, com as lições aprendidas e as rezas de Maria, veio a grande colheita. O milho cresceu alto e dourado, os grãos de soja enchiam os sacos, e o pasto estava tão verde que as vacas pareciam mais felizes que nunca. Antônio se levantava antes do sol e trabalhava até escurecer, sentindo em cada grão colhido o peso de uma conquista. Quando vendeu a primeira safra no mercado da cidade, voltou pra casa com dinheiro suficiente para comprar uma geladeira nova para Maria — a primeira da casa. Maria chorou de alegria, Antônio chorou de orgulho, e os dois jantaram naquela noite sob as estrelas, comemorando em silêncio a vida que estavam construindo juntos.',
                },
                {
                    title: 'Os Filhos e a Terra',
                    description: 'Antônio e Maria tiveram quatro filhos — José, Ana, Pedro e Marcos — e todos cresceram correndo descalços pelos campos da fazenda, assim como o pai tinha feito. Antônio fazia questão de ensinar cada um: levava José para arar a terra, Ana para cuidar dos animais, Pedro para plantar e Marcos para colher. "A fazenda é de todos", repetia ele, "e todos precisam saber cuidar dela." Nas noites quentes de verão, a família sentava na varanda e Antônio contava as histórias que seu pai contava pra ele — do bisavô que desbravou aquela terra, das secas que quase acabaram com tudo, das colheitas que salvaram a família. Os filhos ouviam com os olhos arregalados, e Antônio via neles a mesma curiosidade que ele tinha quando cavalgava com Seu Joaquim. O ciclo da vida continuava, forte e bonito como o cerrado.',
                },
                {
                    title: 'O Almoço de Domingo',
                    description: 'O almoço de domingo na Fazenda das Mangueiras era sagrado. Maria acordava cedo pra preparar o arroz, o feijão tropeiro, a galinha caipira, o angu e a couve refogada com alho. A mesa era posta na varanda, com a toalha de crochê que a avó de Maria fez, e cabiam todos: filhos, noras, genros, netos e quem mais aparecesse. Antônio sentava na cabeceira, com o chapéu pendurado no encosto da cadeira, e só começava a comer depois que todos estivessem servidos. A conversa era alta, as risadas eram muitas, e sempre tinha alguém que repetia o prato três vezes. Depois do almoço, os homens jogavam dominó debaixo da mangueira enquanto as mulheres conversavam na cozinha e as crianças brincavam no pasto. Era simples. Era perfeito. Era tudo que Antônio sempre quis da vida.',
                },
                {
                    title: 'A Viola na Varanda',
                    description: 'Quando o sol começa a se pôr e o céu de Goiás fica laranja e roxo, Antônio pega sua viola caipira — a mesma que ganhou do pai aos dezoito anos — e senta na cadeira de balanço na varanda. Dedilha devagar, tocando modas de viola que aprendeu com Seu Joaquim, canções que falam de saudade, de amor, de terra e de chuva. Maria senta ao lado, com o crochê no colo, e às vezes canta junto, baixinho, com aquela voz doce que encantou Antônio no primeiro baile. Os cachorros deitam aos pés do velho, as galinhas se recolhem, e o mundo parece fazer silêncio para ouvir. Antônio fecha os olhos e sorri. Naquele momento, com a viola nos braços e Maria ao lado, ele tem tudo. Absolutamente tudo.',
                },
                {
                    title: 'Os Netos na Fazenda',
                    description: 'Quando os netos chegam na fazenda, é como se a casa inteira acordasse de um sono tranquilo. Luísa, a mais velha, corre direto pro curral pra ver as vacas; Pedrinho vai pro pomar atrás das mangas maduras; a pequena Sofia quer ficar no colo do avô o tempo todo. Antônio leva todos pra passear a cavalo — devagar, com cuidado, segurando as rédeas com aquelas mãos fortes e gentis ao mesmo tempo. Ensina os nomes dos pássaros, mostra onde o riacho nasce, conta a história de cada árvore como se fosse uma pessoa da família. "Vovô, a fazenda é mágica!", disse Luísa uma vez. Antônio olhou ao redor — o pasto verde, o céu azul, os netos correndo — e concordou em silêncio. Era mesmo. Sempre foi.',
                },
            ],
        },
        en: {
            bookTitle: "Grandpa Antônio's Book",
            bookSubtitle: 'Made with love by granddaughter Luísa',
            displayDate: 'January 20, 2026',
            displayDescription: "A coloring-style memory book created by a granddaughter for her farmer grandfather — perfect for coloring together with the family.",
            backCoverText: "Grandpa, you taught me that the land is generous with those who treat it with respect. That patience is a planter's greatest virtue. That life's best harvests are not the ones we sell, but the ones we share. This book is a seed I plant in your honor — so your story may bloom forever. With all the love from your granddaughter, Luísa.",
            pages: [
                { title: 'The Mangueiras Farm', description: "Grandpa Antônio was born and raised at Mangueiras Farm, a red-earth property in the interior of Goiás that had belonged to the family for three generations. The house was large and simple, with a long veranda where the entire family could gather on Sunday afternoons." },
                { title: 'Riding with Father', description: "Antônio's father, Seu Joaquim, was a man of few words but great wisdom. Every Saturday afternoon, he would saddle two horses and take his son riding through the fields. Together they'd cover kilometers of cerrado, passing crystal-clear streams and yellow wildflower fields." },
                { title: 'School in Town and Back to the Fields', description: "As a teenager, Antônio rode his bicycle twelve kilometers on dirt roads to school in town every day. Classmates from the city found the country boy amusing, but Antônio didn't care. He knew things they never would." },
                { title: 'The Town Dance', description: "It was at the patron saint festival dance that Antônio first saw Maria. She wore a flowered dress and danced with a grace that seemed to defy gravity. Antônio stood frozen in the corner until Maria came to him: 'Are you waiting for an invitation to dance?'" },
                { title: 'Building the House with His Own Hands', description: "When they married, Seu Joaquim gave his son a piece of land at the farm to build his own house. Antônio had no money for builders, so he did everything himself — with help from brothers, cousins, and Maria, who carried bricks with the same determination she used for everything." },
                { title: 'The Great Harvest', description: "Antônio's first year of farming was pure learning — more mistakes than successes. But in the second year, the great harvest came. The corn grew tall and golden, soybean sacks overflowed, and the pasture was so green the cows seemed happier than ever." },
                { title: 'The Children and the Land', description: "Antônio and Maria had four children — José, Ana, Pedro, and Marcos — all of whom grew up running barefoot through the farm fields. Antônio made sure to teach each one: 'The farm belongs to everyone, and everyone needs to know how to care for it.'" },
                { title: 'Sunday Lunch', description: "Sunday lunch at Mangueiras Farm was sacred. Maria would wake early to prepare rice, tropeiro beans, free-range chicken, angu, and sautéed greens. The table was set on the veranda with a crocheted tablecloth, and everyone fit." },
                { title: 'The Guitar on the Veranda', description: "When the sun begins to set and the Goiás sky turns orange and purple, Antônio picks up his viola caipira — the same one his father gave him at eighteen — and sits in the rocking chair on the veranda." },
                { title: 'The Grandchildren at the Farm', description: "When the grandchildren arrive at the farm, it's as if the whole house wakes from a peaceful sleep. Luísa runs straight to see the cows; Pedrinho heads to the orchard for ripe mangoes; little Sofia wants to stay in Grandpa's lap the whole time." },
            ],
        },
    },
};

// ════════════════════════════════════════════════════════════
// BOOK 4 — Watercolor · Tia Rosa (baker, Minas Gerais)
// ════════════════════════════════════════════════════════════
const WATERCOLOR_TIA: SampleBookConfig = {
    id: 'watercolor-tia',
    style: 'watercolor',
    styleBadge: { pt: 'Aquarela', en: 'Watercolor' },
    character: 'Rosa, padeira de Minas Gerais',
    texts: {
        pt: {
            bookTitle: 'As Receitas e Histórias da Tia Rosa',
            bookSubtitle: 'Um presente da sobrinha Carolina',
            displayDate: '5 de Abril, 2026',
            displayDescription: 'Um livro de memórias em aquarela criado por uma sobrinha para sua tia padeira — uma história de sabores, tradições e amor.',
            backCoverText: 'Tia Rosa, cada pão que a senhora assa carrega um pedaço da sua alma. Cada receita que me ensinou é uma carta de amor escrita com farinha e açúcar. A senhora não é só padeira — é a guardiã dos sabores que conectam nossa família através das gerações. Este livro é minha forma de dizer: obrigada por alimentar não só nossos corpos, mas também nossos corações. Com amor e gratidão, Carolina.',
            pages: [
                {
                    title: 'A Cozinha da Vó Carmela',
                    description: 'Tia Rosa aprendeu a arte de cozinhar na cozinha da avó Carmela, em Ouro Preto. Era uma cozinha antiga, com fogão a lenha, panelas de ferro penduradas na parede e um cheiro permanente de canela e cravo. Aos quatro anos, Rosa já ficava em pé num banquinho de madeira ao lado da avó, observando cada movimento com olhos arregalados. Vó Carmela tinha mãos mágicas: transformava farinha, ovos e açúcar em verdadeiras obras de arte. "O segredo, minha filha", dizia ela enquanto sovava a massa do pão, "não é a receita. É o amor que você coloca em cada gesto." Rosa gravou essa frase no coração. Décadas depois, quando alguém elogia seus quitutes, ela repete as mesmas palavras da avó, com o mesmo sorriso carinhoso, com as mesmas mãos cobertas de farinha.',
                },
                {
                    title: 'O Primeiro Bolo aos Oito Anos',
                    description: 'O primeiro bolo que Rosa fez sozinha foi um bolo de fubá — a receita mais simples do caderno da avó Carmela. Tinha oito anos, era uma quarta-feira de chuva, e a mãe estava ocupada costurando. Rosa juntou os ingredientes com cuidado, medindo tudo com o copinho de alumínio que a avó usava. Misturou, mexeu, despejou na forma untada e colocou no forno com a solenidade de quem faz algo sagrado. Quando o bolo ficou pronto — dourado, perfumado, com a crosta levemente crocante — Rosa cortou um pedaço enorme e levou para a mãe. Dona Aparecida mordeu, fechou os olhos, e quando abriu, tinha lágrimas no rosto. "Filha, esse bolo tem gosto da sua avó." Naquele momento, Rosa entendeu que cozinhar era muito mais do que alimentar — era manter vivas as pessoas que a gente ama.',
                },
                {
                    title: 'A Rainha dos Lanches da Escola',
                    description: 'Na escola, Rosa era famosa por uma coisa: os lanches que trazia de casa. Enquanto os outros alunos comiam biscoitos industrializados, Rosa abria sua lancheira e tirava broas de milho, pães de queijo ainda morninhos, biscoitinhos de nata enrolados em guardanapo de pano. O recreio inteiro se aglomerava ao redor dela. "Rosa, me dá um pedacinho?", era o que mais ouvia. Ela distribuía tudo com generosidade, sorrindo de orelha a orelha. Os professores também não escapavam — Dona Elisa, de matemática, sempre aparecia discretamente perto de Rosa na hora do lanche com um sorriso esperançoso. Foi na escola que Rosa teve a primeira ideia de abrir uma padaria. "Se todo mundo gosta tanto assim", pensou ela ajeitando os óculos de garrafas, "imagine quando eu puder fazer isso todo dia?"',
                },
                {
                    title: 'Juntando Moedas Para o Sonho',
                    description: 'Na adolescência, Rosa começou a vender doces para juntar dinheiro. Primeiro foram brigadeiros e beijinhos para festas de aniversário do bairro. Depois vieram as encomendas de bolo: casamentos, batizados, formaturas. Rosa cozinhava de madrugada, antes de ir pra escola, e à tarde entregava os pedidos de bicicleta pela cidade. Cada moeda ia para o pote de vidro que guardava debaixo da cama, com uma etiqueta escrita em letra caprichada: "Padaria da Rosa". Sua mãe, Dona Aparecida, ajudava com os ingredientes quando o dinheiro era curto. Seu pai, Seu Manoel, construiu uma prateleira no quarto dela só para guardar as formas e os utensílios que ia juntando. Toda a família torcia pelo sonho de Rosa. E Rosa torcia por si mesma, um doce por vez.',
                },
                {
                    title: 'A Inauguração da Padaria da Rosa',
                    description: 'Aos vinte e cinco anos, com as economias de uma década de trabalho e um empréstimo do tio Geraldo, Rosa finalmente abriu a Padaria da Rosa na praça principal de São João del-Rei. Era um espaço pequeno, com balcão de madeira, três mesinhas e uma vitrine que ela mesma pintou de amarelo. No dia da inauguração, Rosa acordou às três da manhã para assar pães frescos — pão francês, pão de queijo, broa de fubá, rosca de canela. Quando abriu a porta às seis, já tinha fila. O cheiro que saía daquela padaria era como um abraço — quente, acolhedor, irresistível. Dona Carmela, de cadeira de rodas, estava sentada na primeira mesa, com os olhos brilhando. Rosa serviu o primeiro café com bolo para a avó e disse: "Esse sonho é nosso, vó." Carmela sorriu e respondeu: "Eu sei, minha filha. Eu sempre soube."',
                },
                {
                    title: 'O Pão de Queijo Que Uniu a Cidade',
                    description: 'O pão de queijo da Tia Rosa se tornou lendário em São João del-Rei. Era feito com queijo da Serra da Canastra, polvilho azedo de produção artesanal e uma pitada de algo que ninguém conseguia identificar — o que Rosa chamava de "o tempero secreto da vó Carmela". Saia do forno às sete da manhã, às onze e às quatro da tarde, e nunca sobrava. Pessoas vinham de cidades vizinhas só pra provar. O prefeito fazia questão de tomar café ali toda segunda-feira. O padre da matriz encomendava para as festas da igreja. Mas o que Rosa mais gostava era ver as famílias sentadas nas mesinhas da padaria, conversando, rindo, compartilhando fatias de bolo — exatamente como a avó Carmela fazia na cozinha de Ouro Preto. A padaria não era apenas um negócio. Era um lugar de encontro, de afeto, de pertencimento.',
                },
                {
                    title: 'As Aulas de Culinária Para as Crianças',
                    description: 'Todas as quartas-feiras à tarde, Rosa fechava a padaria mais cedo e abria as portas para as crianças do bairro. Colocava aventais minúsculos nos pequenos, distribuía colheres de pau e tigelas, e ensinava receitas simples: biscoitos de manteiga, bolo de cenoura, sequilhos de maizena. A cozinha virava um caos adorável — farinha pelo chão, ovos quebrados, massas que grudavam em tudo — mas Rosa nunca perdia a paciência. "Cozinhar é errar e tentar de novo", dizia ela limpando o nariz de um menino coberto de chocolate. As crianças a adoravam. Os pais agradeciam. E Rosa sentia que estava passando adiante o que Vó Carmela passou pra ela: não apenas receitas, mas a crença de que as melhores coisas da vida são feitas com as mãos e compartilhadas com o coração.',
                },
                {
                    title: 'O Natal na Padaria',
                    description: 'O Natal era a época mais mágica da Padaria da Rosa. Semanas antes, ela começava os preparativos: panetones de frutas cristalizadas, rabanadas douradas, cookies de gengibre, biscoitos decorados que pareciam pequenas obras de arte. A padaria ficava enfeitada com luzes, guirlandas e um presépio de cerâmica que pertencia à família havia gerações. Na véspera de Natal, Rosa fazia uma tradição especial: abria a padaria de graça para quem não tinha condições de comprar. Assava centenas de pães, preparava chocolate quente em panelas enormes, e recebia cada pessoa com um abraço e um sorriso. "Ninguém fica sem pão no Natal", era a regra dela. A fila dobrava a esquina, mas Rosa não se importava. Ficava ali até o último pão ser entregue, até o último copo de chocolate ser servido, até o último abraço ser dado.',
                },
                {
                    title: 'O Jardim de Ervas da Tia Rosa',
                    description: 'Nos fundos da padaria, Rosa cultivou ao longo dos anos um jardim de ervas e temperos que era seu refúgio pessoal. Tinha manjericão, alecrim, hortelã, sálvia, tomilho, cebolinha e um pé de louro que cresceu tanto que dava sombra pra metade do quintal. Todas as manhãs, antes de ligar o forno, Rosa passava pelo jardim colhendo ervas frescas para as receitas do dia. Dizia que conversar com as plantas era tão importante quanto regá-las: "Bom dia, seu alecrim. Hoje você vai pro pão." Os vizinhos riam, mas os pães tinham um sabor que nenhuma outra padaria conseguia reproduzir. Nos fins de tarde, quando a padaria fechava, Rosa sentava num banquinho no jardim com um café na mão e ficava ali, em paz, ouvindo os pássaros e sentindo o perfume das ervas. Era seu momento de recarregar a alma para mais um dia de amor feito farinha.',
                },
                {
                    title: 'Passando as Receitas Adiante',
                    description: 'Quando as sobrinhas Carolina e Mariana começaram a crescer, Rosa fez questão de ensiná-las tudo o que sabia. Aos domingos, as meninas vinham cedo para a padaria e passavam o dia inteiro com a tia. Rosa ensinava com a mesma paciência de Vó Carmela: "Mexe devagar, minha filha. A massa precisa de carinho, não de pressa." Carolina herdou o talento — seus bolos eram quase tão bons quanto os da tia. Mariana era melhor com os pães e biscoitos. Juntas, as três cozinhavam, riam, e às vezes choravam quando uma receita trazia memórias da avó Carmela. Rosa havia copiado todas as receitas da avó num caderno de capa dura que mantinha trancado a chave. Um dia, abriu o caderno na primeira página e leu em voz alta para as sobrinhas: "Cozinhe sempre com amor — é o único ingrediente que não acaba." Naquele momento, as três entenderam que aquelas receitas eram muito mais que instruções. Eram a história de uma família contada em sabores.',
                },
            ],
        },
        en: {
            bookTitle: "Aunt Rosa's Recipes & Stories",
            bookSubtitle: 'A gift from niece Carolina',
            displayDate: 'April 5, 2026',
            displayDescription: "A watercolor memory book created by a niece for her baker aunt — a story of flavors, traditions, and love.",
            backCoverText: "Aunt Rosa, every bread you bake carries a piece of your soul. Every recipe you taught me is a love letter written with flour and sugar. You're not just a baker — you're the guardian of the flavors that connect our family across generations. This book is my way of saying: thank you for nourishing not just our bodies, but our hearts. With love and gratitude, Carolina.",
            pages: [
                { title: "Grandma Carmela's Kitchen", description: "Aunt Rosa learned the art of cooking in Grandma Carmela's kitchen in Ouro Preto. It was an old kitchen with a wood-burning stove, cast-iron pans hanging on the wall, and a permanent scent of cinnamon and cloves. At four years old, Rosa was already standing on a wooden stool beside her grandmother, watching every movement with wide eyes." },
                { title: 'The First Cake at Eight Years Old', description: "The first cake Rosa made by herself was a cornmeal cake — the simplest recipe in Grandma Carmela's notebook. She was eight years old, it was a rainy Wednesday, and her mother was busy sewing. Rosa gathered the ingredients carefully, measuring everything with the little aluminum cup her grandmother used." },
                { title: 'The Snack Queen of School', description: "At school, Rosa was famous for one thing: the snacks she brought from home. While other students ate store-bought cookies, Rosa opened her lunchbox to reveal corn cakes, cheese bread still warm, cream biscuits wrapped in cloth napkins. The entire recess crowd would gather around her." },
                { title: 'Saving Coins for the Dream', description: "As a teenager, Rosa began selling sweets to save money. First came brigadeiros and beijinhos for neighborhood birthday parties. Then came cake orders: weddings, baptisms, graduations. Every coin went into the glass jar she kept under her bed, labeled in careful handwriting: 'Rosa's Bakery.'" },
                { title: "The Grand Opening of Rosa's Bakery", description: "At twenty-five, with a decade's savings and a loan from Uncle Geraldo, Rosa finally opened Rosa's Bakery on the main square of São João del-Rei. On opening day, she woke at three in the morning to bake fresh bread. When she opened the doors at six, there was already a line." },
                { title: 'The Cheese Bread That United the Town', description: "Aunt Rosa's cheese bread became legendary in São João del-Rei. Made with Serra da Canastra cheese, artisanal sour tapioca starch, and a pinch of something nobody could identify — what Rosa called 'Grandma Carmela's secret seasoning.' It came out of the oven three times a day and never had leftovers." },
                { title: 'Cooking Classes for the Children', description: "Every Wednesday afternoon, Rosa closed the bakery early and opened its doors to the neighborhood children. She'd put tiny aprons on the kids, hand out wooden spoons and bowls, and teach simple recipes: butter cookies, carrot cake, cornstarch biscuits." },
                { title: 'Christmas at the Bakery', description: "Christmas was the most magical time at Rosa's Bakery. Weeks before, she'd begin preparations: fruit panettone, golden rabanadas, ginger cookies, decorated biscuits that looked like tiny works of art. On Christmas Eve, Rosa had a special tradition: she opened the bakery for free to those who couldn't afford to buy." },
                { title: "Aunt Rosa's Herb Garden", description: "Behind the bakery, Rosa cultivated over the years a herb and spice garden that was her personal refuge. Basil, rosemary, mint, sage, thyme, chives, and a bay laurel tree that grew so large it shaded half the yard." },
                { title: 'Passing Down the Recipes', description: "When nieces Carolina and Mariana began to grow, Rosa made sure to teach them everything she knew. Rosa taught with the same patience as Grandma Carmela: 'Stir slowly, dear. The dough needs love, not haste.' Together, the three would cook, laugh, and sometimes cry when a recipe brought back memories of Grandma Carmela." },
            ],
        },
    },
};

// ─── All additional sample books ────────────────────────────
export const ADDITIONAL_SAMPLE_BOOKS: SampleBookConfig[] = [
    CARTOON_PAI,
    ANIME_MAE,
    COLORING_AVO,
    WATERCOLOR_TIA,
];

// ─── Helper: get pages for an additional sample book ────────
export function getAdditionalBookPages(book: SampleBookConfig, lang: LanguageCode): BookPage[] {
    const texts = book.texts[lang as 'pt' | 'en'] || book.texts.pt;
    const pages: BookPage[] = [];

    // Cover
    pages.push({
        id: 'cover',
        imageUrl: storageUrl(book.id, 'cover.jpg'),
        title: texts.bookTitle,
        description: texts.bookSubtitle,
        date: PHASE_DATES[0],
    });

    // Content pages (1-10)
    for (let i = 0; i < 10; i++) {
        const pageData = texts.pages[i];
        pages.push({
            id: `page-${i + 1}`,
            imageUrl: storageUrl(book.id, `page-${String(i + 1).padStart(2, '0')}.jpg`),
            title: pageData?.title || `Page ${i + 1}`,
            description: pageData?.description || '',
            date: PHASE_DATES[i + 1],
        });
    }

    // Back cover
    pages.push({
        id: 'back-cover',
        imageUrl: storageUrl(book.id, 'back-cover.jpg'),
        title: lang === 'pt' ? 'Contracapa' : 'Back Cover',
        description: texts.backCoverText,
        date: PHASE_DATES[11],
    });

    return pages;
}

// ─── Helper: get display data for an additional sample book ──
export function getAdditionalBookDisplay(book: SampleBookConfig, lang: LanguageCode): SampleBookDisplay {
    const texts = book.texts[lang as 'pt' | 'en'] || book.texts.pt;
    return {
        id: book.id,
        title: texts.bookTitle,
        date: texts.displayDate,
        description: texts.displayDescription,
        imageUrl: storageUrl(book.id, 'cover.jpg'),
        pageImages: Array.from({ length: 12 }, (_, i) => {
            if (i === 0) return storageUrl(book.id, 'cover.jpg');
            if (i === 11) return storageUrl(book.id, 'back-cover.jpg');
            return storageUrl(book.id, `page-${String(i).padStart(2, '0')}.jpg`);
        }),
        isFavorite: true,
        pageCount: 12,
        status: 'completed',
        imageStyle: book.style,
        isSample: true,
    };
}
