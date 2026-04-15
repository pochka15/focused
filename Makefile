start:
	pnpm dev

check-formatting:
	pnpm format:nofix

format:
	pnpm format

build-and-run:
	pnpm build && pnpm preview
