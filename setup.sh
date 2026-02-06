#!/bin/bash

echo "🚀 Discohook Clone - Setup"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no encontrado. Instala Node.js v18+ primero."
    exit 1
fi

echo "✓ Node.js $(node -v)"

# Install dependencies
echo ""
echo "📦 Instalando dependencias..."
npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Setup completo!"
    echo ""
    echo "Para iniciar:"
    echo "  npm run dev"
    echo ""
    echo "Para build de producción:"
    echo "  npm run build"
    echo ""
else
    echo "❌ Error en instalación"
    exit 1
fi
