
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FresnelShader } from 'three/examples/jsm/shaders/FresnelShader.js';
import {PlaneBufferGeometry} from'./customplanegeometry.js'
import * as dat from 'dat.gui';
import meshphysical_vert from './meshphysical_vert.glsl.js';
import meshphysical_frag from './meshphysical_frag.glsl.js';
import testimg from "./test.jpg"
import bumpimg from "./bumpmap.jpg"



let initVideoOnce = false;

const init = function(){

  // ------------------------------------------------
  // BASIC SETUP
  // ------------------------------------------------

  // Create an empty scene
  var scene = new THREE.Scene();

  // Create a basic perspective camera
  var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
  camera.position.z = 4;
  new OrbitControls(camera);

  // Create a renderer with Antialiasing
  var renderer = new THREE.WebGLRenderer({antialias:true});

  // Configure renderer clear color
  renderer.setClearColor("#000000");

  // Configure renderer size
  renderer.setSize( window.innerWidth, window.innerHeight );

  // Append Renderer to DOM
  document.body.appendChild( renderer.domElement );

  // ------------------------------------------------
  // FUN STARTS HERE
  // ------------------------------------------------

  let materialShader, timeStart;
  const gui = new dat.GUI();

  // Render Loop
  var render = function () {
    requestAnimationFrame( render );

    if(document.getElementById( 'video' ) != null && !initVideoOnce){
      timeStart = new Date().getTime();

      var video = document.getElementById( 'video' );
      console.log("video", video);
      var texture = new THREE.VideoTexture( video );
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.format = THREE.RGBFormat;
    //  texture.offset.x = 0.1;

      var dismap = new THREE.TextureLoader().load( bumpimg );
      var bumpmap = new THREE.TextureLoader().load( bumpimg );
      var material = new THREE.MeshStandardMaterial( { normalMap: bumpmap, displacementMap: dismap,displacementScale:0.1, metalness: 0.5, map: texture, color: 0xffffff, side: THREE.DoubleSide} );

      var material2 = new THREE.MeshBasicMaterial( {  color: 0xffffff, map: texture, side: THREE.DoubleSide } );

      material2.onBeforeCompile = function( shader ) {
        shader.uniforms.time = { value: timeStart };
        shader.uniforms.size = { value : 5.6};
        shader.uniforms.playWave = {value : true};
        shader.uniforms.waveSpeed = {value : 0.2};
        shader.uniforms.waveFrequency = {value : 21.4};
        shader.uniforms.waveSize = new THREE.Uniform(new THREE.Vector2(0.07,0.057))
        shader.uniforms.useOffset = {value : true};
        shader.uniforms.rainbow1Dir = new THREE.Uniform(new THREE.Vector3(0.0,0.0,0.0))
        shader.uniforms.rainbow2Dir = new THREE.Uniform(new THREE.Vector3(0.1,0.0,0.54))
        shader.uniforms.blurRadius1 = {value : 0.0};
        shader.uniforms.blurRes1 = new THREE.Uniform(new THREE.Vector2(0.0,0.0))
        shader.uniforms.blurRadius2 = {value : 0.0};
        shader.uniforms.blurRes2 = new THREE.Uniform(new THREE.Vector2(0.0,0.0))

        //console.log(shader.uniforms);
        shader.vertexShader = meshphysical_vert;
        shader.fragmentShader = meshphysical_frag;
        materialShader = shader;

        console.log(materialShader);

      };

      var globalParams = {
        useOffset : true,
        size: 5.6

      }

      var params = {
          color1: 0xffffff,
          rainbowX : 0.0,
          rainbowY : 0.0,
          rainbowZ : 0.0,
          blurRadius : 0.0,
          blurResX : 0.0,
          blurResY : 0.0
      };

      var params2 = {
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
      //gui.add(materialShader.uniforms.color, 'value', 0, 1000).name('color');
      var folder = gui.addFolder( 'PROPERTIES' );
      var folder1 = gui.addFolder( 'MATERIAL 1' );
      var folder2 = gui.addFolder( 'MATERIAL 2' );


      folder
      .add(globalParams, 'size', 0.0, 10.0)
      .onChange( () => materialShader.uniforms.size.value = globalParams.size );
      folder.add(globalParams, 'useOffset')
      .onChange( () =>  materialShader.uniforms.useOffset.value = globalParams.useOffset );

      folder1
      .addColor( params, 'color1' )
      //.onChange( () => material2.color.setHex(params.color1) )
      folder1.add(params, 'rainbowX', 0.0, 1.0)
      .onChange( () =>  materialShader.uniforms.rainbow1Dir.value.x = params.rainbowX );
      folder1.add(params, 'rainbowY', 0.0, 1.0)
      .onChange( () =>  materialShader.uniforms.rainbow1Dir.value.y = params.rainbowY );
      folder1.add(params, 'rainbowZ', 0.0, 1.0)
      .onChange( () =>  materialShader.uniforms.rainbow1Dir.value.z = params.rainbowZ );
      folder1.add(params, "blurRadius", 0.0, 5.0)
      .onChange( () =>  materialShader.uniforms.blurRadius1.value = params.blurRadius );
      folder1.add(params, "blurResX", 0.0, 1000.0)
      .onChange( () =>  materialShader.uniforms.blurRes1.value.x = params.blurResX );
      folder1.add(params, "blurResY", 0.0, 1000.0)
      .onChange( () =>  materialShader.uniforms.blurRes1.value.y = params.blurResY );




      folder2
      .addColor( params2, 'color1' )
      .onChange( () => material2.color.setHex(params2.color1) );
      folder2.add(params2, 'playWave')
      .onChange( () =>  materialShader.uniforms.playWave.value = params2.playWave );
      folder2.add(params2, 'waveSpeed', 0.0,5.0)
      .onChange( () =>  materialShader.uniforms.waveSpeed.value = params2.waveSpeed );
      folder2.add(params2, 'waveFrequency', 0.0,100.0)
      .onChange( () =>  materialShader.uniforms.waveFrequency.value = params2.waveFrequency );
      folder2.add(params2, 'waveSizeX', 0.0,0.1)
      .onChange( () =>  materialShader.uniforms.waveSize.value.x = params2.waveSizeX );
      folder2.add(params2, 'waveSizeY', 0.0,0.1)
      .onChange( () =>  materialShader.uniforms.waveSize.value.y = params2.waveSizeY );
      folder2.add(params2, 'rainbowX', 0.0, 1.0)
      .onChange( () =>  materialShader.uniforms.rainbow2Dir.value.x = params2.rainbowX );
      folder2.add(params2, 'rainbowY', 0.0, 1.0)
      .onChange( () =>  materialShader.uniforms.rainbow2Dir.value.y = params2.rainbowY );
      folder2.add(params2, 'rainbowZ', 0.0, 1.0)
      .onChange( () =>  materialShader.uniforms.rainbow2Dir.value.z = params2.rainbowZ );
      folder2.add(params2, "blurRadius", 0.0, 5.0)
      .onChange( () =>  materialShader.uniforms.blurRadius2.value = params2.blurRadius );
      folder2.add(params2, "blurResX", 0.0, 1000.0)
      .onChange( () =>  materialShader.uniforms.blurRes2.value.x = params2.blurResX );
      folder2.add(params2, "blurResY", 0.0, 1000.0)
      .onChange( () =>  materialShader.uniforms.blurRes2.value.y = params2.blurResY );

      folder.open()
      folder1.open();
      folder2.open();

      var numberOfQuads = 25.0;
      var quadSizePros = 1.0/numberOfQuads;
      var planeSize = 6;
      var quadSize = planeSize*quadSizePros;
      for(var i = 0; i <numberOfQuads; i++){
        var geometry = new PlaneBufferGeometry( quadSize, 4,32, 32, quadSizePros, i );
        var m = i % 2 ==0 ?  material : material2;
        var plane = new THREE.Mesh( geometry, m );
        plane.translateX(i*quadSize -planeSize/2.0);
        scene.add( plane );
      }
      //console.log(material2)

      var light = new THREE.AmbientLight( 0xffffff ); // soft white light
      scene.add( light );

      var light2 = new THREE.PointLight( 0xffffff, 1, 80 );
      light2.position.set( 0, 0, 50 );
      scene.add( light2 )

      playVideo(video);
      initVideoOnce = true;
    }

    if(materialShader){
    //  console.log("heia", materialShader);
      const now = new Date().getTime();
      materialShader.uniforms.time.value = (now - timeStart) / 1000;
    }

    // Render the scene
    renderer.render(scene, camera);
  }

  render();


}

function createPlane(){

}


function playVideo(video){
  if ( navigator.mediaDevices && navigator.mediaDevices.getUserMedia ) {
					var constraints = { video: { width: 1280, height: 720, facingMode: 'user' } };
					navigator.mediaDevices.getUserMedia( constraints ).then( function ( stream ) {
						// apply the stream to the video element used in the texture
						video.srcObject = stream;
						video.play();
					} ).catch( function ( error ) {
						console.error( 'Unable to access the camera/webcam.', error );
					} );
				} else {
					console.error( 'MediaDevices interface not available.' );
				}
}

export default init;
