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

const startSettingsMaterial1 = {
    useOffset: true,
    stripes: 0.0,
    metalness: 0.4,
    roughness: 0.4,
    ambientIntensity: 0.2,
    aoMapIntensity: 1.0,
    envMapIntensity: 1.0,
    displacementScale: 0.1,
    normalScale: 0.0,
    color1: 0xffffff,
    playWave: false,
    waveSpeed: 1.0,
    waveSizeX: 0.0,
    waveSizeY: 0.0,
    waveFrequency: 1.0,
    rainbowX: 0.0,
    rainbowY: 0.0,
    rainbowZ: 0.0,
    blurRadius: 0.0,
    blurResX: 0.0,
    blurResY: 0.0,
};

const startSettingsMaterial2 = {
    useOffset: true,
    stripes: 0.0,
    metalness: 0.0,
    roughness: 0.0,
    ambientIntensity: 0.0,
    aoMapIntensity: 1.0,
    envMapIntensity: 1.0,
    displacementScale: 0.0,
    normalScale: 0.0,
    color1: 0xffffff,
    playWave: false,
    waveSpeed: 1.0,
    waveSizeX: 0.0,
    waveSizeY: 0.0,
    waveFrequency: 1.0,
    rainbowX: 0.0,
    rainbowY: 0.0,
    rainbowZ: 0.0,
    blurRadius: 0.0,
    blurResX: 0.0,
    blurResY: 0.0,
};

class MaterialFolder {
    constructor(gui, name, isMaterial1) {
        this.gui = gui;
        this.name = name;
        this.settings = isMaterial1
            ? startSettingsMaterial1
            : startSettingsMaterial2;

        this.params = {
            color1: 0xffffff,
            rainbowX: 0.0,
            rainbowY: 0.0,
            rainbowZ: 0.0,
            blurRadius: 0.0,
            blurResX: 0.0,
            blurResY: 0.0,
        };
    }

    initShaderProps(material, materialShader) {
        this.gui.removeFolder(this.name);
        this.mainFolder = this.gui.addFolder(this.name);
        this.materialShader = materialShader;

        this.mainFolder
            .add(this.settings, 'stripes', 0.0, 10.0)
            .onChange(
                () =>
                    (materialShader.uniforms.size.value = this.settings.stripes)
            );

        this.mainFolder
            .add(this.settings, 'useOffset')
            .onChange(
                () =>
                    (materialShader.uniforms.useOffset.value =
                        this.settings.useOffset)
            );

        this.mainFolder
            .add(this.settings, 'metalness')
            .min(0)
            .max(1)
            .onChange(function (value) {
                material.metalness = value;
            });

        this.mainFolder
            .add(this.settings, 'roughness')
            .min(0)
            .max(1)
            .onChange(function (value) {
                material.roughness = value;
            });

        // this.mainFolder.add( this.settings, "ambientIntensity" ).min( 0 ).max( 1 ).onChange( function ( value ) {
        //   ambientLight.intensity = value;
        // } );
        this.mainFolder
            .add(this.settings, 'displacementScale')
            .min(0)
            .max(3.0)
            .onChange(function (value) {
                material.displacementScale = value;
            });

        this.mainFolder
            .add(this.settings, 'normalScale')
            .min(-1)
            .max(1)
            .onChange(function (value) {
                material.normalScale.set(1, -1).multiplyScalar(value);
            });

        this.mainFolder
            .addColor(this.settings, 'color1')
            .onChange(() => material.color.setHex(this.settings.color1));

        this.mainFolder
            .add(this.settings, 'playWave')
            .onChange(
                () =>
                    (materialShader.uniforms.playWave.value =
                        this.settings.playWave)
            );

        this.mainFolder
            .add(this.settings, 'waveSpeed', 0.0, 5.0)
            .onChange(
                () =>
                    (materialShader.uniforms.waveSpeed.value =
                        this.settings.waveSpeed)
            );

        this.mainFolder
            .add(this.settings, 'waveFrequency', 0.0, 100.0)
            .onChange(
                () =>
                    (materialShader.uniforms.waveFrequency.value =
                        this.settings.waveFrequency)
            );

        this.mainFolder
            .add(this.settings, 'waveSizeX', 0.0, 0.1)
            .onChange(
                () =>
                    (materialShader.uniforms.waveSize.value.x =
                        this.settings.waveSizeX)
            );

        this.mainFolder
            .add(this.settings, 'waveSizeY', 0.0, 0.1)
            .onChange(
                () =>
                    (materialShader.uniforms.waveSize.value.y =
                        this.settings.waveSizeY)
            );

        this.mainFolder
            .add(this.settings, 'rainbowX', 0.0, 1.0)
            .onChange(
                () =>
                    (materialShader.uniforms.rainbow1Dir.value.x =
                        this.settings.rainbowX)
            );

        this.mainFolder
            .add(this.settings, 'rainbowY', 0.0, 1.0)
            .onChange(
                () =>
                    (materialShader.uniforms.rainbow1Dir.value.y =
                        this.settings.rainbowY)
            );

        this.mainFolder
            .add(this.settings, 'rainbowZ', 0.0, 1.0)
            .onChange(
                () =>
                    (materialShader.uniforms.rainbow1Dir.value.z =
                        this.settings.rainbowZ)
            );

        this.mainFolder
            .add(this.settings, 'blurRadius', 0.0, 5.0)
            .onChange(
                () =>
                    (materialShader.uniforms.blurRadius1.value =
                        this.settings.blurRadius)
            );

        this.mainFolder
            .add(this.settings, 'blurResX', 0.0, 1000.0)
            .onChange(
                () =>
                    (materialShader.uniforms.blurRes1.value.x =
                        this.settings.blurResX)
            );

        this.mainFolder
            .add(this.settings, 'blurResY', 0.0, 1000.0)
            .onChange(
                () =>
                    (materialShader.uniforms.blurRes1.value.y =
                        this.settings.blurResY)
            );

        this.folder1 = this.mainFolder.addFolder('STRIPE');

        this.folder1
            .add(this.params, 'rainbowX', 0.0, 1.0)
            .onChange(
                () =>
                    (materialShader.uniforms.rainbow2Dir.value.x =
                        this.params.rainbowX)
            );

        this.folder1
            .add(this.params, 'rainbowY', 0.0, 1.0)
            .onChange(
                () =>
                    (materialShader.uniforms.rainbow2Dir.value.y =
                        this.params.rainbowY)
            );

        this.folder1
            .add(this.params, 'rainbowZ', 0.0, 1.0)
            .onChange(
                () =>
                    (materialShader.uniforms.rainbow2Dir.value.z =
                        this.params.rainbowZ)
            );

        this.folder1
            .add(this.params, 'blurRadius', 0.0, 5.0)
            .onChange(
                () =>
                    (materialShader.uniforms.blurRadius2.value =
                        this.params.blurRadius)
            );

        this.folder1
            .add(this.params, 'blurResX', 0.0, 1000.0)
            .onChange(
                () =>
                    (materialShader.uniforms.blurRes2.value.x =
                        this.params.blurResX)
            );

        this.folder1
            .add(this.params, 'blurResY', 0.0, 1000.0)
            .onChange(
                () =>
                    (materialShader.uniforms.blurRes2.value.y =
                        this.params.blurResY)
            );

        this.mainFolder.open();
    }

    getShader() {
        return this.materialShader;
    }

    getSettings() {
        return this.settings;
    }

    setSettings(settings) {
        this.settings = settings;
    }
}

export { MaterialFolder };
