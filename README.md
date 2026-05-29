# 🀄 Mahjam — Mini-Jeux Mobile

**Mahjam** est une application web mobile proposant des mini-jeux de puzzle et d'arcade,
jouables directement dans le navigateur, sans installation.

> Développé par **Claire Naudin** — [CND - Web is yours](https://portfolio-cnd.netlify.app/)

---

## 🎮 Jeux disponibles

### 🀄 Tile Match

> Le classique des jeux de tuiles.

Associez les tuiles identiques **libres** (non bloquées des deux côtés) pour les éliminer.
Videz l'intégralité du plateau pour gagner ! Le plateau est généré de manière
**garantie solvable** grâce à un algorithme de simulation inverse.

---

### 🎱 Stack & Clear

> Les colonnes de boules.

Déplacez les boules entre les colonnes pour former des **triplets** de même couleur en
sommet de colonne. Chaque triplet est automatiquement éliminé. Videz toutes les colonnes
pour remporter la victoire !

---

### 🃏 Chain Tiles

> Le match en chaîne.

Reliez deux tuiles identiques à l'aide d'un chemin comportant **au maximum 2 angles**.
Éliminez toutes les paires pour terminer le niveau. Un système de détection de deadlock
vous prévient si aucun chemin n'est disponible.

---

### 🧪 Bottle Sort

> Le tri de liquides colorés.

Transvasez les liquides entre les bouteilles pour regrouper chaque couleur dans
**une seule et même bouteille**. Attention à la capacité maximale (4 doses par bouteille) !
Les bouteilles sont rendues en **SVG dynamique**.

---

### 🫧 Bubble Shooter

> L'arcade classique revisitée.

Visez et tirez des bulles colorées pour former des groupes d'au moins **3 bulles identiques**
et les faire éclater. Les bulles non connectées au plafond tombent également. La partie se
termine si les bulles atteignent le lanceur. Rendu en **Canvas 2D** avec grille hexagonale.

---

### 🟦 Tetris

> Le classique des blocs.

Faites tomber les pièces, complétez des lignes et battez votre record ! Comprend un système
de **ghost piece** (projection), de **wall kick** pour les rotations, d'accélération
progressive, et de **hard drop**. Contrôles clavier et tactiles disponibles.

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
├── index.html # Point d'entrée principal
├── manifest.json # Manifeste PWA
├── sw.js # Service Worker (cache offline)
├── assets/
│ ├── icons/ # Icônes PWA (192×192, 512×512)
│ └── logo/ # Logos et visuels du projet
├── css/
│ ├── base.css # Variables globales, resets, animations
│ ├── layout.css # Structure des écrans et headers
│ ├── components.css # Boutons, cartes, overlays, toasts
│ ├── games.css # Styles spécifiques aux jeux (Stack, Bottle)
│ ├── tile-match.css # Styles Tile Match (pyramide mahjong)
│ ├── chain-tiles.css # Styles Chain Tiles + animation SVG chemin
│ ├── bubble-shooter.css # Styles du canvas Bubble Shooter
│ ├── tetris.css # Styles Tetris (canvas + contrôles tactiles)
│ └── pwa.css # Styles bannière install, hint iOS, offline bar
└── js/
├── core.js # Navigation, niveaux, utilitaires partagés
├── tile-match.js # Logique Tile Match (génération solvable)
├── stack-clear.js # Logique Stack & Clear
├── chain-tiles.js # Logique Chain Tiles (BFS chemin 2 angles)
├── bottle-sort.js # Logique Bottle Sort (SVG dynamique)
├── bubble-shooter.js # Logique Bubble Shooter (Canvas 2D, hex)
├── tetris.js # Logique Tetris (ghost, wall kick, drop)
└── pwa.js # Gestion PWA (install prompt, iOS hint, offline)

```

---

## ⚙️ Technologies utilisées

- **HTML5 / CSS3 / JavaScript Vanilla** — aucun framework
- **Canvas API** — rendu du Bubble Shooter et du Tetris
- **SVG dynamique** — rendu des bouteilles (Bottle Sort) et des chemins (Chain Tiles)
- **Service Worker** — mise en cache et support hors-ligne
- **Web App Manifest** — installation en tant que PWA
- **Responsive design** — adapté aux mobiles et tablettes
- **Touch events** — support tactile natif (Tetris, Bubble Shooter)
- **Algorithme de solvabilité** — génération garantie pour Tile Match

---

## 📲 Installation (PWA)

Mahjam est installable en tant qu'application native sur mobile et desktop :

| Plateforme       | Méthode                                         |
| ---------------- | ----------------------------------------------- |
| Android / Chrome | Bannière automatique → bouton **« Installer »** |
| iOS / Safari     | Menu Partager ⎋ → **« Sur l'écran d'accueil »** |
| Desktop / Chrome | Icône d'installation dans la barre d'adresse    |

Une fois installée, l'application fonctionne **entièrement hors-ligne** grâce au Service Worker.

---

## 🚀 Lancement

Aucune installation requise. Il suffit d'ouvrir `index.html` dans un navigateur moderne :

```bash
# Option 1 : ouverture directe
open index.html

# Option 2 : serveur local (recommandé pour la PWA)
npx serve .
# ou
python -m http.server 8080
```

Puis accédez à `http://localhost:8080` dans votre navigateur.

> ⚠️ Le Service Worker et le manifeste PWA nécessitent un serveur HTTP
> (même local). L'ouverture directe via `file://` ne les active pas.

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

Le score est calculé dynamiquement en fonction du **niveau choisi**
(multiplicateur `currentLevel + 1`) :

| Action                      | Points de base                                |
| --------------------------- | --------------------------------------------- |
| Paire éliminée (Tile Match) | 100 pts × niveau                              |
| Paire chaînée (Chain Tiles) | 150 pts × niveau                              |
| Déplacement (Stack & Clear) | 50 pts × niveau                               |
| Triplet éliminé (Stack)     | 200 pts × niveau                              |
| Liquide transvasé (Bottle)  | 20 pts × niveau                               |
| Bonus fin (Bottle Sort)     | 500 pts × niveau − malus mouvements           |
| Groupe de bulles (Bubble)   | 100 pts/bulle × niveau                        |
| Bulle flottante (Bubble)    | 50 pts × niveau                               |
| Ligne complète (Tetris)     | 100/300/500/800 pts × niveau interne × niveau |
| Soft drop (Tetris)          | 1 pt/case × niveau                            |
| Hard drop (Tetris)          | 2 pts/case × niveau                           |

---

## 🎮 Contrôles Tetris

| Action         | Clavier | Tactile     |
| -------------- | ------- | ----------- |
| Déplacer       | ← →     | Boutons ◀ ▶ |
| Rotation       | ↑       | Bouton 🔄   |
| Descente douce | ↓       | Bouton ▼    |
| Hard drop      | Espace  | Bouton ⬇    |

---

## 🙌 Crédits

Développé avec ❤️ en HTML / CSS / JS pur, sans dépendance externe.
Conçu pour être léger, rapide et agréable sur mobile.

**Claire Naudin** — Développeuse FullStack
🏢 [CND - Web is yours](https://portfolio-cnd.netlify.app/)
📅 Mai 2026
