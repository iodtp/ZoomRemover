// ==UserScript==
// @name         Zoom In Remover
// @version      1.0
// @description  Get rid of new zoom in animation
// @author       Iodized Salt
// @include      http://*.koalabeast.com:*
// @include      http://*.jukejuice.com:*
// @include      http://*.newcompte.fr:*
// @include      https://*.koalabeast.com/game
// @include      https://*.koalabeast.com/game?*
// @include      https://tagpro.koalabeast.com/profile/*
// @grant       GM_getValue
// @grant       GM_setValue
// ==/UserScript==

if (window.location.pathname.includes('/profile/')){
    const lastCheckBox = document.getElementsByName('disableViewportScaling')[0].parentNode.parentNode;
    const newCheckBox = document.createElement('div');
    newCheckBox.classList.add('checkbox');
    const inputPart = document.createElement('input');
    const textNode = document.createTextNode(' Enable Zooming');
    const labelPart = document.createElement('label');
    inputPart.addEventListener('change', function() {
        const current = inputPart.checked;
        GM_setValue('zoomEnabled', current);
    });
    inputPart.type = 'checkbox';
    inputPart.name = 'disableZooming';
    inputPart.classList.add('js-cookie');
    inputPart.checked = GM_getValue('zoomEnabled', true);
    labelPart.appendChild(inputPart);
    labelPart.appendChild(textNode);
    newCheckBox.appendChild(labelPart);
    lastCheckBox.parentNode.insertBefore(newCheckBox, lastCheckBox.nextSibling);
}
else if (window.location.pathname.includes('/game') && !window.location.search.includes('replay') && !GM_getValue('zoomEnabled', true)){
    tagpro.ready(() => {
        let reverting = false;
        let revertingZoom = false;
        let revertingSpec = false;
        let allowZoomChange = false;
        let allowFollowChange = false;
        let zoom = 1;

        const viewportHandler = {
            set(target, prop, value) {
                if (prop === 'followPlayer') {
                    if (!reverting) {
                        reverting = true;
                        target[prop] = true;
                    } else if (allowFollowChange) {
                        allowFollowChange = false;
                        target[prop] = value;
                    }
                } else {
                    target[prop] = value;
                }
                return true;
            }
        };

        const tagproHandler = {
            set(target, prop, value) {
                if (prop === 'zoom') {
                    if (!revertingZoom) {
                        revertingZoom = true;
                        target[prop] = value;
                    } else if(allowZoomChange) {
                        allowZoomChange = false;
                        target[prop] = value;
                    }
                } else if(prop === 'spectator'){
                    if(value && !revertingSpec){
                        console.log(value);
                        revertingSpec = true;
                        allowFollowChange = true;
                        allowZoomChange = true;
                        target[prop] = value;
                        tagpro.viewport.followPlayer = false;
                        tagpro.viewport.centerLock = true;

                        zoom = Math.max(target.map.length * 40 / target.renderer.canvas_width, target.map[0].length * 40 / target.renderer.canvas_height);
                        tagpro.zoom = zoom;
                        document.addEventListener('keydown', function(event) {
                            if (event.key === 'c') {
                                allowFollowChange = true;
                                tagpro.viewport.followPlayer = false;
                                tagpro.viewport.centerLock = true;
                            } else if (event.key === '+' || event.key === '=') {
                                allowZoomChange = true;
                                zoom -= 0.025;
                                tagpro.zoom = zoom;
                            } else if (event.key === '-' || event.key === '_') {
                                allowZoomChange = true;
                                zoom += 0.025;
                                tagpro.zoom = zoom;
                            } else if (event.key === 'a' || event.key === 's') {
                                allowFollowChange = true;
                                tagpro.viewport.followPlayer = true;
                                tagpro.viewport.centerLock = false;
                            }
                        });
                    }
                    else{
                     target[prop] = value;
                    }
                } else {
                    target[prop] = value;
                }
                return true;
            }
        };

        tagpro.viewport = new Proxy(tagpro.viewport, viewportHandler);
        tagpro = new Proxy(tagpro, tagproHandler);

    });

}






