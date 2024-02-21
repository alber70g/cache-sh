# cache-sh

cache-sh is a command line tool for caching shell commands. It can be used to
cache the results of any shell command, reducing the time it takes to run
repetitive tasks.

[Changelog](./changelog.md)

## Installation

```bash
npm install -g cache-sh
```

## Usage

Here are some examples of how you can use `cache-sh` with `prisma generate` and
`tsc`.

### Prisma Generate

```bash
cache-sh -i "{./prisma/schema.prisma,node_modules/**/.prisma/client/**/*.*}" \
pnpm prisma generate
```

In this example cache-sh will check if the `prisma/schema.prisma` file AND the
generated `.prisma/client` has changed and exists, since the last time
`prisma generate` was run.

If it hasn't, `cache-sh` will skip running the command and use the cached result
instead.

### TypeScript Compilation

```bash
cache-sh -i "{src/**/*,dist/**/*}" tsc
```

In this example, cache-sh will check if any `.ts` files in the `src` directory
have changed since the last time `tsc` was run. If they haven't, cache-sh will
skip running the command and assume you can use what's already there, instead.

## Options

- `-i, --input <input>`: glob that's used as input to check whether the existing
  files need to be updated
- `-C, --config <path>`: set the config path (default: "cwd/.cache-sh")
- `-f, --force`: ignore the cache the command
- `-c, --clear`: clear the cache
- `-d, --cwd <path>`: set the current working directory
- `-V, --version`: output the version number
- `-h, --help`: display help for command

## Command

The command to execute and cache.
