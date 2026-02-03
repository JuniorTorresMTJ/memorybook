import logoRound from '../../assets/logo_round.png';

export const Footer = () => {
    return (
        <footer className="w-full py-12 px-4 md:px-12 bg-bg-soft border-t border-black/5 mt-auto">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-2">
                    <img src={logoRound} alt="Memory Book" className="w-6 h-6" />
                    <span className="font-bold text-text-main">Memory Book</span>
                </div>

                <div className="flex gap-8 text-sm text-text-muted">
                    <a href="#" className="hover:text-primary-teal transition-colors">Terms</a>
                    <a href="#" className="hover:text-primary-teal transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-primary-teal transition-colors">Help Center</a>
                    <a href="#" className="hover:text-primary-teal transition-colors">Contact</a>
                </div>

                <div className="text-sm text-text-muted">
                    © 2024 Memory Book. All rights reserved.
                </div>
            </div>
        </footer>
    );
};
