
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FresnelShader } from 'three/examples/jsm/shaders/FresnelShader.js';
import * as dat from 'dat.gui';
import meshphysical_vert from './meshphysical_vert.glsl.js';
import meshphysical_frag from './meshphysical_frag.glsl.js';



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

      var geometry = new THREE.PlaneBufferGeometry( 6, 4,64 );
      //var material = new THREE.MeshBasicMaterial( { map: texture, color: 0xffff00, side: THREE.DoubleSide} );

      var material2 = new THREE.MeshBasicMaterial( {  color: 0xffffff, map: texture, side: THREE.DoubleSide } );

      material2.onBeforeCompile = function( shader ) {
        shader.uniforms.time = { value: timeStart };
        shader.uniforms.size = { value : 1.0};
        shader.uniforms.playWave = {value : true};
        shader.uniforms.useOffset = {value : true};
        shader.uniforms.rainbow1Dir = new THREE.Uniform(new THREE.Vector3(0.0,0.0,0.0))
        shader.uniforms.rainbow2Dir = new THREE.Uniform(new THREE.Vector3(1.0,0.0,0.0))
        //console.log(shader.uniforms);
        shader.vertexShader = meshphysical_vert;
        shader.fragmentShader = meshphysical_frag;
        materialShader = shader;

        console.log(materialShader);

      };

      var globalParams = {
        useOffset : true
      }

      var params = {
          color1: 0xffffff,
          size: 1,
          playWave : true,
          rainbowX : 0.0,
          rainbowY : 0.0,
          rainbowZ : 0.0
      };

      var params2 = {
          color1: 0xffffff,
          size: 1,
          playWave : true,
          rainbowX : 1.0,
          rainbowY : 0.0,
          rainbowZ : 0.0
      };
      //gui.add(materialShader.uniforms.color, 'value', 0, 1000).name('color');
      var folder = gui.addFolder( 'PROPERTIES' );
      var folder1 = gui.addFolder( 'MATERIAL 1' );
      var folder2 = gui.addFolder( 'MATERIAL 2' );


      folder
      .add(params, 'size', 0.0, 10.0)
      .onChange( () => materialShader.uniforms.size.value = params.size );
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


      folder2
      .addColor( params2, 'color1' )
      .onChange( () => material2.color.setHex(params2.color1) );
      folder2.add(params2, 'playWave')
      .onChange( () =>  materialShader.uniforms.playWave.value = params2.playWave );
      folder2.add(params2, 'rainbowX', 0.0, 1.0)
      .onChange( () =>  materialShader.uniforms.rainbow2Dir.value.x = params2.rainbowX );
      folder2.add(params2, 'rainbowY', 0.0, 1.0)
      .onChange( () =>  materialShader.uniforms.rainbow2Dir.value.y = params2.rainbowY );
      folder2.add(params2, 'rainbowZ', 0.0, 1.0)
      .onChange( () =>  materialShader.uniforms.rainbow2Dir.value.z = params2.rainbowZ );

      folder.open()
      folder1.open();
      folder2.open();


      var plane = new THREE.Mesh( geometry, material2 );
      scene.add( plane );
      //console.log(material2)

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
