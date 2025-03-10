<!DOCTYPE html>
<html lang="en">
<!-- 
    Page principale de ComEx
    Auteur : Fhurai
    Version : 1.0
    Dernière mise à jour : 09/03/2025
-->

<head>
    <!-- Configuration de base -->
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Métadonnées SEO -->
    <meta name="description" content="ComEx - Plateforme de découverte et d'exploration de commissions">
    
    <!-- Titre de la page -->
    <title>Welcome | ComEx</title>
    
    <!-- Feuille de style principale -->
    <link rel="stylesheet" href="./assets/css/index.css">
</head>

<body>
    <!-- En-tête principal -->
    <header>
        <h1>ComEx</h1>
        <span>
            <button id="returnButton">Return</button>
        </span>
    </header>

    <!-- Contenu principal -->
    <main>
        <!-- Navigation et filtres -->
        <nav>
            <!-- Sélection SFW/NSFW -->
            <span>
                <input id="sfw" name="nsfw" type="radio" value="false">
                <label for="sfw">SFW</label>
            </span>
            <span>
                <input id="nsfw" name="nsfw" type="radio" value="true">
                <label for="nsfw">NSFW</label>
            </span>

            <!-- Barre de recherche et résultats -->
            <div>
            	<span>
                    <div id="results" name="results"></div>
                </span>
                <span>
                    <input id="search" name="search" type="text" placeholder="Search..."/>
                </span>
                <span>
                    <ul id="suggestions"></ul>
                </span>
            </div>
        </nav>

        <!-- Galerie de contenu (remplie dynamiquement) -->
        <div id="gallery"></div>

        <!-- Indicateur de chargement -->
        <div id="spinner" class="spinner">
            <div id="spinnerLoad" class="loading-text" hidden>Loading ...</div>
            <div id="spinnerNumber" class="loading-text"></div>
        </div>
    </main>

    <!-- Fond semi-transparent pour les modales -->
    <div id="backdrop"></div>

    <!-- Scripts principaux -->
    <script src="./assets/js/index.js"></script>
</body>
</html>