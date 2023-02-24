## Variables
YELLOW := \033[1;33m
NC := \033[0m

.PHONY: up
up:
	@echo "${YELLOW}Starting Goalifier:Dev...${NC}\n"
	@docker compose -f dev.docker-compose.yml up -d

.PHONY: down
down:
	@echo "${YELLOW}Stopping Goalifier:Dev...${NC}\n"
	@docker compose down --remove-orphans

.PHONY:
logs:
	@docker compose -f dev.docker-compose.yml logs -f backend

.PHONY: cleanup
cleanup:
	@echo "${YELLOW}Cleaning up Backend node_modules:Dev...${NC}\n"
	@sudo rm -r ./node_modules
