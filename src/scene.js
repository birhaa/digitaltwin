import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PlaneBufferGeometry } from './customplanegeometry.js';
import * as dat from 'dat.gui';
import * as handTrack from 'handtrackjs';
import meshphysical_vert from './shaders/meshphysical_vert.glsl';
import meshphysical_frag from './shaders/meshphysical_frag.glsl';
import bumpimg from './images/bumpmap.jpg';
import alphaimg from './images/alpha.jpg';
import alphaimg2 from './images/alpha2.jpg';

import { MaterialFolder } from './MaterialFolder';
import { MainFolder } from './MainFolder';
import { program1, program2 } from './Settings.js';
import { Vector3 } from 'three';

let initVideoOnce = false;
let timeStart;
let mirror, letter, mask;
let speed = 0.01;
let initalPos = 0.0;
let materialShaders = [];

const gui = new dat.GUI();
let mainFolder, folder1, folder2, folder3, folder4;
let material1;
let handPredictionModel;

const modelParams = {
    flipHorizontal: true, // flip e.g for video
    maxNumBoxes: 20, // maximum number of boxes to detect
    iouThreshold: 0.5, // ioU threshold for non-max suppression
    scoreThreshold: 0.6, // confidence threshold for predictions.
};

const init = function () {
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
    var render = function () {
        requestAnimationFrame(render);
        const now = new Date().getTime();

        //TODO: Find a better way to init when loaded
        if (document.getElementById('video') != null && !initVideoOnce) {
            initVideoScene(scene);
            initVideoOnce = true;
        }

        var video = document.getElementById('video');
        if (video && video.srcObject && handPredictionModel) {
            // console.log(video.srcObject.getVideoTracks());
            const track = video.srcObject.getVideoTracks()[0];
            const imageCapture = new ImageCapture(track);
            grabImage(imageCapture);
        }

        //Update shader materials
        materialShaders.forEach((shader) => {
            shader.uniforms.time.value = (now - timeStart) / 1000;
        });

        //Update mask animation
        if (mask) {
            if (
                mask.position.x - initalPos > 2 ||
                mask.position.x - initalPos < -2
            )
                mainFolder.getSettings().animationSpeed =
                    -mainFolder.getSettings().animationSpeed;
            mask.translateX(mainFolder.getSettings().animationSpeed / 100);
        }

        renderer.render(scene, camera);
    };

    // Load the model.
    handTrack.load().then((model) => {
        // detect objects in the image.
        console.log('model loaded', model);
        handPredictionModel = model;
    });
    render();
};

function initVideoScene(scene) {
    timeStart = new Date().getTime();

    var texture = initVideoTexture();
    mainFolder = new MainFolder(gui, 'MAIN');
    folder1 = new MaterialFolder(mainFolder.getFolder(), 'MATERIAL 1', true);
    folder2 = new MaterialFolder(mainFolder.getFolder(), 'MATERIAL 2', false);
    folder3 = new MaterialFolder(mainFolder.getFolder(), 'MASK MATERIAL 1');
    folder4 = new MaterialFolder(mainFolder.getFolder(), 'MASK MATERIAL 2');
    mainFolder.initProps((mainFolder, params) => {
        console.log('params', params);
        initMirror(texture, scene, params);
    });

    var text = {
        program: 'program',
    };
    gui.add(text, 'program', {
        RainbowsStripy: '1',
        UnicornFlowerPuff: '2',
        dragonSteel: '3',
    }).onChange((test) => {
        console.log(test);
        let params;
        switch (test) {
            case '1':
                params = program1.params;
                folder1.setSettings(program1.material1);
                folder2.setSettings(program1.material2);
                break;
            case '2':
                params = program2.params;
                folder1.setSettings(program2.material1);
                folder2.setSettings(program2.material2);
                break;
            default:
                params = program1.params;
                folder1.setSettings(program1.material1);
                folder1.setSettings(program1.material2);
                break;
        }

        initMirror(texture, scene, params);
    });

    var light = new THREE.AmbientLight(0xffffff); // soft white light
    scene.add(light);

    var light2 = new THREE.PointLight(0xffffff, 1, 80);
    light2.position.set(0, 0, 50);
    scene.add(light2);
}

function initMirror(texture, scene, params) {
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

    initmask(scene, params, texture);

    mirror.translateX(-planeSize / 2 + quadSize / 2);
    scene.add(mirror);
}

function initmask(scene, params, texture) {
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
        roughness: settings.roughness,
        map: texture,
        color: 0xffffff,
        side: THREE.DoubleSide,
    });

    material1.onBeforeCompile = function (shader) {
        shader.uniforms.time = { value: timeStart };
        shader.uniforms.lightPos = { value: new Vector3(0.0, 0.0, 1.0) };
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
            video: { width: 1280, height: 720, facingMode: 'user' },
        };
        navigator.mediaDevices
            .getUserMedia(constraints)
            .then(function (stream) {
                // apply the stream to the video element used in the texture
                video.srcObject = stream;
                video.play();
            })
            .catch(function (error) {
                console.error('Unable to access the camera/webcam.', error);
            });
    } else {
        console.error('MediaDevices interface not available.');
    }
}

function grabImage(imageCapture) {
    imageCapture
        .grabFrame()
        .then((imageBitmap) => {
            handPredictionModel.detect(imageBitmap).then((predictions) => {
                if (predictions.length > 0) {
                    // console.log('Predictions: ', predictions);
                    let closed = predictions.find(
                        (it) => it.label === 'closed'
                    );
                    if (closed) {
                        console.log('closed', closed);
                        // materialShaders.forEach(
                        //     (it) => (it.uniforms.rainbow1Dir.value.z = 0.5)
                        // );
                    }
                    let pinched = predictions.find(
                        (it) => it.label === 'pinch'
                    );
                    if (pinched) {
                        folder1.getShader().uniforms.nCols = 60;

                        console.log('pinch', pinched);
                    }

                    const facePredictions = predictions.filter(
                        (it) => it.label === 'face'
                    );

                    let face = predictions.find((it) => it.label === 'face');
                    if (face) {
                        const dir = findViewDirMedian(facePredictions);
                        // console.log('pred', dir);
                        // const faceSize =
                        //     Math.round(
                        //         ((face.bbox[2] * face.bbox[3]) / (1000 * 30)) *
                        //             5,
                        //         1
                        //     ) / 5.0;
                        // // console.log('face', faceSize);

                        materialShaders.forEach((shader) => {
                            shader.uniforms.lightPos.value = dir;
                        });
                    }
                }
            });
        })
        .catch((error) => console.log(error));
}

function findViewDirMedian(facePredictions) {
    const sum = facePredictions
        .map(
            (face) =>
                new Vector3(
                    posFromBbox(face.bbox[0], window.innerWidth),
                    posFromBbox(face.bbox[1], window.innerHeight),
                    0
                )
        )
        .reduce((sum, pos) => {
            return sum.add(pos);
        }, new Vector3(0.0, 0.0, 0.0));
    return sum.divideScalar(facePredictions.length);
}

function posFromBbox(value, divider) {
    return (parseFloat(value) / divider) * 10;
}

export default init;
