
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
import alphaimg2 from "./alpha2.jpg"
import {MaterialFolder} from './MaterialFolder'


let initVideoOnce = false;
let timeStart;
let mirror, letter, letter2;
let speed = 0.01;
let initalPos = 0.0;
let materialShaders = []

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

  const gui = new dat.GUI();

  var params = {
    nCols : 8,
    nColsMask : 8,
    useOffset : false,
    mirror : false,
    mirrorHalf : false,
    mirrorOffset : false,
    mask : true,
    animationSpeed : 0

  }

  // Render Loop
  var render = function () {
    requestAnimationFrame( render );

    if(document.getElementById( 'video' ) != null && !initVideoOnce){
      timeStart = new Date().getTime();

      var texture = initVideoTexture();

      var mainFolder = gui.addFolder( 'MAIN' );
      mainFolder
      .add(params, 'nCols', 1, 100, 1)
      .onChange( () => {initPlane(texture, mainFolder, scene, params)} );
      mainFolder
      .add(params, 'nColsMask', 1, 100, 1)
      .onChange( () => {initPlane(texture, mainFolder, scene, params)} );
      mainFolder.add(params, 'mirror' )
      .onChange( () => {initPlane(texture, mainFolder, scene, params)} );
      initPlane(texture, mainFolder, scene, params)
      mainFolder.add(params, 'mirrorHalf' )
      .onChange( () => {initPlane(texture, mainFolder, scene, params)} );
      initPlane(texture, mainFolder, scene, params)
      mainFolder.add(params, 'useOffset' )
      .onChange( () => {initPlane(texture, mainFolder, scene, params)} );
      initPlane(texture, mainFolder, scene, params)
      mainFolder.add(params, 'mirrorOffset' )
      .onChange( () => {initPlane(texture, mainFolder, scene, params)} );
      mainFolder.add(params, 'mask' )
      .onChange( () => {initPlane(texture, mainFolder, scene, params)} );
      mainFolder.add(params, 'animationSpeed', 0, 5,0.1 )


      initPlane(texture, mainFolder, scene, params)
      mainFolder.open();


      var light = new THREE.AmbientLight( 0xffffff ); // soft white light
      scene.add( light );

      var light2 = new THREE.PointLight( 0xffffff, 1, 80 );
      light2.position.set( 0, 0, 50 );
      scene.add( light2 )

      initVideoOnce = true;
    }
    const now = new Date().getTime();

    materialShaders.forEach((shader) =>{
      shader.uniforms.time.value = (now - timeStart) / 1000;

    })


    if(letter){
    //  var axis = new THREE.Vector3(0, -50, 0).normalize();
    //  letter.rotateOnAxis(axis, 0.01);
      letter.rotateY(0.01);
    }

    if(letter2){

      //console.log(initalPos, letter2.position.x - initalPos)
      if(letter2.position.x - initalPos > 2 || letter2.position.x - initalPos < -2)
        params.animationSpeed = -params.animationSpeed;
      letter2.translateX(params.animationSpeed/100);

    }
    // Render the scene
    renderer.render(scene, camera);
  }

  render();


}

function initPlane(texture, mainFolder, scene, params){

  if(mirror)
    scene.remove(mirror)

  if(letter2)
    scene.remove(letter2)

  mirror = new THREE.Object3D()

  var material1 = initMaterial1(timeStart, texture, mainFolder, "MATERIAL 1");
  var material2 = initMaterial2(timeStart, texture, mainFolder, "MATERIAL 2");
  material1.transparent = false// params.mask1;
  material2.transparent = false// params.mask1;



  var numberOfQuads = params.nCols;
  var quadSizePros = 1.0/numberOfQuads;
  var planeSize = 6;
  var quadSize = planeSize*quadSizePros;
  for(var i = 0; i <numberOfQuads; i++){
    console.log("quadSize", quadSizePros + " " + i)
    var geometry = new PlaneBufferGeometry( quadSize, 4,32, 32, quadSizePros, i, params );
    var m = i % 2 ==0 ?  material1 : material2;
    var plane = new THREE.Mesh( geometry, m );
    plane.translateX(i*quadSize);
    mirror.add( plane );
  }

  if(params.mask){
    var numberOfQuads2 = params.nColsMask;
    var quadSizePros2 = 1.0/numberOfQuads2;
    var planeSize2 = 6;
    var quadSize2 = planeSize2*quadSizePros2;

    var material3 = initMaterial1(timeStart, texture, mainFolder, "MATERIAL MASK 1");
    var material4 = initMaterial2(timeStart, texture, mainFolder, "MATERIAL MASK 2");
    var alphamap = new THREE.TextureLoader().load( alphaimg2 );
    material3.alphaMap = alphamap
    material4.alphaMap = alphamap
    material3.transparent = true;
    material4.transparent = true;

    letter2 = new THREE.Group();

    for(var i = 0; i <numberOfQuads2; i++){
      console.log("quadSize", quadSizePros2 + " " + i)
      var geometry = new PlaneBufferGeometry( quadSize2, 4,32, 32, quadSizePros2, i, params );
      var m = i % 2 ==0 ?  material3 : material4;
      var plane = new THREE.Mesh( geometry, m );
      plane.translateX(i*quadSize2);
      letter2.add( plane );
    }
    letter2.translateX(-planeSize2/2 + quadSize2/2);
    initalPos = letter2.position.x;
    //mirror.add(letter2);
    scene.add(letter2)
}
  //new THREE.Box3().setFromObject( letter ).getCenter( letter.position ).multiplyScalar( - 1 );

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

function initMaterial1(timeStart, texture, gui, name){
  var dismap = new THREE.TextureLoader().load( bumpimg );
  var bumpmap = new THREE.TextureLoader().load( bumpimg );
  var alphamap = new THREE.TextureLoader().load( alphaimg );
  var material1 = new THREE.MeshStandardMaterial( { depthWrite: false, depthTest: false, transparent: true, alphaMap : alphamap, normalMap: bumpmap, displacementMap: dismap,displacementScale:0.1, metalness: 0.5, map: texture, color: 0xffffff, side: THREE.DoubleSide} );

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

    materialShaders.push(shader);

    new MaterialFolder(material1, shader, gui, name);

  };


  return material1;
}

function initMaterial2(timeStart, texture, gui, name){

  var dismap = new THREE.TextureLoader().load( bumpimg );
  var bumpmap = new THREE.TextureLoader().load( bumpimg );
  var alphamap = new THREE.TextureLoader().load( alphaimg );
  var material2 = new THREE.MeshStandardMaterial( { depthWrite: false, depthTest: false, transparent: true, alphaMap : alphamap, normalMap: bumpmap, normalScale: THREE.Vector2(0.0, 0.0), displacementMap: dismap,displacementScale:0.0, metalness: 0.0, map: texture, color: 0xffffff, side: THREE.DoubleSide} );

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
    materialShaders.push(shader);
    //console.log("mater")

    new MaterialFolder(material2, shader, gui, name);


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
