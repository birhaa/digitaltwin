import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PlaneBufferGeometry } from './customplanegeometry.js';
import * as dat from 'dat.gui';
import meshphysical_vert from './shaders/meshphysical_vert.glsl';
import meshphysical_frag from './shaders/meshphysical_frag.glsl';
import bumpimg from './images/bumpmap.jpg';
import alphaimg from './images/alpha.jpg';
import alphaimg2 from './images/alpha2.jpg';

import { MaterialFolder } from './MaterialFolder';
import { MainFolder } from './MainFolder';

let initVideoOnce = false;
let timeStart;
let mirror, letter, mask;
let speed = 0.01;
let initalPos = 0.0;
let materialShaders = [];

const gui = new dat.GUI();
let mainFolder, folder1, folder2, folder3, folder4;

const init = function() {
    // ------------------------------------------------
    // BASIC SETUP
    // ------------------------------------------------

    // Create an empty scene
    var scene = new THREE.Scene();

    // Create a basic perspective camera
    var camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 4;
    //new OrbitControls(camera);

    // Create a renderer with Antialiasing
    var renderer = new THREE.WebGLRenderer({ antialias: true });

    // Configure renderer clear color
    renderer.setClearColor('#000000');

    // Configure renderer size
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Append Renderer to DOM
    document.body.appendChild(renderer.domElement);

    // ------------------------------------------------
    // FUN STARTS HERE
    // ------------------------------------------------

    // Render Loop
    var render = function() {
        requestAnimationFrame(render);
        const now = new Date().getTime();

        //TODO: Find a better way to init when loaded
        if (document.getElementById('video') != null && !initVideoOnce) {
            initVideoScene(scene)
            initVideoOnce = true;
        }

        //Update shader materials
        materialShaders.forEach(shader => {
            shader.uniforms.time.value = (now - timeStart) / 1000;
        });

        //Update mask animation
        if (mask) {
            if (  mask.position.x - initalPos > 2 ||  mask.position.x - initalPos < -2)
                mainFolder.getSettings().animationSpeed = -mainFolder.getSettings().animationSpeed;
            mask.translateX(mainFolder.getSettings().animationSpeed / 100);
        }

        renderer.render(scene, camera);
    };

    render();
};

function initVideoScene(scene){
  timeStart = new Date().getTime();

  var texture = initVideoTexture();
  mainFolder = new MainFolder(gui, 'MAIN');
  folder1 = new MaterialFolder(mainFolder.getFolder(), 'MATERIAL 1', true);
  folder2 = new MaterialFolder(mainFolder.getFolder(), 'MATERIAL 2', false);
  folder3 = new MaterialFolder(
      mainFolder.getFolder(),
      'MASK MATERIAL 1'
  );
  folder4 = new MaterialFolder(
      mainFolder.getFolder(),
      'MASK MATERIAL 2'
  );
  mainFolder.initProps((mainFolder, params) => {
      initMirror(texture, mainFolder, scene, params);
  });

  var light = new THREE.AmbientLight(0xffffff); // soft white light
  scene.add(light);

  var light2 = new THREE.PointLight(0xffffff, 1, 80);
  light2.position.set(0, 0, 50);
  scene.add(light2);
}

function initMirror(texture, mainFolder, scene, params) {
    if (mirror) scene.remove(mirror);
    if (mask) scene.remove(mask);

    mirror = new THREE.Object3D();

    var material1 = initMaterial(timeStart, texture, folder1);
    var material2 = initMaterial(timeStart, texture, folder2);
    material1.transparent = false; // params.mask1;
    material2.transparent = false; // params.mask1;

    var numberOfQuads = params.nCols;
    var quadSizePros = 1.0 / numberOfQuads;
    var planeSize = 6;
    var quadSize = planeSize * quadSizePros;
    for (var i = 0; i < numberOfQuads; i++) {
        //console.log('quadSize', quadSizePros + ' ' + i);
        var geometry = new PlaneBufferGeometry(
            quadSize,
            4,
            32,
            32,
            quadSizePros,
            i,
            params
        );
        var m = i % 2 == 0 ? material1 : material2;
        var plane = new THREE.Mesh(geometry, m);
        plane.translateX(i * quadSize);
        mirror.add(plane);
    }

    initmask(scene, params, texture)
    
    mirror.translateX(-planeSize / 2 + quadSize / 2);
    scene.add(mirror);
}

