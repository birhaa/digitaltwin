

import * as dat from 'dat.gui';


dat.GUI.prototype.removeFolder = function(name) {
  var folder = this.__folders[name];
  if (!folder) {
    return;
  }
  folder.close();
  this.__ul.removeChild(folder.domElement.parentNode);
  delete this.__folders[name];
  this.onResize();
}



const settings = {
    useOffset : true,
    stripes: 0.0,
  	metalness: 1.0,
  	roughness: 0.4,
  	ambientIntensity: 0.2,
  	aoMapIntensity: 1.0,
  	envMapIntensity: 1.0,
  	displacementScale: 0.1,
  	normalScale: 0.0,
    color1: 0xffffff,
    playWave : false,
    waveSpeed : 1.0,
    waveSizeX : 0.00,
    waveSizeY : 0.00,
    waveFrequency : 1.0,
    rainbowX : 0.0,
    rainbowY : 0.0,
    rainbowZ : 0.0,
    blurRadius : 0.0,
    blurResX : 0.0,
    blurResY : 0.0
};

const params = {
    color1: 0xffffff,
    rainbowX : 0.0,
    rainbowY : 0.0,
    rainbowZ : 0.0,
    blurRadius : 0.0,
    blurResX : 0.0,
    blurResY : 0.0
};


class MaterialFolder{

  constructor(material, materialShader, gui, name){
    gui.removeFolder(name);
    this.mainFolder = gui.addFolder( name );

    this.mainFolder
    .add(settings, 'stripes', 0.0, 10.0)
    .onChange( () => materialShader.uniforms.size.value = settings.stripes );
    this.mainFolder.add(settings, 'useOffset')
    .onChange( () =>  materialShader.uniforms.useOffset.value = settings.useOffset );

    this.mainFolder.add( settings, "metalness" ).min( 0 ).max( 1 ).onChange( function ( value ) {
      material.metalness = value;
    } );
    this.mainFolder.add( settings, "roughness" ).min( 0 ).max( 1 ).onChange( function ( value ) {
      material.roughness = value;
    } );
    // this.mainFolder.add( settings, "ambientIntensity" ).min( 0 ).max( 1 ).onChange( function ( value ) {
    //   ambientLight.intensity = value;
    // } );
    this.mainFolder.add( settings, "displacementScale" ).min( 0 ).max( 3.0 ).onChange( function ( value ) {
      material.displacementScale = value;
    } );
    this.mainFolder.add( settings, "normalScale" ).min( - 1 ).max( 1 ).onChange( function ( value ) {
      material.normalScale.set( 1, - 1 ).multiplyScalar( value );
    } );
    this.mainFolder
    .addColor( settings, 'color1' )
    .onChange( () => material.color.setHex(settings.color1) );
    this.mainFolder.add(settings, 'playWave')
    .onChange( () =>  materialShader.uniforms.playWave.value = settings.playWave );
    this.mainFolder.add(settings, 'waveSpeed', 0.0,5.0)
    .onChange( () =>  materialShader.uniforms.waveSpeed.value = settings.waveSpeed );
    this.mainFolder.add(settings, 'waveFrequency', 0.0,100.0)
    .onChange( () =>  materialShader.uniforms.waveFrequency.value = settings.waveFrequency );
    this.mainFolder.add(settings, 'waveSizeX', 0.0,0.1)
    .onChange( () =>  materialShader.uniforms.waveSize.value.x = settings.waveSizeX );
    this.mainFolder.add(settings, 'waveSizeY', 0.0,0.1)
    .onChange( () =>  materialShader.uniforms.waveSize.value.y = settings.waveSizeY );
    this.mainFolder.add(settings, 'rainbowX', 0.0, 1.0)
    .onChange( () =>  materialShader.uniforms.rainbow1Dir.value.x = settings.rainbowX );
    this.mainFolder.add(settings, 'rainbowY', 0.0, 1.0)
    .onChange( () =>  materialShader.uniforms.rainbow1Dir.value.y = settings.rainbowY );
    this.mainFolder.add(settings, 'rainbowZ', 0.0, 1.0)
    .onChange( () =>  materialShader.uniforms.rainbow1Dir.value.z = settings.rainbowZ );
    this.mainFolder.add(settings, "blurRadius", 0.0, 5.0)
    .onChange( () =>  materialShader.uniforms.blurRadius1.value = settings.blurRadius );
    this.mainFolder.add(settings, "blurResX", 0.0, 1000.0)
    .onChange( () =>  materialShader.uniforms.blurRes1.value.x = settings.blurResX );
    this.mainFolder.add(settings, "blurResY", 0.0, 1000.0)
    .onChange( () =>  materialShader.uniforms.blurRes1.value.y = settings.blurResY );

    this.folder1 = this.mainFolder.addFolder( 'STRIPE' );
    this.folder1.add(params, 'rainbowX', 0.0, 1.0)
    .onChange( () =>  materialShader.uniforms.rainbow2Dir.value.x = params.rainbowX );
    this.folder1.add(params, 'rainbowY', 0.0, 1.0)
    .onChange( () =>  materialShader.uniforms.rainbow2Dir.value.y = params.rainbowY );
    this.folder1.add(params, 'rainbowZ', 0.0, 1.0)
    .onChange( () =>  materialShader.uniforms.rainbow2Dir.value.z = params.rainbowZ );
    this.folder1.add(params, "blurRadius", 0.0, 5.0)
    .onChange( () =>  materialShader.uniforms.blurRadius2.value = params.blurRadius );
    this.folder1.add(params, "blurResX", 0.0, 1000.0)
    .onChange( () =>  materialShader.uniforms.blurRes2.value.x = params.blurResX );
    this.folder1.add(params, "blurResY", 0.0, 1000.0)
    .onChange( () =>  materialShader.uniforms.blurRes2.value.y = params.blurResY );


    this.mainFolder.open();

  }


}

export {
  MaterialFolder,
  settings
}
