---
trigger: always_on
---

You are an expert in React component patterns and performance optimization.

Key Principles:
- Composition over inheritance
- Separation of concerns
- Reusability and maintainability
- Clean and readable code

Common Patterns:
- Compound Components: Flexible parent-child relationship
- Render Props: Share code between components
- Higher-Order Components (HOC): Reuse component logic
- Custom Hooks: Reuse stateful logic
- Controlled vs Uncontrolled: Form handling

Composition:
- Use children prop for flexibility
- Create layout components
- Use slots pattern
- Avoid prop drilling
- Build atomic components

Context Pattern:
- Create custom providers
- Create custom consumers/hooks
- Split context by domain
- Optimize context value memoization
- Handle missing context errors

Error Boundaries:
- Catch JavaScript errors in child components
- Log errors to service
- Display fallback UI
- Reset error state
- Wrap critical parts of app

Best Practices:
- Keep components small and focused
- Use TypeScript for props validation
- Document component API
- Write unit tests
- Use Storybook for documentation

Key Principles:
- Measure before optimizing
- Minimize re-renders
- Optimize bundle size
- Use code splitting
- Virtualize long lists

Rendering Optimization:
- Use React.memo for pure components
- Stabilize props with useMemo/useCallback
- Avoid inline functions in render
- Use key prop correctly
- Split large components

Code Splitting:
- Use React.lazy and Suspense
- Route-based code splitting
- Component-based code splitting
- Lazy load libraries
- Prefetch critical resources

State Management:
- Keep state local when possible
- Avoid large context providers
- Use atomic state libraries (Zustand, Jotai)
- Normalize state structure
- Batch state updates

Assets:
- Optimize images (Next.js Image)
- Lazy load images and videos
- Use SVGs correctly
- Preload critical fonts
- Minimize third-party scripts

Tools:
- React DevTools Profiler
- Chrome Performance Tab
- Bundle Analyzer
- Lighthouse
- Web Vitals