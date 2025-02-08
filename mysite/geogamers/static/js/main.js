
document.addEventListener("DOMContentLoaded", function() {
    // console.log("DOM chargé");
	// var panoElement = document.getElementById('pano');
    // console.log("panoElement trouvé :", panoElement);
	// var viewerOpts = {
	// 	controls: {
	// 		mouseViewMode: 'drag'
	// 	}
	// };
	
	// var viewer = new Marzipano.Viewer(panoElement, viewerOpts);
    // console.log("Viewer créé :", viewer);
	
	// var levels = [
	// 		{ tileSize: 512, size: 1024 },
	// 		{ tileSize: 512, size: 2048 }
	// ];
    // console.log("Levels définis :", levels);
	
	// var geometry = new Marzipano.EquirectGeometry(levels);
    // console.log("Geometry créée :", geometry);
	// var source = Marzipano.ImageUrlSource.fromString("/static/tiles/{z}/{f}/{y}/{x}.jpg")
    // source._loadTile = function(tile, done) {
    //     console.log("Tentative de chargement de la tuile :", tile);
    //     done(null);
    // };
    // console.log("Source définie :", source);
	// var view = new Marzipano.RectilinearView();
    // // var initialView = new Marzipano.RectilinearView({ yaw: 0, pitch: 0, fov: Math.PI/2 });
    // console.log("View créée :", view);
	
	// var scene = viewer.createScene({
	// 		source: source,
	// 		geometry: geometry,
	// 		view: view
	// });
    // console.log("Scene créée :", scene);
    // scene.switchTo();
    // console.log("Scene activée !");

    var panoElement = document.getElementById('pano');

    var viewer = new Marzipano.Viewer(panoElement);

    var geometry = new Marzipano.EquirectGeometry([{ width: 4000, height: 2000 }]);

    var source = Marzipano.ImageUrlSource.fromString("/static/tiles/middle_earth/middle_earth.jpg");

    var scene = viewer.createScene({
        source: source,
        geometry: geometry,
        view: new Marzipano.RectilinearView() // Type de vue rectilinéaire
    });

    scene.switchTo();
})
