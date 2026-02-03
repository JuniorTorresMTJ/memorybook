import { Link } from 'react-router-dom';
import logoRound from '../../assets/logo_round.png';

export const DashboardFooter = () => {
    return (
        <footer className="w-full py-6 px-4 md:px-8 bg-card-bg border-t border-black/5 dark:border-white/10 mt-auto">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Logo */}
                <Link to="/dashboard" className="flex items-center gap-2">
                    <img src={logoRound} alt="Memory Book" className="w-6 h-6" />
                    <span className="font-bold text-text-main">Memory Book</span>
                </Link>

                {/* Copyright */}
                <p className="text-sm text-text-muted">
                    © 2024 Memory Book. Preservation with care.
                </p>

                {/* Links */}
                <div className="flex gap-6 text-sm">
                    <Link to="#" className="text-text-muted hover:text-primary-teal transition-colors">
                        Privacy
                    </Link>
                    <Link to="#" className="text-text-muted hover:text-primary-teal transition-colors">
                        Accessibility
                    </Link>
                    <Link to="#" className="text-text-muted hover:text-primary-teal transition-colors">
                        Support
                    </Link>
                </div>
            </div>
        </footer>
    );
};
