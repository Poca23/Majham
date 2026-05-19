# 🀄 Mahjam — 5 Mini-Jeux Mobile

**Mahjam** est une application web mobile proposant 5 mini-jeux de puzzle et d'arcade, jouables directement dans le navigateur, sans installation.

---

## 🎮 Jeux disponibles

### 🀄 Tile Match

> Le classique des jeux de tuiles.

Associez les tuiles identiques **libres** (non bloquées des deux côtés) pour les éliminer. Videz l'intégralité du plateau pour gagner !

---

### 🎱 Stack & Clear

> Les colonnes de boules.

Déplacez les boules entre les colonnes pour former des **triplets** de même couleur en sommet de colonne. Chaque triplet est automatiquement éliminé. Videz toutes les colonnes pour remporter la victoire !

---

### 🃏 Chain Tiles

> Le match en chaîne.

Reliez deux tuiles identiques à l'aide d'un chemin comportant **au maximum 2 angles**. Éliminez toutes les paires pour terminer le niveau.

---

### 🧪 Bottle Sort

> Le tri de liquides colorés.

Transvasez les liquides entre les bouteilles pour regrouper chaque couleur dans **une seule et même bouteille**. Attention à la capacité maximale (4 doses par bouteille) !

---

### 🫧 Bubble Shooter

> L'arcade classique revisitée.

Visez et tirez des bulles colorées pour former des groupes d'au moins **3 bulles identiques** et les faire éclater. Les bulles non connectées au plafond tombent également. La partie se termine si les bulles atteignent le lanceur.

---

## 🏆 Niveaux de difficulté

Chaque jeu propose **5 niveaux** sélectionnables avant de lancer une partie :

| Niveau    | Couleur       | Description                            |
| --------- | ------------- | -------------------------------------- |
| Débutant  | 🟢 Vert       | Plateau réduit, peu de couleurs        |
| Facile    | 🟩 Vert clair | Légèrement plus grand                  |
| Moyen     | 🟠 Orange     | Taille intermédiaire, plus de couleurs |
| Difficile | 🔴 Rouge      | Grand plateau, nombreuses couleurs     |
| Expert    | 🟣 Violet     | Plateau maximum, défi total            |

---

## 🗂️ Structure du projet

```
mahjam/
├── index.html               # Point d'entrée principal
├── css/
│   ├── base.css             # Variables globales, resets, animations
│   ├── layout.css           # Structure des écrans et headers
│   ├── components.css       # Boutons, cartes, overlays, toasts
│   ├── games.css            # Styles spécifiques aux jeux
│   └── bubble-shooter.css   # Styles du canvas Bubble Shooter
└── js/
    ├── core.js              # Navigation, niveaux, utilitaires partagés
    ├── tile-match.js        # Logique Tile Match
    ├── stack-clear.js       # Logique Stack & Clear
    ├── chain-tiles.js       # Logique Chain Tiles
    ├── bottle-sort.js       # Logique Bottle Sort
    └── bubble-shooter.js    # Logique Bubble Shooter (Canvas 2D)
```

---

## ⚙️ Technologies utilisées

- **HTML5 / CSS3 / JavaScript Vanilla** — aucun framework
- **Canvas API** — rendu du Bubble Shooter
- **SVG dynamique** — rendu des bouteilles (Bottle Sort)
- **Responsive design** — adapté aux mobiles et tablettes
- **Touch events** — support tactile natif

---

## 🚀 Lancement

Aucune installation requise. Il suffit d'ouvrir `index.html` dans un navigateur moderne :

```bash
# Option 1 : ouverture directe
open index.html

# Option 2 : serveur local (recommandé)
npx serve .
# ou
python -m http.server 8080
```

Puis accédez à `http://localhost:8080` dans votre navigateur.

---

## 📱 Compatibilité

| Navigateur      | Support |
| --------------- | ------- |
| Chrome / Edge   | ✅      |
| Firefox         | ✅      |
| Safari (iOS)    | ✅      |
| Android WebView | ✅      |

---

## 📊 Système de score

Le score est calculé dynamiquement en fonction du **niveau choisi** (multiplicateur `currentLevel + 1`) :

| Action                      | Points de base         |
| --------------------------- | ---------------------- |
| Paire éliminée (Tile Match) | 100 pts × niveau       |
| Paire chaînée (Chain Tiles) | 150 pts × niveau       |
| Déplacement (Stack & Clear) | 50 pts × niveau        |
| Triplet éliminé (Stack)     | 200 pts × niveau       |
| Liquide transvasé (Bottle)  | 20 pts × niveau        |
| Bonus fin (Bottle Sort)     | 500 pts × niveau       |
| Groupe de bulles (Bubble)   | 100 pts/bulle × niveau |
| Bulle flottante (Bubble)    | 50 pts × niveau        |

---

## 🙌 Crédits

Projet développé en HTML/CSS/JS pur. Conçu pour être léger, rapide et agréable sur mobile.