function initmask(scene, params, texture){
  if (params.mask) {
      var numberOfQuads2 = params.nColsMask;
      var quadSizePros2 = 1.0 / numberOfQuads2;
      var planeSize2 = 6;
      var quadSize2 = planeSize2 * quadSizePros2;

      var material3 = initMaterial(timeStart, texture, folder3);
      var material4 = initMaterial(timeStart, texture, folder4);
      var alphamap = new THREE.TextureLoader().load(alphaimg2);
      material3.alphaMap = alphamap;
      material4.alphaMap = alphamap;
      material3.transparent = true;
      material4.transparent = true;

      mask = new THREE.Group();

      for (var i = 0; i < numberOfQuads2; i++) {
          //console.log('quadSize', quadSizePros2 + ' ' + i);
          var geometry = new PlaneBufferGeometry(
              quadSize2,
              4,
              32,
              32,
              quadSizePros2,
              i,
              params
          );
          var m = i % 2 == 0 ? material3 : material4;
          var plane = new THREE.Mesh(geometry, m);
          plane.translateX(i * quadSize2);
          mask.add(plane);
      }
      mask.translateX(-planeSize2 / 2 + quadSize2 / 2);
      initalPos = mask.position.x;
      //mirror.add(mask);
      scene.add(mask);
  }
}

function initVideoTexture() {
    var video = document.getElementById('video');
    //console.log('video', video);
    var texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.format = THREE.RGBFormat;
    playVideo(video);
    return texture;
}

function initMaterial(timeStart, texture, folder, isMaterial2) {
    let settings = folder.getSettings();
    var dismap = new THREE.TextureLoader().load(bumpimg);
    var bumpmap = new THREE.TextureLoader().load(bumpimg);
    var alphamap = new THREE.TextureLoader().load(alphaimg);
    var material1 = new THREE.MeshStandardMaterial({
        depthWrite: false,
        depthTest: false,
        transparent: true,
        alphaMap: alphamap,
        normalMap: bumpmap,
        displacementMap: dismap,
        displacementScale: settings.displacementScale,
        metalness: settings.metalness,
        map: texture,
        color: 0xffffff,
        side: THREE.DoubleSide
    });

    material1.onBeforeCompile = function(shader) {

        shader.uniforms.time = { value: timeStart };
        shader.uniforms.size = { value: settings.stripes };
        shader.uniforms.playWave = { value: settings.playWave };
        shader.uniforms.waveSpeed = { value: settings.waveSpeed };
        shader.uniforms.waveFrequency = { value: settings.waveFrequency };
        shader.uniforms.waveSize = new THREE.Uniform(
            new THREE.Vector2(settings.waveSizeX, settings.waveSizeY)
        );
        shader.uniforms.useOffset = { value: settings.useOffset };
        shader.uniforms.rainbow1Dir = new THREE.Uniform(
            new THREE.Vector3(
                settings.rainbowX,
                settings.rainbowY,
                settings.rainbowZ
            )
        );
        shader.uniforms.blurRadius1 = { value: settings.blurRadius };
        shader.uniforms.blurRes1 = new THREE.Uniform(
            new THREE.Vector2(settings.blurResX, settings.blurResY)
        );

        shader.vertexShader = meshphysical_vert;
        shader.fragmentShader = meshphysical_frag;

        materialShaders.push(shader);
        folder.initShaderProps(material1, shader);
    };

    return material1;
}

function playVideo(video) {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        var constraints = {
            video: { width: 1280, height: 720, facingMode: 'user' }
        };
        navigator.mediaDevices
            .getUserMedia(constraints)
            .then(function(stream) {
                // apply the stream to the video element used in the texture
                video.srcObject = stream;
                video.play();
            })
            .catch(function(error) {
                console.error('Unable to access the camera/webcam.', error);
            });
    } else {
        console.error('MediaDevices interface not available.');
    }
}

export default init;
