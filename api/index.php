<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Index | Comex</title>
</head>
<body>
    <header>
        <h1>Comex - Local</h1>
    </header>
    <main>
        <ul>
            <li>
                <h3>Artists</h3>
                <span><a target="_blank" href="./artists.php">SFW</a> : <a target="_blank" href="./artists.php?isNsfw=true">NSFW</a></span>
            </li>
            <li>
                <h3>Artworks</h3>
                <span>
                    <form action="./artworks.php" method="POST">
                        <label>Artist name</label>&nbsp;
                        <input id="artist" name="artist" />
                        <input type="submit" value="submit"/>
                    </form>
                </span>
            </li>
            <li>
                <h3>Thumbnail</h3>
                <span>
                    <form action="./thumbnail.php" method="POST">
                        <label>Artwork path</label>&nbsp;
                        <input id="artwork" name="artwork"/>
                        <input type="submit" value="submit"/>
                    </form>
                </span>
            </li>
        </ul>
    </main>
    <footer>

    </footer>
</body>
</html>