

import * as dat from 'dat.gui';


const globalParams = {
  useOffset : true,
  size: 5.6

}

const params = {
    color1: 0xffffff,
    rainbowX : 0.0,
    rainbowY : 0.0,
    rainbowZ : 0.0,
    blurRadius : 0.0,
    blurResX : 0.0,
    blurResY : 0.0
};

const params2 = {
    color1: 0xffffff,
    playWave : true,
    waveSpeed : 1.0,
    waveSizeX : 0.01,
    waveSizeY : 0.01,
    waveFrequency : 1.0,
    rainbowX : 0.1,
    rainbowY : 0.0,
    rainbowZ : 0.54,
    blurRadius : 0.0,
    blurResX : 0.0,
    blurResY : 0.0
};



export default class MaterialFolder{

  constructor(material, materialShader, gui, name){
    this.mainFolder = gui.addFolder( name );
    this.folder = this.mainFolder.addFolder( 'PROPERTIES' );
    this.folder1 = this.mainFolder.addFolder( 'STRIPE 1' );
    this.folder2 = this.mainFolder.addFolder( 'STRIPE 2' );

    console.log("shader", materialShader)

    this.folder
    .add(globalParams, 'size', 0.0, 1.0)
    .onChange( () => materialShader.uniforms.size.value = globalParams.size );
    this.folder.add(globalParams, 'useOffset')
    .onChange( () =>  materialShader.uniforms.useOffset.value = globalParams.useOffset );

    this.folder1
    .addColor( params, 'color1' )
    //.onChange( () => material2.color.setHex(params.color1) )
    this.folder1.add(params, 'rainbowX', 0.0, 1.0)
    .onChange( () =>  materialShader.uniforms.rainbow1Dir.value.x = params.rainbowX );
    this.folder1.add(params, 'rainbowY', 0.0, 1.0)
    .onChange( () =>  materialShader.uniforms.rainbow1Dir.value.y = params.rainbowY );
    this.folder1.add(params, 'rainbowZ', 0.0, 1.0)
    .onChange( () =>  materialShader.uniforms.rainbow1Dir.value.z = params.rainbowZ );
    this.folder1.add(params, "blurRadius", 0.0, 5.0)
    .onChange( () =>  materialShader.uniforms.blurRadius1.value = params.blurRadius );
    this.folder1.add(params, "blurResX", 0.0, 1000.0)
    .onChange( () =>  materialShader.uniforms.blurRes1.value.x = params.blurResX );
    this.folder1.add(params, "blurResY", 0.0, 1000.0)
    .onChange( () =>  materialShader.uniforms.blurRes1.value.y = params.blurResY );




    this.folder2
    .addColor( params2, 'color1' )
    .onChange( () => material.color.setHex(params2.color1) );
    this.folder2.add(params2, 'playWave')
    .onChange( () =>  materialShader.uniforms.playWave.value = params2.playWave );
    this.folder2.add(params2, 'waveSpeed', 0.0,5.0)
    .onChange( () =>  materialShader.uniforms.waveSpeed.value = params2.waveSpeed );
    this.folder2.add(params2, 'waveFrequency', 0.0,100.0)
    .onChange( () =>  materialShader.uniforms.waveFrequency.value = params2.waveFrequency );
    this.folder2.add(params2, 'waveSizeX', 0.0,0.1)
    .onChange( () =>  materialShader.uniforms.waveSize.value.x = params2.waveSizeX );
    this.folder2.add(params2, 'waveSizeY', 0.0,0.1)
    .onChange( () =>  materialShader.uniforms.waveSize.value.y = params2.waveSizeY );
    this.folder2.add(params2, 'rainbowX', 0.0, 1.0)
    .onChange( () =>  materialShader.uniforms.rainbow2Dir.value.x = params2.rainbowX );
    this.folder2.add(params2, 'rainbowY', 0.0, 1.0)
    .onChange( () =>  materialShader.uniforms.rainbow2Dir.value.y = params2.rainbowY );
    this.folder2.add(params2, 'rainbowZ', 0.0, 1.0)
    .onChange( () =>  materialShader.uniforms.rainbow2Dir.value.z = params2.rainbowZ );
    this.folder2.add(params2, "blurRadius", 0.0, 5.0)
    .onChange( () =>  materialShader.uniforms.blurRadius2.value = params2.blurRadius );
    this.folder2.add(params2, "blurResX", 0.0, 1000.0)
    .onChange( () =>  materialShader.uniforms.blurRes2.value.x = params2.blurResX );
    this.folder2.add(params2, "blurResY", 0.0, 1000.0)
    .onChange( () =>  materialShader.uniforms.blurRes2.value.y = params2.blurResY );

    this.mainFolder.open();
    this.folder.open();
    this.folder1.open();
    this.folder2.open();

  }



}
