
document.addEventListener("DOMContentLoaded", function() {
    var panoElement = document.getElementById('pano');
    var viewer = new Marzipano.Viewer(panoElement);
    var geometry = new Marzipano.EquirectGeometry([{ width: 8192, height: 4096 }]);
    var source = Marzipano.ImageUrlSource.fromString("/static/pano/middle_earth/0/pano.jpg");
    var scene = viewer.createScene({
        source: source,
        geometry: geometry,
        view: new Marzipano.RectilinearView() // Type de vue rectilinéaire
    });

    scene.switchTo();
})
