start:
	bun dev

build-and-run:
	bun run build.ts && bunx serve dist
