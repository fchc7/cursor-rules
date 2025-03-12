# Git Commit Message Format

## Structure

```
<type>: [emoji] <subject>
```

## Type

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools and libraries
- `ci`: Changes to CI configuration files and scripts

## Emoji

- ✨ (feat): for new features
- 🐛 (fix): for bug fixes
- 📚 (docs): for documentation
- 💄 (style): for formatting, missing semi colons, etc
- ♻️ (refactor): for code refactoring
- ⚡ (perf): for performance improvements
- ✅ (test): for adding tests
- 🔧 (chore): for tooling changes
- 👷 (ci): for CI related changes

## Subject

- Use the imperative, present tense: "change" not "changed" nor "changes"
- Don't capitalize the first letter
- No dot (.) at the end
- Keep it concise and under 50 characters
- Describe what the commit does, not what it did

## Examples

```
feat: ✨ add user authentication feature
fix: 🐛 resolve issue with login form validation
docs: 📚 update API documentation
style: 💄 format code according to style guide
refactor: ♻️ simplify payment processing logic
perf: ⚡ optimize database queries
test: ✅ add unit tests for user service
chore: 🔧 update dependencies
ci: 👷 configure GitHub Actions workflow
```
