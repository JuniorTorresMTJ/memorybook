import { useState } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { AuthModal } from '../components/ui/AuthModal';
import { InfoModal } from '../components/ui/InfoModal';
import { BookViewer } from '../components/book/BookViewer';
import { Play, MessageCircle, Palette, BookText, ShieldCheck, ArrowRight, Eye, BookOpen, Sparkles, Heart, Brain, Clock, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { FlipImage } from '../components/ui/FlipImage';
import heroMan from '../assets/hero-man.png';
import heroWoman from '../assets/hero-woman.png';
import { ADDITIONAL_SAMPLE_BOOKS, getAdditionalBookPages, getAdditionalBookDisplay } from '../data/sampleBooks';
import type { SampleBookConfig } from '../data/sampleBooks';

import { useLanguage } from '../contexts/LanguageContext';

// Animated gradient CSS for the "Memory Book Today" text + Liquid Glass Effect
const animatedGradientStyle = `
@keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}

@keyframes liquidShimmer {
    0% { transform: translateX(-100%) rotate(25deg); }
    100% { transform: translateX(200%) rotate(25deg); }
}

/* ── Liquid Glass Effect ────────────────────────────────── */
.liquid-glass {
    position: relative;
    background: linear-gradient(
        135deg,
        rgba(255,255,255,0.45) 0%,
        rgba(255,255,255,0.20) 40%,
        rgba(255,255,255,0.10) 60%,
        rgba(255,255,255,0.25) 100%
    );
    backdrop-filter: blur(24px) saturate(1.6);
    -webkit-backdrop-filter: blur(24px) saturate(1.6);
    border: 1px solid rgba(255,255,255,0.55);
    box-shadow:
        0 8px 32px rgba(0,0,0,0.06),
        inset 0 1px 0 rgba(255,255,255,0.6),
        inset 0 -1px 0 rgba(255,255,255,0.1);
    overflow: hidden;
}

.liquid-glass::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
        135deg,
        rgba(0,229,229,0.06) 0%,
        transparent 50%,
        rgba(255,158,145,0.04) 100%
    );
    pointer-events: none;
    z-index: 0;
}

.liquid-glass::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 50%;
    height: 200%;
    background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(255,255,255,0.08) 45%,
        rgba(255,255,255,0.15) 50%,
        rgba(255,255,255,0.08) 55%,
        transparent 100%
    );
    transform: rotate(25deg);
    animation: liquidShimmer 6s ease-in-out infinite;
    pointer-events: none;
    z-index: 1;
}

.liquid-glass > * {
    position: relative;
    z-index: 2;
}

/* Variant: stronger glass for hero/feature cards */
.liquid-glass-strong {
    position: relative;
    background: linear-gradient(
        135deg,
        rgba(255,255,255,0.55) 0%,
        rgba(255,255,255,0.30) 30%,
        rgba(255,255,255,0.15) 60%,
        rgba(255,255,255,0.35) 100%
    );
    backdrop-filter: blur(32px) saturate(1.8);
    -webkit-backdrop-filter: blur(32px) saturate(1.8);
    border: 1.5px solid rgba(255,255,255,0.6);
    box-shadow:
        0 12px 48px rgba(0,0,0,0.08),
        inset 0 2px 0 rgba(255,255,255,0.7),
        inset 0 -1px 0 rgba(255,255,255,0.15),
        0 0 0 0.5px rgba(255,255,255,0.3);
    overflow: hidden;
}

.liquid-glass-strong::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
        160deg,
        rgba(0,229,229,0.08) 0%,
        transparent 40%,
        rgba(255,158,145,0.06) 100%
    );
    pointer-events: none;
    z-index: 0;
}

.liquid-glass-strong::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 50%;
    height: 200%;
    background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(255,255,255,0.10) 45%,
        rgba(255,255,255,0.20) 50%,
        rgba(255,255,255,0.10) 55%,
        transparent 100%
    );
    transform: rotate(25deg);
    animation: liquidShimmer 5s ease-in-out infinite;
    pointer-events: none;
    z-index: 1;
}

.liquid-glass-strong > * {
    position: relative;
    z-index: 2;
}

/* Variant: subtle glass for smaller elements */
.liquid-glass-subtle {
    position: relative;
    background: linear-gradient(
        135deg,
        rgba(255,255,255,0.35) 0%,
        rgba(255,255,255,0.15) 50%,
        rgba(255,255,255,0.20) 100%
    );
    backdrop-filter: blur(16px) saturate(1.4);
    -webkit-backdrop-filter: blur(16px) saturate(1.4);
    border: 1px solid rgba(255,255,255,0.45);
    box-shadow:
        0 4px 16px rgba(0,0,0,0.04),
        inset 0 1px 0 rgba(255,255,255,0.5);
    overflow: hidden;
}

.liquid-glass-subtle > * {
    position: relative;
    z-index: 2;
}
`;

export const Home = () => {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isSampleViewerOpen, setIsSampleViewerOpen] = useState(false);
    const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
    const [selectedBookIdx, setSelectedBookIdx] = useState(0);
    const { t, language } = useLanguage();

    // 4 sample books (Firebase Storage)
    const allBooks = ADDITIONAL_SAMPLE_BOOKS.map((book: SampleBookConfig) => ({
        pages: getAdditionalBookPages(book, language),
        display: getAdditionalBookDisplay(book, language),
    }));

    const currentBook = allBooks[selectedBookIdx];
    const sampleBookPages = currentBook.pages;
    const sampleBookDisplay = currentBook.display;

    const hm = t.home;
    const hiw = t.howItWorks;
    const ps = t.privacySection;
    const ctaSec = t.cta;
    const prob = t.problemSection;

    // Stagger animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.1,
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 30, scale: 0.95 },
        visible: { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            transition: { duration: 0.5, ease: 'easeOut' }
        }
    };

    return (
        <div className="min-h-screen bg-bg-soft flex flex-col font-sans">
            {/* Inject animated gradient keyframes */}
            <style>{animatedGradientStyle}</style>

            <Navbar />

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-12 pb-20">

                {/* Hero Section */}
                <section className="flex flex-col md:flex-row items-center justify-between gap-12 py-16 md:py-24">
                    <div className="flex-1 space-y-8 max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <motion.span 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="text-accent-coral font-bold tracking-wider text-sm uppercase mb-4 flex items-center gap-2"
                            >
                                <Sparkles className="w-4 h-4" />
                                {t.hero.subtitle}
                            </motion.span>
                            <h1 className="text-5xl md:text-7xl font-bold text-text-main leading-[1.1] mb-6">
                                {t.hero.title_start} <br />
                                <span 
                                    className="bg-clip-text text-transparent"
                                    style={{
                                        backgroundImage: 'linear-gradient(90deg, #00E5E5, #FF9E91, #00E5E5)',
                                        backgroundSize: '200% 100%',
                                        animation: 'gradientShift 4s ease infinite',
                                    }}
                                >
                                    {t.hero.title_gradient}
                                </span>
                            </h1>
                            <p className="text-xl text-text-muted leading-relaxed max-w-lg mb-8">
                                {t.hero.description}
                            </p>

                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.5 }}
                                className="flex flex-col sm:flex-row items-start sm:items-center gap-6"
                            >
                                <Button
                                    variant="primary"
                                    className="shadow-soft hover:shadow-lg transform transition-all"
                                    onClick={() => setIsAuthModalOpen(true)}
                                >
                                    {t.hero.cta_primary}
                                </Button>
                                <button className="flex items-center gap-3 text-text-main font-semibold hover:text-primary-teal transition-colors group">
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                                        <Play className="w-4 h-4 text-primary-teal fill-current ml-0.5" />
                                    </div>
                                    {t.hero.cta_secondary}
                                </button>
                            </motion.div>
                        </motion.div>
                    </div>

                    <div className="flex-1 relative w-full flex justify-center md:justify-end">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="relative z-10 w-full max-w-lg"
                        >
                            <div className="liquid-glass-strong rounded-[40px] p-8 shadow-2xl relative">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-accent-coral/20 blur-[100px] rounded-full -z-10"></div>
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-teal/20 blur-[100px] rounded-full -z-10"></div>

                                <FlipImage
                                    images={[heroMan, heroWoman]}
                                    descriptions={[t.images.manReading, t.images.womanReading]}
                                    interval={6000}
                                />

                                <div className="mt-6 flex flex-col gap-3">
                                    <div className="h-4 bg-gray-200/50 rounded-full w-3/4"></div>
                                    <div className="h-4 bg-gray-200/50 rounded-full w-1/2"></div>
                                </div>
                            </div>
                        </motion.div>
                        {/* Decorative background blob */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-primary-teal/5 via-accent-coral/5 to-transparent blur-3xl -z-10 rounded-full"></div>
                    </div>
                </section>

                {/* Problem Section - Alzheimer/Dementia awareness */}
                <section className="py-20 -mx-4 md:-mx-12 px-4 md:px-12 relative overflow-hidden">
                    {/* Subtle background decoration */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent-coral/[0.03] to-transparent pointer-events-none" />
                    
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.7 }}
                        className="max-w-5xl mx-auto"
                    >
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="flex justify-center mb-8"
                        >
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-coral/10 text-accent-coral text-sm font-semibold">
                                <Brain className="w-4 h-4" />
                                {prob?.badge || 'Por que isso importa'}
                            </span>
                        </motion.div>

                        {/* Title */}
                        <h2 className="text-4xl md:text-5xl font-bold text-center text-text-main mb-6 leading-tight">
                            {prob?.title || 'A cada 3 segundos,'} <br />
                            <span 
                                className="bg-clip-text text-transparent"
                                style={{
                                    backgroundImage: 'linear-gradient(90deg, #FF8A7A, #FF6B6B, #FF8A7A)',
                                    backgroundSize: '200% 100%',
                                    animation: 'gradientShift 4s ease infinite',
                                }}
                            >
                                {prob?.titleHighlight || 'alguém perde uma memória'}
                            </span>
                        </h2>

                        {/* Description */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-lg text-text-muted text-center max-w-3xl mx-auto mb-12 leading-relaxed"
                        >
                            {prob?.description || 'Mais de 55 milhões de pessoas no mundo vivem com Alzheimer ou demência. À medida que a doença avança, memórias preciosas de uma vida inteira começam a desaparecer.'}
                        </motion.p>

                        {/* Stats */}
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-50px" }}
                            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
                        >
                            {[
                                {
                                    icon: Users,
                                    number: prob?.stat1Number || '55M+',
                                    label: prob?.stat1Label || 'pessoas vivem com demência no mundo',
                                    color: 'from-accent-coral to-rose-500',
                                    bgColor: 'bg-accent-coral/10',
                                    iconColor: 'text-accent-coral',
                                },
                                {
                                    icon: Clock,
                                    number: prob?.stat2Number || '10M',
                                    label: prob?.stat2Label || 'novos casos a cada ano',
                                    color: 'from-amber-500 to-orange-500',
                                    bgColor: 'bg-amber-100',
                                    iconColor: 'text-amber-500',
                                },
                                {
                                    icon: Heart,
                                    number: prob?.stat3Number || '70%',
                                    label: prob?.stat3Label || 'das famílias gostariam de ter preservado mais memórias',
                                    color: 'from-primary-teal to-teal-500',
                                    bgColor: 'bg-primary-teal/10',
                                    iconColor: 'text-primary-teal',
                                },
                            ].map((stat, idx) => (
                                <motion.div
                                    key={idx}
                                    variants={cardVariants}
                                    className="liquid-glass rounded-2xl p-6 text-center group hover:shadow-lg transition-shadow"
                                >
                                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${stat.bgColor} mb-4`}>
                                        <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                                    </div>
                                    <div className={`text-4xl font-black mb-2 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                                        {stat.number}
                                    </div>
                                    <p className="text-text-muted text-sm leading-relaxed">{stat.label}</p>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* CTA message */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="liquid-glass rounded-2xl p-8 text-center"
                        >
                            <p className="text-lg font-medium text-text-main leading-relaxed max-w-3xl mx-auto">
                                {prob?.cta || 'O Memory Book ajuda famílias a preservar essas histórias antes que desapareçam — transformando memórias passageiras em um legado lindo e duradouro.'}
                            </p>
                        </motion.div>
                    </motion.div>
                </section>

                {/* How it Works - with motion cards */}
                <section id="how-it-works" className="py-24 flex flex-col items-center bg-card-bg -mx-4 md:-mx-12 px-4 md:px-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16 max-w-7xl"
                    >
                        <h2 className="text-4xl font-bold text-text-main mb-4">{hiw?.title || 'How it Works'}</h2>
                        <p className="text-text-muted max-w-2xl mx-auto text-lg">
                            {hiw?.description || "We've designed a simple three-step process to help you capture every precious moment without the stress."}
                        </p>
                    </motion.div>

                    <motion.div 
                        className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-7xl"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                    >
                        {[
                            {
                                icon: MessageCircle,
                                title: hiw?.step1Title || "Share your stories",
                                desc: hiw?.step1Desc || "Answer simple questions about childhood, growing up, and the moments that shaped your loved one's life.",
                                color: "bg-primary-teal/10 text-primary-teal",
                                step: "01"
                            },
                            {
                                icon: Palette,
                                title: hiw?.step2Title || "Personalize the book",
                                desc: hiw?.step2Desc || "Choose an illustration style, add photos or describe physical characteristics. Every detail helps create a one-of-a-kind memory book.",
                                color: "bg-accent-coral/10 text-accent-coral",
                                step: "02"
                            },
                            {
                                icon: BookText,
                                title: hiw?.step3Title || "Receive your book",
                                desc: hiw?.step3Desc || "In just a few minutes, receive a beautifully illustrated book ready to view, print, and share with the whole family.",
                                color: "bg-amber-100 text-amber-600",
                                step: "03"
                            }
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                variants={cardVariants}
                                whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                                className="liquid-glass-strong rounded-2xl p-8 h-full flex flex-col items-start text-left cursor-default transition-colors"
                            >
                                <div className="flex items-center justify-between w-full mb-6">
                                    <div className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center`}>
                                        <item.icon className="w-7 h-7" />
                                    </div>
                                    <span className="text-5xl font-black text-black/5">{item.step}</span>
                                </div>
                                <h3 className="text-2xl font-bold text-text-main mb-3">{item.title}</h3>
                                <p className="text-text-muted leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </section>

                {/* Sample Book Preview Section - with motion */}
                <section id="example" className="py-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-12"
                    >
                        <motion.span 
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="text-accent-coral font-bold tracking-wider text-sm uppercase mb-4 inline-flex items-center gap-2"
                        >
                            <Eye className="w-4 h-4" />
                            {hm?.seeResult || 'Veja o resultado'}
                        </motion.span>
                        <h2 className="text-4xl font-bold text-text-main mb-4 mt-2">
                            {hm?.bookCreatedWithLove || 'Um livro criado com amor'}
                        </h2>
                        <p className="text-text-muted max-w-2xl mx-auto text-lg">
                            {sampleBookDisplay.description}
                        </p>
                    </motion.div>

                    {/* Book Style Tabs */}
                    <div className="flex flex-wrap justify-center gap-3 mb-10">
                        {allBooks.map((book, idx) => {
                            const isActive = idx === selectedBookIdx;
                            const styleName = book.display.imageStyle;
                            const styleLabels: Record<string, string> = {
                                watercolor: language === 'pt' ? 'Aquarela' : 'Watercolor',
                                cartoon: 'Cartoon',
                                anime: 'Anime',
                                coloring: language === 'pt' ? 'Colorir' : 'Coloring',
                            };
                            const styleColors: Record<string, string> = {
                                watercolor: 'from-blue-400 to-purple-400',
                                cartoon: 'from-orange-400 to-pink-400',
                                anime: 'from-pink-400 to-rose-400',
                                coloring: 'from-gray-500 to-gray-700',
                            };
                            return (
                                <motion.button
                                    key={idx}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => setSelectedBookIdx(idx)}
                                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                                        isActive
                                            ? `bg-gradient-to-r ${styleColors[styleName] || 'from-primary-teal to-teal-400'} text-white shadow-lg`
                                            : 'liquid-glass-subtle text-text-muted hover:shadow-sm'
                                    }`}
                                >
                                    <span className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-white' : `bg-gradient-to-r ${styleColors[styleName] || 'from-primary-teal to-teal-400'}`}`} />
                                        {book.display.title.length > 30 ? book.display.title.slice(0, 28) + '...' : book.display.title}
                                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20' : 'bg-gray-100'}`}>
                                            {styleLabels[styleName] || styleName}
                                        </span>
                                    </span>
                                </motion.button>
                            );
                        })}
                    </div>

                    <motion.div
                        key={sampleBookDisplay.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-4xl mx-auto"
                    >
                        <motion.div 
                            whileHover={{ y: -4 }}
                            transition={{ duration: 0.3 }}
                            className="liquid-glass-strong rounded-3xl shadow-2xl"
                        >
                            {/* Book Cover Image */}
                            <div className="relative aspect-[16/9] overflow-hidden group cursor-pointer" onClick={() => setIsSampleViewerOpen(true)}>
                                <img
                                    src={sampleBookDisplay.imageUrl}
                                    alt={sampleBookDisplay.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                                
                                {/* Title on Image */}
                                <div className="absolute bottom-0 left-0 right-0 p-8">
                                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                                        <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-semibold capitalize">
                                            {(() => {
                                                const s = sampleBookDisplay.imageStyle;
                                                const labels: Record<string, string> = {
                                                    watercolor: hm?.watercolor || 'Aquarela',
                                                    cartoon: 'Cartoon',
                                                    anime: 'Anime',
                                                    coloring: language === 'pt' ? 'Colorir' : 'Coloring',
                                                };
                                                return labels[s] || s;
                                            })()}
                                        </span>
                                        <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-semibold">
                                            {sampleBookDisplay.pageCount} {hm?.pages || 'páginas'}
                                        </span>
                                        <span className="px-3 py-1 rounded-full bg-accent-coral/80 backdrop-blur-sm text-white text-xs font-semibold">
                                            {hm?.example || 'Exemplo'}
                                        </span>
                                    </div>
                                    <h3 className="text-3xl font-bold text-white mb-2">
                                        {sampleBookDisplay.title}
                                    </h3>
                                    <p className="text-white/80 text-sm max-w-lg">
                                        {sampleBookDisplay.description}
                                    </p>
                                </div>

                                {/* View Button */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <motion.div 
                                        whileHover={{ scale: 1.05 }}
                                        className="px-6 py-3 liquid-glass-strong rounded-2xl shadow-lg flex items-center gap-2"
                                    >
                                        <Eye className="w-5 h-5 text-primary-teal" />
                                        <span className="font-semibold text-text-main">{hm?.viewBook || 'Visualizar Livro'}</span>
                                    </motion.div>
                                </div>
                            </div>

                            {/* Page Thumbnails Preview */}
                            <div className="p-6 liquid-glass-subtle">
                                <div className="flex items-center gap-2 mb-4">
                                    <BookOpen className="w-5 h-5 text-primary-teal" />
                                    <span className="text-sm font-semibold text-text-main">{hm?.pagePreview || 'Prévia das páginas'}</span>
                                </div>
                                <div className="flex gap-3 overflow-x-auto pb-2">
                                    {sampleBookPages.slice(1, -1).map((page, index) => (
                                        <motion.button
                                            key={page.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.3, delay: index * 0.05 }}
                                            whileHover={{ y: -4 }}
                                            onClick={() => setIsSampleViewerOpen(true)}
                                            className="shrink-0 group/thumb"
                                        >
                                            <div className="w-24 h-32 rounded-xl overflow-hidden border-2 border-transparent group-hover/thumb:border-primary-teal transition-all shadow-sm">
                                                <img
                                                    src={page.imageUrl}
                                                    alt={page.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <p className="text-xs text-text-muted mt-1 text-center w-24 leading-tight break-words line-clamp-2">
                                                {page.title}
                                            </p>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* CTA under the sample */}
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="text-center mt-8"
                        >
                            <Button
                                variant="primary"
                                className="shadow-lg hover:shadow-xl"
                                onClick={() => setIsAuthModalOpen(true)}
                            >
                                {hm?.createYours || 'Crie o Seu Memory Book'}
                            </Button>
                        </motion.div>
                    </motion.div>
                </section>

                {/* Privacy Section - with InfoModal and translation */}
                <motion.section 
                    id="privacy" 
                    className="py-12 w-full"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <motion.div 
                        whileHover={{ scale: 1.01 }}
                        transition={{ duration: 0.3 }}
                        className="w-full liquid-glass-strong rounded-[24px] p-8 flex flex-col md:flex-row items-center justify-between gap-8"
                    >
                        <div className="flex items-start gap-6">
                            <motion.div 
                                animate={{ rotate: [0, 5, -5, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                className="bg-white p-4 rounded-full shadow-sm shrink-0"
                            >
                                <ShieldCheck className="w-8 h-8 text-teal-400" />
                            </motion.div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">{ps?.title || 'Privacy you can trust'}</h3>
                                <p className="text-slate-600">{ps?.description || 'We use end-to-end encryption to ensure your family memories remain private forever.'}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setIsSecurityModalOpen(true)}
                            className="text-teal-500 font-semibold flex items-center gap-2 hover:underline whitespace-nowrap hover:text-teal-600 transition-colors"
                        >
                            {ps?.learnMore || 'Learn about security'} <ArrowRight className="w-4 h-4" />
                        </button>
                    </motion.div>
                </motion.section>

                {/* CTA Section - with animated gradient and translations */}
                <section className="py-24 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            whileInView={{ scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, type: 'spring' }}
                            className="inline-flex items-center justify-center w-16 h-16 rounded-full liquid-glass mb-6"
                        >
                            <Heart className="w-8 h-8 text-accent-coral" />
                        </motion.div>
                        <h2 className="text-4xl md:text-5xl font-bold text-text-main mb-6 tracking-tight">
                            {ctaSec?.title_start || "Start your family's"} <br />
                            <span 
                                className="bg-clip-text text-transparent"
                                style={{
                                    backgroundImage: 'linear-gradient(90deg, #00E5E5, #FF9E91, #00E5E5)',
                                    backgroundSize: '200% 100%',
                                    animation: 'gradientShift 4s ease infinite',
                                }}
                            >
                                {ctaSec?.title_gradient || 'Memory Book Today'}
                            </span>
                        </h2>
                        <p className="text-xl text-text-muted max-w-2xl mx-auto mb-10">
                            {ctaSec?.description || 'Join thousands of families keeping their stories alive and strengthening connections every single day.'}
                        </p>

                        <motion.div
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Button
                                variant="primary"
                                className="!px-10 !py-4 !text-lg shadow-xl hover:shadow-2xl"
                                onClick={() => setIsAuthModalOpen(true)}
                            >
                                {ctaSec?.button || 'Get Started for Free'}
                            </Button>
                        </motion.div>
                    </motion.div>
                </section>

            </main>

            <Footer />

            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

            {/* Security / Privacy Info Modal */}
            <InfoModal
                isOpen={isSecurityModalOpen}
                onClose={() => setIsSecurityModalOpen(false)}
                type="privacy"
            />

            {/* Sample Book Viewer */}
            <BookViewer
                isOpen={isSampleViewerOpen}
                onClose={() => setIsSampleViewerOpen(false)}
                title={sampleBookDisplay.title}
                pages={sampleBookPages}
                isFavorite={true}
            />
        </div>
    );
};
