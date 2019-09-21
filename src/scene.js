
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {PlaneBufferGeometry} from'./customplanegeometry.js'
import * as dat from 'dat.gui';
import meshbasic_vert from './meshbasic_vert.glsl.js';
import meshbasic_frag from './mesbasic_frag.glsl.js';
import meshphysical_vert from './meshphysical_vert.glsl.js';
import meshphysical_frag from './meshphysical_frag.glsl.js';
import testimg from "./test.jpg"
import bumpimg from "./bumpmap.jpg"
import alphaimg from "./alpha.jpg"
import {MaterialFolder} from './MaterialFolder'


let initVideoOnce = false;
let materialShader1, materialShader2, timeStart;
let mirror;


const init = function(){

  // ------------------------------------------------
  // BASIC SETUP
  // ------------------------------------------------

  // Create an empty scene
  var scene = new THREE.Scene();

  // Create a basic perspective camera
  var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
  camera.position.z = 4;
  //new OrbitControls(camera);

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

  const gui = new dat.GUI();

  // Render Loop
  var render = function () {
    requestAnimationFrame( render );

    if(document.getElementById( 'video' ) != null && !initVideoOnce){
      timeStart = new Date().getTime();

      var texture = initVideoTexture();

      var params = {
        nCols : 8,
        useOffset : false
      }
      var mainFolder = gui.addFolder( 'MAIN' );
      mainFolder
      .add(params, 'nCols', 1, 100, 1)
      .onChange( () => {initPlane(texture, mainFolder, params.nCols, scene, params.useOffset)} );
      mainFolder.add(params, 'useOffset' )
      .onChange( () => {initPlane(texture, mainFolder, params.nCols, scene, params.useOffset)} );
      initPlane(texture, mainFolder, params.nCols, scene)
      mainFolder.open();


      var light = new THREE.AmbientLight( 0xffffff ); // soft white light
      scene.add( light );

      var light2 = new THREE.PointLight( 0xffffff, 1, 80 );
      light2.position.set( 0, 0, 50 );
      scene.add( light2 )

      initVideoOnce = true;
    }

    if(materialShader2 ){
      const now = new Date().getTime();
      materialShader2.uniforms.time.value = (now - timeStart) / 1000;
    }

    if(materialShader1){
      const now = new Date().getTime();
      materialShader1.uniforms.time.value = (now - timeStart) / 1000;
    }

    // Render the scene
    renderer.render(scene, camera);
  }

  render();


}

function initPlane(texture, mainFolder, nCols, scene, useOffset){

  if(mirror)
    scene.remove(mirror)

  mirror = new THREE.Object3D()

  var material1 = initMaterial1(timeStart, texture, mainFolder);
  var material2 = initMaterial2(timeStart, texture, mainFolder);


  var numberOfQuads = nCols;
  var quadSizePros = 1.0/numberOfQuads;
  var planeSize = 6;
  var quadSize = planeSize*quadSizePros;
  for(var i = 0; i <numberOfQuads; i++){
    console.log("quadSize", quadSizePros + " " + i)
    var geometry = new PlaneBufferGeometry( quadSize, 4,32, 32, quadSizePros, i, useOffset );
    var m = i % 2 ==0 ?  material1 : material2;
    var plane = new THREE.Mesh( geometry, m );
    plane.translateX(i*quadSize);
    mirror.add( plane );
  }
  if(numberOfQuads > 1)
    mirror.translateX(-planeSize/2 + quadSize/2);

  scene.add(mirror)
}


function initVideoTexture(){
  var video = document.getElementById( 'video' );
  console.log("video", video);
  var texture = new THREE.VideoTexture( video );
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.format = THREE.RGBFormat;
  playVideo(video);
  return texture;
}

function initMaterial1(timeStart, texture, gui){
  var dismap = new THREE.TextureLoader().load( bumpimg );
  var bumpmap = new THREE.TextureLoader().load( bumpimg );
  var alphamap = new THREE.TextureLoader().load( alphaimg );
  var material1 = new THREE.MeshStandardMaterial( {transparent: false, alphaMap : alphamap, normalMap: bumpmap, displacementMap: dismap,displacementScale:0.1, metalness: 0.5, map: texture, color: 0xffffff, side: THREE.DoubleSide} );

  material1.onBeforeCompile = function( shader ) {
    shader.uniforms.time = { value: timeStart };
    shader.uniforms.size = { value : 0.0};
    shader.uniforms.playWave = {value : false};
    shader.uniforms.waveSpeed = {value : 0.0};
    shader.uniforms.waveFrequency = {value : 0.0};
    shader.uniforms.waveSize = new THREE.Uniform(new THREE.Vector2(0.0,0.0))
    shader.uniforms.useOffset = {value : true};
    shader.uniforms.rainbow1Dir = new THREE.Uniform(new THREE.Vector3(0.0,0.0,0.0))
    shader.uniforms.rainbow2Dir = new THREE.Uniform(new THREE.Vector3(0.0,0.0,0.0))
    shader.uniforms.blurRadius1 = {value : 0.0};
    shader.uniforms.blurRes1 = new THREE.Uniform(new THREE.Vector2(0.0,0.0))
    shader.uniforms.blurRadius2 = {value : 0.0};
    shader.uniforms.blurRes2 = new THREE.Uniform(new THREE.Vector2(0.0,0.0))

    shader.vertexShader = meshphysical_vert;
    shader.fragmentShader = meshphysical_frag;

    materialShader1 = shader;

    new MaterialFolder(material1, shader, gui, "MATERIAL 1");

  };


  return material1;
}

function initMaterial2(timeStart, texture, gui){

  var dismap = new THREE.TextureLoader().load( bumpimg );
  var bumpmap = new THREE.TextureLoader().load( bumpimg );
  var alphamap = new THREE.TextureLoader().load( alphaimg );
  var material2 = new THREE.MeshStandardMaterial( { transparent: false, alphaMap : alphamap, normalMap: bumpmap, normalScale: THREE.Vector2(0.0, 0.0), displacementMap: dismap,displacementScale:0.0, metalness: 0.0, map: texture, color: 0xffffff, side: THREE.DoubleSide} );

  material2.onBeforeCompile = function( shader ) {
    shader.uniforms.time = { value: timeStart };
    shader.uniforms.size = { value : 0.0};
    shader.uniforms.playWave = {value : false};
    shader.uniforms.waveSpeed = {value : 0.0};
    shader.uniforms.waveFrequency = {value : 0.0};
    shader.uniforms.waveSize = new THREE.Uniform(new THREE.Vector2(0.0,0.0))
    shader.uniforms.useOffset = {value : true};
    shader.uniforms.rainbow1Dir = new THREE.Uniform(new THREE.Vector3(0.0,0.0,0.0))
    shader.uniforms.rainbow2Dir = new THREE.Uniform(new THREE.Vector3(0.0,0.0,0.0))
    shader.uniforms.blurRadius1 = {value : 0.0};
    shader.uniforms.blurRes1 = new THREE.Uniform(new THREE.Vector2(0.0,0.0))
    shader.uniforms.blurRadius2 = {value : 0.0};
    shader.uniforms.blurRes2 = new THREE.Uniform(new THREE.Vector2(0.0,0.0))

    //console.log(shader.uniforms);
    shader.vertexShader = meshphysical_vert;
    shader.fragmentShader = meshphysical_frag;
    materialShader2 = shader;
    //console.log("mater")

    new MaterialFolder(material2, shader, gui, "MATERIAL 2");


  };

  return material2;
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
