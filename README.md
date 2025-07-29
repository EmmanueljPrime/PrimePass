# PrimePass - Générateur de Mots de Passe Sécurisés

PrimePass est un générateur de mots de passe moderne et complet avec analyse de sécurité avancée et options de hachage. Conçu avec Next.js et une interface utilisateur moderne.

## 📋 Table des Matières

- [Fonctionnalités](#fonctionnalités)
- [Installation](#installation)
- [Guide d'utilisation](#guide-dutilisation)
- [Architecture technique](#architecture-technique)
- [Sécurité](#sécurité)
- [API Reference](#api-reference)

## ✨ Fonctionnalités

### 🎲 Générateur de Mots de Passe

**Comment ça fonctionne :**
- **Algorithme de génération** : Utilise `Math.random()` avec un charset personnalisable
- **Longueur variable** : De 4 à 128 caractères via un slider interactif
- **Types de caractères configurables** :
  - Majuscules (A-Z)
  - Minuscules (a-z) 
  - Chiffres (0-9)
  - Symboles (!@#$%^&*()_+-=[]{}|;:,.<>?)

**Options avancées :**
- **Exclusion des caractères similaires** : Retire `i, l, 1, L, o, 0, O` pour éviter la confusion
- **Exclusion des caractères ambigus** : Retire `{}[]()\/'"~,;<>.` pour une meilleure lisibilité
- **Génération instantanée** : Nouveau mot de passe à chaque clic sur "Générer"

**Code technique :**
\`\`\`typescript
const generatePassword = () => {
  let charset = ""
  if (options.includeLowercase) charset += "abcdefghijklmnopqrstuvwxyz"
  if (options.includeUppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  // ... autres caractères
  
  let result = ""
  for (let i = 0; i < options.length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return result
}
\`\`\`

### 🔍 Analyseur de Sécurité

**Système de scoring (0-100 points) :**

| Critère | Points | Description |
|---------|--------|-------------|
| Longueur ≥12 | 25 pts | Longueur optimale |
| Longueur ≥8 | 15 pts | Longueur minimale |
| Minuscules | 15 pts | Présence de a-z |
| Majuscules | 15 pts | Présence de A-Z |
| Chiffres | 15 pts | Présence de 0-9 |
| Symboles | 20 pts | Caractères spéciaux |
| Bonus longueur ≥16 | 10 pts | Longueur exceptionnelle |

**Pénalités :**
- **Caractères répétitifs** (-10 pts) : Détecte `aaa`, `111`, etc.
- **Séquences communes** (-15 pts) : Détecte `123`, `abc`, `qwe`

**Niveaux de sécurité :**
- 🔴 **Très faible** (0-19) : Mot de passe dangereux
- 🟠 **Faible** (20-39) : Sécurité insuffisante  
- 🟡 **Moyen** (40-59) : Sécurité acceptable
- 🔵 **Fort** (60-79) : Bonne sécurité
- 🟢 **Très fort** (80-100) : Sécurité optimale

**Feedback intelligent :**
L'analyseur fournit des suggestions personnalisées :
- "Utilisez au moins 8 caractères"
- "Ajoutez des lettres majuscules"
- "Évitez les caractères répétitifs"

### 🔐 Système de Hachage

**Algorithmes supportés :**

#### 1. **bcrypt (Recommandé)**
- **Usage** : Stockage sécurisé des mots de passe
- **Rounds configurables** : 4-15 (défaut: 12)
- **Résistance** : Résistant aux attaques par force brute
- **Format** : `$2b$12$salt...hash`

\`\`\`typescript
// Simulation bcrypt
const salt = crypto.randomBytes(16).toString("hex")
const hash = `$2b$${rounds}$${salt}${crypto.createHash("sha256").update(pwd + salt).digest("hex")}`
\`\`\`

#### 2. **SHA-256**
- **Usage** : Hachage rapide, intégrité des données
- **Sortie** : 64 caractères hexadécimaux
- **Vitesse** : Très rapide
- **Sécurité** : Bon pour l'intégrité, pas pour les mots de passe

#### 3. **SHA-512** 
- **Usage** : Version renforcée de SHA-256
- **Sortie** : 128 caractères hexadécimaux
- **Avantage** : Plus de bits de sécurité

#### 4. **MD5 (Déprécié)**
- **Status** : ⚠️ Non sécurisé - affiché à titre éducatif
- **Problème** : Vulnérable aux collisions
- **Usage** : Checksums uniquement

### 🎨 Interface Utilisateur

**Design System :**
- **Palette de couleurs** : Dégradés purple/blue sur fond sombre
- **Composants** : shadcn/ui pour la cohérence
- **Typographie** : Font mono pour les mots de passe
- **Icônes** : Lucide React

**Fonctionnalités UX :**
- **Copie en un clic** : Bouton copy sur tous les champs
- **Visibilité toggle** : Boutons œil pour masquer/afficher
- **Feedback visuel** : Toasts pour les actions
- **Responsive** : Adaptatif mobile/desktop

## 🚀 Installation

### Prérequis
- Node.js 18+
- npm ou yarn

### Étapes d'installation

1. **Cloner le projet**
\`\`\`bash
git clone <repository-url>
cd primepass
\`\`\`

2. **Installer les dépendances**
\`\`\`bash
npm install
# ou
yarn install
\`\`\`

3. **Lancer en développement**
\`\`\`bash
npm run dev
# ou
yarn dev
\`\`\`

4. **Build pour production**
\`\`\`bash
npm run build
npm start
\`\`\`

## 📖 Guide d'Utilisation

### 1. Génération de Mot de Passe

1. **Configurer les options** :
   - Ajuster la longueur avec le slider
   - Activer/désactiver les types de caractères
   - Configurer les exclusions si nécessaire

2. **Générer** :
   - Cliquer sur "Générer un nouveau mot de passe"
   - Le mot de passe apparaît avec son analyse de sécurité

3. **Copier** :
   - Utiliser le bouton copy pour copier dans le presse-papiers
   - Toggle la visibilité avec le bouton œil

### 2. Analyse de Mot de Passe Existant

1. **Saisir le mot de passe** dans l'onglet "Analyseur"
2. **Consulter le score** et les métriques détaillées
3. **Suivre les suggestions** d'amélioration
4. **Vérifier les caractéristiques** (longueur, types de caractères)

### 3. Hachage de Mot de Passe

1. **Choisir l'algorithme** approprié :
   - bcrypt pour le stockage sécurisé
   - SHA pour l'intégrité des données
2. **Configurer les paramètres** (rounds bcrypt)
3. **Hacher** le mot de passe généré ou analysé
4. **Copier le hash** pour utilisation

## 🏗️ Architecture Technique

### Structure des Fichiers
\`\`\`
app/
├── page.tsx          # Composant principal
├── layout.tsx        # Layout global
└── globals.css       # Styles globaux

components/ui/         # Composants shadcn/ui
├── button.tsx
├── card.tsx
├── input.tsx
└── ...

hooks/
└── use-toast.ts      # Hook pour les notifications
\`\`\`

### Technologies Utilisées

- **Framework** : Next.js 14 (App Router)
- **UI Library** : shadcn/ui + Radix UI
- **Styling** : Tailwind CSS
- **Icons** : Lucide React
- **Crypto** : Node.js crypto module
- **TypeScript** : Type safety

### État de l'Application

\`\`\`typescript
interface PasswordOptions {
  length: number
  includeUppercase: boolean
  includeLowercase: boolean
  includeNumbers: boolean
  includeSymbols: boolean
  excludeSimilar: boolean
  excludeAmbiguous: boolean
}

interface PasswordStrength {
  score: number
  label: string
  color: string
  feedback: string[]
}
\`\`\`

## 🔒 Sécurité

### Bonnes Pratiques Implémentées

1. **Génération cryptographique** : Utilisation de `crypto.randomBytes()`
2. **Pas de stockage** : Aucun mot de passe n'est sauvegardé
3. **Hachage sécurisé** : bcrypt avec salt automatique
4. **Validation côté client** : Vérifications en temps réel

### Recommandations d'Usage

- **Utilisez bcrypt** pour stocker les mots de passe
- **Longueur minimale** : 12 caractères recommandés
- **Tous les types de caractères** : Pour une sécurité maximale
- **Pas de réutilisation** : Générez un mot de passe unique par service

### Limitations de Sécurité

- **Génération côté client** : Pour une sécurité maximale, générez côté serveur
- **bcrypt simulé** : Implémentation simplifiée, utilisez une vraie librairie bcrypt en production
- **Pas de vérification de fuites** : N'intègre pas HaveIBeenPwned

## 📚 API Reference

### Fonctions Principales

#### `generatePassword(options: PasswordOptions): string`
Génère un mot de passe selon les options spécifiées.

#### `analyzePassword(password: string): PasswordStrength`
Analyse la force d'un mot de passe et retourne un score avec feedback.

#### `hashPassword(password: string, algorithm: string): Promise<string>`
Hache un mot de passe avec l'algorithme spécifié.

### Hooks Personnalisés

#### `useToast()`
Hook pour afficher des notifications toast.

\`\`\`typescript
const { toast } = useToast()
toast({
  title: "Succès",
  description: "Mot de passe copié",
})
\`\`\`

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

Pour toute question ou problème :
- Ouvrir une issue sur GitHub
- Consulter la documentation
- Contacter l'équipe de développement

---

**PrimePass** - Votre sécurité, notre priorité 🔐

**PrimePass** - Votre sécurité, notre priorité 🔐

 
 
