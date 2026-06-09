# AutoDeck

Interface automobile web inspirée du style visuel des interfaces embarquées modernes.  
Affichage plein écran en mode paysage — 100% statique, aucun build step.

**Fonctionnalités :**
- 🗺️ Carte — Google Maps Embed API (gratuite, sans facturation)
- 🎵 Musique — Spotify Web Playback SDK (Premium) + fallback iframe

---

## Démarrage rapide

1. Clonez ou téléchargez ce repo
2. Ouvrez `config.js` et renseignez vos clés (voir ci-dessous)
3. Déposez les fichiers sur n'importe quel hébergeur web statique (FTP, Netlify, GitHub Pages…)
4. Ouvrez `index.html` dans Chrome en mode paysage → profitez !

> **Aucun serveur Node.js, aucun build step.** Tout est HTML/CSS/JS vanilla.

---

## Configuration (`config.js`)

| Variable               | Description                                               | Obligatoire |
|------------------------|-----------------------------------------------------------|:-----------:|
| `PRODUCT_NAME`         | Nom affiché dans l'interface (ex: `"AutoDeck"`)           | —           |
| `ACCENT_COLOR`         | Couleur principale en hex (ex: `"#007AFF"`)               | —           |
| `GOOGLE_MAPS_API_KEY`  | Clé API Google Maps Embed (voir ci-dessous)               | Pour Maps   |
| `DEFAULT_LOCATION`     | Lieu par défaut (ex: `"Paris, France"`)                   | —           |
| `DEFAULT_LAT/LNG`      | Coordonnées du lieu par défaut                            | —           |
| `DEFAULT_ZOOM`         | Niveau de zoom (1–21)                                     | —           |
| `SPOTIFY_CLIENT_ID`    | Client ID de votre application Spotify (voir ci-dessous)  | Pour Spotify|
| `SPOTIFY_REDIRECT_URI` | URI de redirection OAuth (auto-détectée par défaut)       | Pour Spotify|

---

## Obtenir une clé Google Maps (Embed API — GRATUITE)

1. Rendez-vous sur [console.cloud.google.com](https://console.cloud.google.com/)
2. Créez un projet ou sélectionnez-en un existant
3. Activez l'API **"Maps Embed API"** (pas la Maps JavaScript API)
4. Dans "Identifiants", créez une clé API
5. **Sécurisez la clé** : dans les restrictions, choisissez "Référents HTTP" et ajoutez votre domaine (ex: `https://mon-domaine.com/*`)
6. Copiez la clé dans `config.js` → `GOOGLE_MAPS_API_KEY`

> ⚠️ La Maps **JavaScript** API est facturée au-delà du quota gratuit. Cet app utilise uniquement l'**Embed API** (iframe), qui est gratuite et sans quota strict.

---

## Configurer Spotify

1. Rendez-vous sur le [Dashboard développeur Spotify](https://developer.spotify.com/dashboard)
2. Créez une application (gratuit)
3. Dans les paramètres de l'app, ajoutez votre **URI de redirection** exacte  
   - En local : `http://localhost:PORT/` (ou `http://127.0.0.1:PORT/`)  
   - En production : `https://votre-domaine.com/`
4. Copiez le **Client ID** dans `config.js` → `SPOTIFY_CLIENT_ID`

> La lecture complète nécessite un compte Spotify **Premium**. Les utilisateurs gratuits verront un aperçu 30s via l'embed iframe.

---

## Déploiement FTP automatique (GitHub Actions)

### Secrets à créer dans GitHub

Dans votre repo GitHub : **Settings → Secrets and variables → Actions → New repository secret**

| Nom du secret  | Valeur                                                   |
|----------------|----------------------------------------------------------|
| `FTP_SERVER`   | Adresse de votre serveur FTP (ex: `ftp.mon-domaine.com`) |
| `FTP_USERNAME` | Identifiant FTP                                          |
| `FTP_PASSWORD` | Mot de passe FTP                                         |

> ⚠️ **NE JAMAIS** mettre ces identifiants dans le code source ou dans `config.js`.  
> Les secrets GitHub sont chiffrés et ne sont jamais exposés dans les logs.

### Pousser le repo

```bash
git remote add origin https://github.com/VOTRE_COMPTE/VOTRE_REPO.git
git push -u origin main
```

À chaque push sur `main`, GitHub Actions déploiera automatiquement les fichiers sur votre serveur FTP.

---

## Crédits

- **Icônes** : [Feather Icons](https://feathericons.com/) par Cole Bemis — licence MIT  
  Voir `LICENSE-feather.txt` pour le texte intégral de la licence.

- **Carte** : Google Maps Embed API

- **Musique** : Spotify Web Playback SDK

---

## Structure du projet

```
/
├── index.html
├── config.js              ← Votre configuration (clés API, etc.)
├── css/
│   ├── main.css           ← Variables, reset, layout
│   ├── sidebar.css        ← Dock/sidebar gauche
│   └── apps.css           ← Styles des vues applicatives
├── js/
│   ├── router.js          ← Routeur SPA (switch de vues)
│   ├── maps.js            ← Module carte
│   ├── spotify-auth.js    ← Auth Spotify PKCE
│   ├── spotify.js         ← Lecteur Spotify
│   └── app.js             ← Point d'entrée
├── .github/
│   └── workflows/
│       └── deploy.yml     ← CI/CD FTP automatique
├── LICENSE-feather.txt    ← Licence MIT Feather Icons
└── README.md
```
