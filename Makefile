start:
	bun dev

check-formatting:
	npm run format:nofix

format:
	npm run format

build-and-run:
	bun run build.ts && bunx serve dist
