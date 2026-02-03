/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'primary-teal': 'var(--color-primary-teal)',
                'accent-coral': 'var(--color-accent-coral)',
                'accent-amber': 'var(--color-accent-amber)',
                'bg-soft': 'var(--color-bg-soft)',
                'text-main': 'var(--color-text-main)',
                'text-muted': 'var(--color-text-muted)',
                'card-bg': 'var(--color-card-bg)',
            },
            borderRadius: {
                'xl': 'var(--border-radius)',
            },
            boxShadow: {
                'soft': 'var(--shadow-soft)',
            }
        },
    },
    plugins: [],
}
