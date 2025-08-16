.PHONY: help build up down logs clean dev prod test

# Default target
help:
	@echo "Smart Polling Platform - Docker Commands"
	@echo ""
	@echo "Development:"
	@echo "  make dev          - Start development environment"
	@echo "  make dev-build    - Build development containers"
	@echo "  make dev-logs     - Show development logs"
	@echo ""
	@echo "Production:"
	@echo "  make prod         - Start production environment"
	@echo "  make prod-build   - Build production containers"
	@echo "  make prod-logs    - Show production logs"
	@echo ""
	@echo "General:"
	@echo "  make down         - Stop all containers"
	@echo "  make logs         - Show all logs"
	@echo "  make clean        - Remove all containers and volumes"
	@echo "  make test         - Run tests"
	@echo ""

# Development commands
dev: dev-build
	docker-compose -f docker-compose.dev.yml up

dev-build:
	docker-compose -f docker-compose.dev.yml build

dev-logs:
	docker-compose -f docker-compose.dev.yml logs -f

# Production commands
prod: prod-build
	docker-compose up -d

prod-build:
	docker-compose build

prod-logs:
	docker-compose logs -f

# General commands
down:
	docker-compose down
	docker-compose -f docker-compose.dev.yml down

logs:
	docker-compose logs -f

clean:
	docker-compose down -v --remove-orphans
	docker-compose -f docker-compose.dev.yml down -v --remove-orphans
	docker system prune -f
	docker volume prune -f

# Database commands
db-reset:
	docker-compose exec backend python manage.py flush --no-input
	docker-compose exec backend python manage.py migrate

db-shell:
	docker-compose exec db psql -U postgres -d smart_polling

# Backend commands
backend-shell:
	docker-compose exec backend python manage.py shell

backend-migrate:
	docker-compose exec backend python manage.py migrate

backend-collectstatic:
	docker-compose exec backend python manage.py collectstatic --no-input

# Frontend commands
frontend-shell:
	docker-compose exec frontend sh

# Testing
test:
	docker-compose exec backend python manage.py test
	docker-compose exec frontend npm test

# Health check
health:
	@echo "Checking service health..."
	@curl -f http://localhost:8000/health || echo "Backend not healthy"
	@curl -f http://localhost:3000 || echo "Frontend not healthy"
	@echo "Health check complete"
