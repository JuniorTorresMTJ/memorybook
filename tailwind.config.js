/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Nunito', 'system-ui', 'sans-serif'],
                heading: ['Playfair Display', 'Georgia', 'serif'],
                body: ['Lora', 'Georgia', 'serif'],
            },
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
