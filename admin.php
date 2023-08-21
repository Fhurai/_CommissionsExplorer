<html>
<head>
	<title>Commission Explorer</title>
	<meta charset="utf-8"  />
	<meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">
	<link rel="stylesheet" href="css/admin.css">
	<link rel="stylesheet" href="css/modal.css">
</head>
<body>
	<noscript>Javascript required for website usage</noscript>
	<input type="hidden" name="admin" value=false />
	<div id="title">Admin Commissions Explorer</div>
	
	<div id="alert" class="hidden">
	<!-- If nb artists in sfw.json <> nb folders artists, show button to generate files and refresh Commissions Explorer -->
	Yo man, you got a problem in your config files. Time to refresh that !
	<button>Refresh config files</button>
	</div>
	<div id="stats">
	<!-- Stats for folders SFW/NSFW, Files SFW/NSFW, average file per artist SFW/NSFW -->
	</div>
	<div id="menu" class="hidden">
	<!-- Edit SFW state artists, edit Twitter link artists -->
	<button id="btn-sfw" for='modal-sfw'>Manage SFW</button>
	<input class="modal-state" id="modal-sfw" type="checkbox" />
	<div class="modal">
		<label class="modal-bg" for="modal-sfw"></label>
		<div class="modal-inner">
			<label class="modal-close" for="modal-sfw"></label>
			<div id="modal-sfw-content" class="modal-content"></div>
		</div>
	</div>
	
	<button id="btn-twitter" for='modal-twitter'>Manage Twitter</button>
	<input class="modal-state" id="modal-twitter" type="checkbox" />
	<div class="modal">
		<label class="modal-bg" for="modal-twitter"></label>
		<div class="modal-inner">
			<label class="modal-close" for="modal-twitter"></label>
			<div id="modal-twitter-content" class="modal-content"></div>
		</div>
	</div>
	</div>
</body>
<script type="text/javascript" src="js/admin.js"></script>
<script type="text/javascript" src="js/utilities.js"></script>
</html>