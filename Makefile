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

lint:
	pnpm lint

lint-fix:
	pnpm lint:fix

check: check-formatting lint typecheck

fix: format lint-fix
