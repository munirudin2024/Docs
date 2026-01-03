#!/bin/bash

# Color codes untuk output yang lebih bagus
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

while true; do
  clear
  echo -e "${BLUE}╔═════════════════════════════╗${NC}"
  echo -e "${BLUE}║      CYBER LAB GATEWAY      ║${NC}"
  echo -e "${BLUE}╚═════════════════════════════╝${NC}"
  echo ""
  echo -e "${GREEN}Kontainer yang tersedia:${NC}"
  echo "1) Bun (Frontend/Vite) 📦"
  echo "2) Kali (Security Lab) 🔓"
  echo "3) Rust (System Dev) ⚙️"
  echo "4) Postgres (Database) 🗄️"
  echo "5) Neovim (Editor) 📝"
  echo "6) Dotnet (Backend) 🔷"
  echo "7) Firebase (Cloud) 🔥"
  echo "q) Exit ❌"
  echo ""
  read -p "Masukkan pilihan [1-7/q]: " choice

  case $choice in
    1)
      echo -e "${YELLOW}🚀 Masuk ke Bun...${NC}"
      docker exec -it bun_dev /bin/bash
      ;;
    2)
      echo -e "${YELLOW}🔓 Masuk ke Kali...${NC}"
      docker exec -it kali_lab /bin/bash
      ;;
    3)
      echo -e "${YELLOW}⚙️  Masuk ke Rust...${NC}"
      docker exec -it rust_dev /bin/bash
      ;;
    4)
      echo -e "${YELLOW}🗄️  Masuk ke Postgres...${NC}"
      docker exec -it postgres_pgdb psql -U pguser -d pgdb
      ;;
    5)
      echo -e "${YELLOW}📝 Masuk ke Neovim...${NC}"
      docker exec -it neovim_dev /bin/bash
      ;;
    6)
      echo -e "${YELLOW}🔷 Masuk ke Dotnet...${NC}"
      docker exec -it dotnet_dev /bin/bash
      ;;
    7)
      echo -e "${YELLOW}🔥 Masuk ke Firebase...${NC}"
      docker exec -it firebase_studio /bin/bash
      ;;
    q)
      echo -e "${GREEN}Terima kasih! Sampai jumpa 👋${NC}"
      exit 0
      ;;
    *)
      echo -e "${RED}❌ Pilihan salah! Coba lagi.${NC}"
      sleep 2
      ;;
  esac
done
