import { useState } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { AuthModal } from '../components/ui/AuthModal';
import { Play, Image as ImageIcon, FolderOpen, BookText, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { FlipImage } from '../components/ui/FlipImage';
import heroMan from '../assets/hero-man.png';
import heroWoman from '../assets/hero-woman.png';

import { useLanguage } from '../contexts/LanguageContext';

export const Home = () => {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const { t } = useLanguage();
    return (
        <div className="min-h-screen bg-bg-soft flex flex-col font-sans">
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
                            <span className="text-accent-coral font-bold tracking-wider text-sm uppercase mb-4 block">{t.hero.subtitle}</span>
                            <h1 className="text-5xl md:text-7xl font-bold text-text-main leading-[1.1] mb-6">
                                {t.hero.title_start} <br />
                                <span className="bg-gradient-to-r from-[#00E5E5] to-[#FF9E91] bg-clip-text text-transparent">{t.hero.title_gradient}</span>
                            </h1>
                            <p className="text-xl text-text-muted leading-relaxed max-w-lg mb-8">
                                {t.hero.description}
                            </p>

                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
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
                            </div>
                        </motion.div>
                    </div>

                    <div className="flex-1 relative w-full flex justify-center md:justify-end">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="relative z-10 w-full max-w-lg"
                        >
                            <div className="bg-gradient-to-br from-white/40 to-white/10 backdrop-blur-xl rounded-[40px] p-8 shadow-2xl border border-white/50 relative overflow-hidden">
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

                {/* How it Works */}
                <section id="how-it-works" className="py-24 flex flex-col items-center bg-card-bg -mx-4 md:-mx-12 px-4 md:px-12">
                    <div className="text-center mb-16 max-w-7xl">
                        <h2 className="text-4xl font-bold text-text-main mb-4">How it Works</h2>
                        <p className="text-text-muted max-w-2xl mx-auto text-lg">
                            We've designed a simple three-step process to help you capture every precious moment without the stress.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-7xl">
                        {[
                            {
                                icon: ImageIcon,
                                title: "Add memories",
                                desc: "Upload photos and share stories from your phone or computer. Voice-to-text makes it easy for everyone to contribute.",
                                color: "bg-primary-teal/10 text-primary-teal"
                            },
                            {
                                icon: FolderOpen,
                                title: "Organize",
                                desc: "Categorize moments by family members, years, or special events. Our AI helps sort and suggest connections.",
                                color: "bg-primary-teal/10 text-primary-teal"
                            },
                            {
                                icon: BookText,
                                title: "Generate",
                                desc: "Create a beautiful digital or physical memory book instantly. Perfect for therapy sessions or bedside reminiscence.",
                                color: "bg-primary-teal/10 text-primary-teal"
                            }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-bg-soft rounded-xl p-6 shadow-soft border border-black/5 h-full flex flex-col items-start text-left hover:shadow-lg transition-all">
                                <div className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center mb-6`}>
                                    <item.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-2xl font-bold text-text-main mb-3">{item.title}</h3>
                                <p className="text-text-muted leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Privacy Section */}
                <section id="privacy" className="py-12 w-full">
                    <div className="w-full bg-gradient-to-br from-teal-50 to-orange-50 rounded-[24px] border border-teal-100/50 p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex items-start gap-6">
                            <div className="bg-white p-4 rounded-full shadow-sm shrink-0">
                                <ShieldCheck className="w-8 h-8 text-teal-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Privacy you can trust</h3>
                                <p className="text-slate-600">We use end-to-end encryption to ensure your family memories remain private forever.</p>
                            </div>
                        </div>
                        <a href="#" className="text-teal-500 font-semibold flex items-center gap-2 hover:underline whitespace-nowrap">
                            Learn about security <ArrowRight className="w-4 h-4" />
                        </a>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-24 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-text-main mb-6 tracking-tight">
                        Start your family's <br />
                        <span className="bg-gradient-to-r from-[#00E5E5] to-[#FF9E91] bg-clip-text text-transparent">Memory Book Today</span>
                    </h2>
                    <p className="text-xl text-text-muted max-w-2xl mx-auto mb-10">
                        Join thousands of families keeping their stories alive and strengthening connections every single day.
                    </p>

                    <div className="flex flex-col items-center gap-8">
                        <Button
                            variant="primary"
                            className="!px-10 !py-4 !text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1"
                            onClick={() => setIsAuthModalOpen(true)}
                        >
                            Get Started for Free
                        </Button>

                        <div className="flex items-center gap-4">
                            <div className="flex -space-x-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                                        <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                                    </div>
                                ))}
                            </div>
                            <span className="text-sm font-medium text-text-muted">Loved by 10,000+ families</span>
                        </div>
                    </div>
                </section>

            </main>

            <Footer />

            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        </div>
    );
};
