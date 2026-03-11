# 🤖 Prompt pour Claude / Cursor : Agent Immobilier Virtuel

Voici le prompt complet et structuré que tu peux copier-coller dans **Claude 3.5 Sonnet**, **Cursor Composer** (Ctrl+I) ou **Google Antigravity**. 

Ce prompt est conçu pour du "vibe coding" professionnel : il fixe des règles strictes sur la stack technique et l'architecture pour éviter que l'IA ne parte dans tous les sens.

---
*(Copie-colle tout le texte à partir d'ici 👇)*

📍 **CONTEXTE ET OBJECTIF**
Tu es un Développeur Full-Stack Senior expert en React, Next.js, Supabase et Vercel AI SDK.
Mon objectif est de créer un "Agent Immobilier Virtuel" pour mon portfolio d'agence web. 
Ce projet est une démonstration "Proof of Concept" (PoC) pour montrer aux agences immobilières comment un chatbot IA peut qualifier des leads et rechercher des biens immobiliers de manière autonome dans leur base de données.

🛠️ **STACK TECHNIQUE STRICTE**
- **Framework** : Next.js 14 ou 15 (App Router obligatoire)
- **Langage** : TypeScript
- **Styling** : Tailwind CSS + shadcn/ui (pour les composants de base comme les boutons, inputs, cards)
- **Icônes** : Lucide React
- **Base de données** : Supabase (PostgreSQL)
- **IA** : Vercel AI SDK (`ai` et `@ai-sdk/openai`) avec le modèle `gpt-4o` ou `gpt-4o-mini`

💾 **SCHÉMA DE BASE DE DONNÉES (Supabase)**
Nous aurons une seule table `properties` avec les colonnes suivantes :
- `id` (uuid, primary key)
- `title` (text) : Titre de l'annonce (ex: "Superbe appartement lumineux")
- `description` (text)
- `price` (integer) : Prix en euros
- `location` (text) : Ville ou quartier (ex: "Ixelles", "Uccle")
- `bedrooms` (integer)
- `bathrooms` (integer)
- `type` (text) : "house" ou "apartment"
- `image_url` (text) : Lien d'une fausse image (tu pourras utiliser des placeholders de type Unsplash)
- `is_available` (boolean)

*(Note pour l'IA : Tu devras me fournir le script SQL pour créer cette table et insérer 10 fausses données pertinentes pour Bruxelles).*

🎨 **UX / UI ATTENDUE**
Je veux une interface moderne, propre et divisée en deux sections principales (split screen sur desktop, empilé sur mobile) :
1. **Partie Gauche (ou top)** : L'interface de Chat. Un design similaire à ChatGPT, épuré. L'utilisateur discute avec l'agent.
2. **Partie Droite (ou bottom)** : Affichage dynamique des résultats. Quand l'agent trouve des biens, ils s'affichent ici sous forme de belles "Cards" (image en haut, prix, localisation, lits/bains).

⚙️ **MÉCANIQUE DE L'IA (LE CŒUR DU PROJET)**
L'application ne doit pas être un simple chatbot texte. Elle doit utiliser le **Tool Calling (Function Calling)** du Vercel AI SDK.
1. L'utilisateur demande : "Je cherche une maison à Ixelles avec 3 chambres pour moins de 600 000€".
2. L'IA comprend l'intention et déclenche un `tool` appelé `searchProperties`.
3. Ce tool prend les paramètres extraits du texte (location="Ixelles", minBedrooms=3, maxPrice=600000) et fait une requête à Supabase.
4. Les résultats sont renvoyés à l'IA.
5. L'IA utilise les résultats pour formuler une réponse naturelle ET rend un composant UI React (Generative UI) pour afficher les cartes des biens immobiliers dans le chat ou sur le panneau de droite.

📋 **PLAN D'ACTION ÉTAPE PAR ÉTAPE**
Agis comme mon guide et mon codeur. 

**Étape 1 : Initialisation & BDD**
Donne-moi le code SQL exact à exécuter dans mon dashboard Supabase pour créer la table `properties` et insérer 10 biens fictifs à Bruxelles.

**Étape 2 : Configuration du projet**
Donne-moi les commandes exactes pour initialiser le projet Next.js et installer les dépendances nécessaires (Tailwind, shadcn, Vercel AI, Supabase client).

**Étape 3 : Code d'intégration Supabase**
Crée le fichier `utils/supabase/client.ts` pour la connexion. (Je gérerai les variables d'environnement `NEXT_PUBLIC_SUPABASE_URL`, etc.).

**Étape 4 : L'API Route de l'IA**
Crée le fichier route (ex: `app/api/chat/route.ts`) utilisant le Vercel AI SDK. Implémente le tool `searchProperties` qui fait la requête Supabase en fonction des arguments générés par l'IA.

**Étape 5 : Le Frontend UI**
Crée la page principale (`app/page.tsx`) avec l'interface Chat et l'affichage des annonces immobilières. Utilise `useChat` du Vercel AI SDK.

**Directives de code :**
- Rédige un code modulaire et propre.
- Gère les états de chargement (loading states) quand l'IA réfléchit ou cherche dans la base de données.
- Ajoute des prompts système forts : l'Agent doit se comporter comme un professionnel de l'immobilier, poli et concis.

Es-tu prêt ? Commence par l'Étape 1 et donne-moi le code SQL, puis enchaîne sur l'Étape 2.
