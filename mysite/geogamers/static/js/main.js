
document.addEventListener("DOMContentLoaded", function() {



    let panoElement = document.getElementById("pano");
    let viewer = new Marzipano.Viewer(panoElement);
    let geometry = new Marzipano.EquirectGeometry([{ width: 8192, height: 4096 }]);
    let source = Marzipano.ImageUrlSource.fromString("/static/pano/middle_earth/0/pano.jpg");
    let scene = viewer.createScene({
        source: source,
        geometry: geometry,
        view: new Marzipano.RectilinearView()
    });
    scene.switchTo();

    let devChangePanoButton = document.getElementById("dev_change_pano_button");
    devChangePanoButton.addEventListener("click", function(e) {
        geometry = new Marzipano.EquirectGeometry([{ width: 7168, height: 3584 }]);
        source = Marzipano.ImageUrlSource.fromString("/static/pano/sea_of_thieves/0/pano.jpg");
        scene = viewer.createScene({
            source: source,
            geometry: geometry,
            view: new Marzipano.RectilinearView()
        });
        scene.switchTo();
    });
})
