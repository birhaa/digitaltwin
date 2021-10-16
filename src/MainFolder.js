import * as dat from 'dat.gui';

dat.GUI.prototype.removeFolder = function (name) {
    var folder = this.__folders[name];
    if (!folder) {
        return;
    }
    folder.close();
    this.__ul.removeChild(folder.domElement.parentNode);
    delete this.__folders[name];
    this.onResize();
};

var params = {
    nCols: 8,
    nColsMask: 8,
    useOffset: false,
    mirror: false,
    mirrorHalf: false,
    mirrorOffset: false,
    mask: false,
    animationSpeed: 0,
};

class MainFolder {
    constructor(gui, resetFunction) {
        this.mainFolder = gui.addFolder('MAIN');
    }

    getFolder() {
        return this.mainFolder;
    }

    initProps(resetFunction) {
        this.mainFolder.add(params, 'nCols', 1, 100, 1).onChange(() => {
            resetFunction(this.mainFolder, params);
        });
        this.mainFolder.add(params, 'nColsMask', 1, 100, 1).onChange(() => {
            resetFunction(this.mainFolder, params);
        });
        this.mainFolder.add(params, 'mirror').onChange(() => {
            resetFunction(this.mainFolder, params);
        });
        resetFunction(this.mainFolder, params);
        this.mainFolder.add(params, 'mirrorHalf').onChange(() => {
            resetFunction(this.mainFolder, params);
        });
        resetFunction(this.mainFolder, params);
        this.mainFolder.add(params, 'useOffset').onChange(() => {
            resetFunction(this.mainFolder, params);
        });
        resetFunction(this.mainFolder, params);
        this.mainFolder.add(params, 'mirrorOffset').onChange(() => {
            resetFunction(this.mainFolder, params);
        });
        this.mainFolder.add(params, 'mask').onChange(() => {
            resetFunction(this.mainFolder, params);
        });
        this.mainFolder.add(params, 'animationSpeed', 0, 5, 0.1);

        this.mainFolder.open();
    }

    getSettings() {
        return params;
    }
}

export { MainFolder };
