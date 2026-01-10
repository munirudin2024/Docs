#!/bin/bash

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

while true; do
  clear
  echo -e "${BLUE}╔═════════════════════════════╗${NC}"
  echo -e "${BLUE}║      CYBER LAB GATEWAY      ║${NC}"
  echo -e "${BLUE}╚═════════════════════════════╝${NC}"
  echo ""
  echo -e "${GREEN}Kontainer tersedia:${NC}"
  echo "1) Bun (Frontend/Vite)"
  echo "2) Kali (Security Lab)"
  echo "3) Rust (System Dev)"
  echo "4) Postgres (Database)"
  echo "5) Neovim (Editor)"
  echo "6) Dotnet (Backend)"
  echo "7) Firebase (Cloud)"
  echo "q) Exit"
  echo ""
  read -p "Pilihan [1-7/q]: " choice

  # Cek Docker daemon terlebih dahulu
  if ! docker info >/dev/null 2>&1; then
    echo -e "${RED}Docker daemon tidak terdeteksi.${NC}"
    echo -e "${YELLOW}Pastikan Docker berjalan, lalu jalankan: docker compose up -d${NC}"
    sleep 2
    continue
  fi

  # Helper: masuk kontainer jika berjalan, beri pesan jika belum
  enter_container() {
    local name="$1"
    shift
    local cmd="$*"
    # Apakah container sedang berjalan?
    if ! docker ps --format '{{.Names}}' | grep -qx "$name"; then
      echo -e "${RED}Kontainer '$name' belum berjalan.${NC}"
      echo -e "${YELLOW}Jalankan stack dengan: docker compose up -d${NC}"
      sleep 2
      return 1
    fi
    docker exec -it "$name" $cmd
  }

  case $choice in
    1)
      echo -e "${YELLOW}Masuk Bun...${NC}"
      enter_container bun_dev /bin/bash
      ;;
    2)
      echo -e "${YELLOW}Masuk Kali...${NC}"
      enter_container kali_lab /bin/bash
      ;;
    3)
      echo -e "${YELLOW}Masuk Rust...${NC}"
      enter_container rust_dev /bin/bash
      ;;
    4)
      echo -e "${YELLOW}Masuk Postgres...${NC}"
      enter_container postgres_pgdb psql -U pguser -d pgdb
      ;;
    5)
      echo -e "${YELLOW}Masuk Neovim...${NC}"
      enter_container neovim_dev /bin/bash
      ;;
    6)
      echo -e "${YELLOW}Masuk Dotnet...${NC}"
      enter_container dotnet_dev /bin/bash
      ;;
    7)
      echo -e "${YELLOW}Masuk Firebase...${NC}"
      enter_container firebase_studio /bin/bash
      ;;
    q)
      echo -e "${GREEN}Sampai jumpa!${NC}"
      exit 0
      ;;
    *)
      echo -e "${RED}Pilihan salah!${NC}"
      sleep 2
      ;;
  esac
done
