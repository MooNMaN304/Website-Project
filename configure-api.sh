#!/bin/bash

# Environment Configuration Script for Website Project
# This script helps switch between development and production API configurations

set -e

FRONTEND_DIR="$(dirname "$0")/frontend"
ENV_FILE="$FRONTEND_DIR/.env"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_help() {
    echo "Usage: $0 [dev|prod|status]"
    echo ""
    echo "Commands:"
    echo "  dev     - Configure for local development (API at localhost:8000)"
    echo "  prod    - Configure for Docker production (API at app:8000)"
    echo "  status  - Show current configuration"
    echo "  help    - Show this help message"
}

show_status() {
    echo -e "${YELLOW}Current API Configuration:${NC}"
    echo ""

    if [ -f "$ENV_FILE" ]; then
        echo "Environment file: $ENV_FILE"
        echo ""

        # Show current API URL configuration
        echo "API URLs:"
        grep -E "^(NEXT_PUBLIC_API_URL|API_BASE_URL)=" "$ENV_FILE" || echo "  No API URLs found"

        echo ""
        echo "Current configuration appears to be for:"
        if grep -q "NEXT_PUBLIC_API_URL=http://localhost:8000" "$ENV_FILE"; then
            echo -e "  ${GREEN}Development (localhost)${NC}"
        elif grep -q "NEXT_PUBLIC_API_URL=http://app:8000" "$ENV_FILE"; then
            echo -e "  ${GREEN}Production (Docker)${NC}"
        else
            echo -e "  ${YELLOW}Custom/Unknown${NC}"
        fi
    else
        echo -e "${RED}Environment file not found: $ENV_FILE${NC}"
        exit 1
    fi
}

configure_dev() {
    echo -e "${YELLOW}Configuring for development (localhost)...${NC}"

    # Update API URLs for development
    sed -i.bak 's|^NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=http://localhost:8000|' "$ENV_FILE"
    sed -i.bak 's|^API_BASE_URL=.*|API_BASE_URL=http://app:8000|' "$ENV_FILE"

    echo -e "${GREEN}✓ Development configuration applied${NC}"
    echo ""
    echo "Frontend will use:"
    echo "  - Client-side API: http://localhost:8000"
    echo "  - Server-side API: http://app:8000 (for Docker)"
    echo ""
    echo "Make sure your backend is running on localhost:8000"
}

configure_prod() {
    echo -e "${YELLOW}Configuring for production (Docker)...${NC}"

    # Update API URLs for production
    sed -i.bak 's|^NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=http://app:8000|' "$ENV_FILE"
    sed -i.bak 's|^API_BASE_URL=.*|API_BASE_URL=http://app:8000|' "$ENV_FILE"

    echo -e "${GREEN}✓ Production configuration applied${NC}"
    echo ""
    echo "Frontend will use:"
    echo "  - Client-side API: http://app:8000"
    echo "  - Server-side API: http://app:8000"
    echo ""
    echo "Use 'docker-compose up' to start all services"
}

# Main logic
case "${1:-status}" in
    "dev")
        configure_dev
        ;;
    "prod")
        configure_prod
        ;;
    "status")
        show_status
        ;;
    "help"|"-h"|"--help")
        print_help
        ;;
    *)
        echo -e "${RED}Error: Unknown command '$1'${NC}"
        echo ""
        print_help
        exit 1
        ;;
esac
