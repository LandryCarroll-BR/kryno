<!-- effect-solutions:start -->
## Effect Best Practices

**IMPORTANT:** Always consult effect-solutions before writing Effect code.

1. Run `effect-solutions list` to see available guides
2. Run `effect-solutions show <topic>...` for relevant patterns (supports multiple topics)
3. Search `~/.local/share/effect-solutions/effect` for real implementations

Topics: quick-start, project-setup, tsconfig, basics, services-and-layers, data-modeling, error-handling, config, testing, cli.

Never guess at Effect patterns - check the guide first.
<!-- effect-solutions:end -->

## Local Effect Source

The Effect v4 repository is cloned to `~/.local/share/effect-solutions/effect` for reference.
Use this to explore APIs, find usage examples, and understand implementation details when the documentation isn't enough.

## Module Architecture

When creating or refactoring modules under `modules/`, use the local `module-architecture` skill:

`/Users/landry_local/personal/01-projects/kryno/kryno/.agents/skills/module-architecture/SKILL.md`

Modules should expose a thin module facade from root, keep use cases in `application/<use-case>/` as input boundaries and interactors, define dependencies as ports, implement ports with adapters, and compose live/mock/test layers explicitly. Other modules should depend on the module facade, not HTTP adapters or ports.
