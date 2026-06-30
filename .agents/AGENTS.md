# Workspace Customization Rules

These guidelines define workspace-wide rules for developers and AI agents editing this repository.

## Styling and Typography Standards

- **Primary Font Family**: Always use **Google Sans** as the unified font family across all parts of the frontend web application.
- **Font Variables**: Standard layouts and components should rely on the CSS custom property `--font-family` defined in `src/index.css`.
- **Creating New Styles**: When creating new CSS files or React components, **do not** specify custom, hardcoded fonts like `Inter`, `Epilogue`, `Outfit`, or `Hanken Grotesk`. Allow styling to inherit from the `body` selector or use `var(--font-family)`.
- **Special Layout Exceptions**: Monospace text styles (such as `Courier New`, `monospace`) may be used selectively for JWT token viewers, server/CLI response log viewers, and code blocks to maintain high readability.
