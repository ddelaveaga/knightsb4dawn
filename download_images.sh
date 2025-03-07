#!/bin/bash

# Create directory if it doesn't exist
mkdir -p knightb4dawnMedia

# Download hero background
curl -L "https://images.unsplash.com/photo-1580541832626-2a7131ee809f" -o "knightb4dawnMedia/hero-bg.jpg"

# Download venue/sponsor images
curl -L "https://images.unsplash.com/photo-1582719508461-905c673771fd" -o "knightb4dawnMedia/jesse.jpg"
curl -L "https://images.unsplash.com/photo-1600093463592-8e36ae95ef56" -o "knightb4dawnMedia/forged.jpg"
curl -L "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b" -o "knightb4dawnMedia/ferino.jpg"

# Download player profile images
curl -L "https://images.unsplash.com/photo-1553867745-6e038d085e86" -o "knightb4dawnMedia/player1.jpg"
curl -L "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2" -o "knightb4dawnMedia/player2.jpg"

# Make images readable
chmod 644 knightb4dawnMedia/* 