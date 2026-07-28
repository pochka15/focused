start:
	pnpm dev

check-formatting:
	pnpm format:nofix

format:
	pnpm format

build:
	pnpm build

build-and-run:
	pnpm build && pnpm preview

typecheck:
	pnpm typecheck