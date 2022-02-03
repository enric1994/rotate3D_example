import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/build/three.module.js';
import { GLTFLoader } from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/jsm/loaders/GLTFLoader.js';
import {OrbitControls} from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/controls/OrbitControls.js';


let container;
let camera;
let renderer;
let scene;
let controls;
let model;
let renderRequested;
let width;
let height;

var modelName = "house.glb";
const mixers = [];
const clock = new THREE.Clock();


function init() {


  container = document.querySelector("#scene-container");

  width = container.clientWidth;
  height = container.clientHeight;

  scene = new THREE.Scene();
  scene.background = new THREE.Color("white"); //("#323238");


  createCamera();
  loadModels(modelName);
  createLights();
  // createControls();
  createRenderer();

  renderer.setAnimationLoop(() => {
    update();
    requestRenderIfNotRequested();
  });

}

function createCamera() {
  const fov = 30;
  const aspect = container.clientWidth / container.clientHeight;
  const near = 0.01;
  const far = 10000;
  camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 10, 160);
}

function createLights() {

  // Ambient light
  const ambientLight = new THREE.AmbientLight( 0xffffff, 2 );

  // Hemi light
  const hemiLight = new THREE.HemisphereLight( 'white', 'orange', 2 );

  // Directional light 1
  const dir1 = new THREE.DirectionalLight( 'white', 2.5 );
  dir1.position.set( 10, 10, 10 );

  // Directional light 2 
  const dir2 = new THREE.DirectionalLight( 'white', 2);
  dir2.position.set( -10, 0, 10 );

  // Directional light L1
  const dir3 = new THREE.DirectionalLight( 'white', 2.5 );
  dir3.position.set( 10, 30, -10 );

  //Set up shadow properties for the light
dir3.shadow.mapSize.width = 512; 
dir3.shadow.mapSize.height = 512; 
dir3.shadow.camera.near = 0.5; 
dir3.shadow.camera.far = 60; 

// dir4.shadow.camera.width = 30;
// dir4.shadow.camera.height = 500;

dir3.shadow.camera.top = 30;
dir3.shadow.camera.bottom = -30;
dir3.shadow.camera.left = 30;
dir3.shadow.camera.right = -30;
  

  dir3.castShadow = true;
  dir3.shadow.bias = -0.0005;

  // /////////////

   // Directional light L1
   const dir4 = new THREE.DirectionalLight( 'white', 1.5 );
   dir4.position.set( -10, 30, -5 );
 
   //Set up shadow properties for the light
 dir4.shadow.mapSize.width = 512; 
 dir4.shadow.mapSize.height = 512; 
 dir4.shadow.camera.near = 80; 
 dir4.shadow.camera.far = 120; 
 
 // dir4.shadow.camera.width = 30;
 // dir4.shadow.camera.height = 500;
 
 dir4.shadow.camera.top = 50;
 dir4.shadow.camera.bottom = -50;
 dir4.shadow.camera.left = 50;
 dir4.shadow.camera.right = -50;
   
 
   dir4.castShadow = true;
   dir4.shadow.bias = -0.04;

  
  const dir4Helper = new THREE.DirectionalLightHelper( dir4, 3 );

  scene.add(ambientLight);
  scene.add(hemiLight);
  scene.add( dir1 );
  scene.add( dir2 );
  scene.add( dir3 );
  scene.add( dir4 );
  // scene.add(dir4Helper);
  
  // scene.add( helperPointL0, pointL0 );




}
  

function loadModels(modelName) {
  const loader = new GLTFLoader();

  const onLoad = (result) => {
    model = result.scene;
    model.position.set(0,0,0);
    model.scale.set(5, 5, 5);
    model.traverse( function( node ) { if ( node instanceof THREE.Mesh ) {
      node.castShadow = false; 
      node.receiveShadow = false;
      node.flatShading = true;
      node.blending= THREE.NoBlending;
      // const newMaterial = new THREE.MeshPhongMaterial( { color:  node.material.color} );
      // 
      // node.material = newMaterial;
    
    } } );
    
    model.castShadow = true
    const mixer = new THREE.AnimationMixer(model);
    mixers.push(mixer);

    var i;
    for (i = 0; i < result.animations.length; i++) {

      const animation = result.animations[i];
      const action = mixer.clipAction(animation);
      action.play();
    }
    scene.add(model);

  };

  const onProgress = (progress) => { };

  loader.load(
    modelName,
    (gltf) => onLoad(gltf),
    onProgress
  );
  

}


function createRenderer() {
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, logarithmicDepthBuffer: true  });
  renderer.stencil = true;
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(2); 
  renderer.shadowMapSoft = true;
  renderer.powerPreference = "high-performance";
  renderer.setClearColor( 0x000000, 0 ); // the default

  renderer.shadowMap.enabled = true
  renderer.gammaFactor = 2.2;
  renderer.gammaOutput = true;
  renderer.physicallyCorrectLights = true;

  container.appendChild(renderer.domElement);
}




function update() {
  const delta = clock.getDelta();
  mixers.forEach((mixer) => mixer.update(delta));
  
}


function render() {
  renderRequested = false;

  renderer.render(scene, camera);
  model.rotateY(0.001);
}

function requestRenderIfNotRequested() {
  if (!renderRequested) {
    renderRequested = true;

      setTimeout( function() {
  
          requestAnimationFrame( render );
  
      }, 1000 / 60 );
  
  }
}

init();


function onWindowResize() {
  camera.aspect = container.clientWidth / container.clientHeight;

  camera.updateProjectionMatrix();

  renderer.setSize(container.clientWidth, container.clientHeight);
}
window.addEventListener("resize", onWindowResize, false);

controls = new OrbitControls(camera, container);
 
controls.addEventListener( 'change', requestRenderIfNotRequested );
controls.target.set(0, 0, 0);
controls.update();