
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FresnelShader } from 'three/examples/jsm/shaders/FresnelShader.js';
import {PlaneBufferGeometry} from'./customplanegeometry.js'
import * as dat from 'dat.gui';
import meshphysical_vert from './meshphysical_vert.glsl.js';
import meshphysical_frag from './meshphysical_frag.glsl.js';
import testimg from "./test.jpg"
import bumpimg from "./bumpmap.jpg"
import MaterialFolder from './MaterialFolder'



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

        new MaterialFolder(material2,shader, gui, "MATERIAL 1");

      };


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
