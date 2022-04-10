import { ThirdPersonCamera } from "./src/camera.js";
import { EntityManager } from "./src/entityManager.js";
import { keys } from "./src/keys.js";
import { Level } from "./src/level.js";
import { SpatialManager } from "./src/spatialManager.js";

window.onload = function init() {
  // Meðhöndlun lykla
  window.addEventListener("keydown", function (e) {
    keys[e.keyCode] = true;
    entityManager.gameOver = false;
  });

  window.addEventListener("keyup", function (e) {
    keys[e.keyCode] = false;
  });
};

const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

export const scene = new THREE.Scene();

const fov = 60;
const aspect = window.innerWidth / window.innerHeight;
const near = 0.1;
const far = 1000.0;
export const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

const ambLight = new THREE.AmbientLight(0x404040); // soft white light
ambLight.position.z = 50;

const dirLight = new THREE.DirectionalLight(0xffffff);
dirLight.position.set(10, 10, 10);
scene.add(ambLight);
scene.add(dirLight);

const loader = new THREE.CubeTextureLoader();
const skyTex = loader.load([
  "./assets/graycloud_ft.jpg",
  "./assets/graycloud_bk.jpg",
  "./assets/graycloud_up.jpg",
  "./assets/graycloud_dn.jpg",
  "./assets/graycloud_lf.jpg",
  "./assets/graycloud_rt.jpg",
]);

scene.background = skyTex;

//todo window resize

export const entityManager = new EntityManager(); //singleton
export const spatialManager = new SpatialManager(); // singleton

export const cameraTP = new ThirdPersonCamera(
  entityManager.pacman.shape,
  camera
);

//camera.position.z = 1000;
//camera.position.y = 500;
//camera.position.x = 500;

function render() {
  requestAnimationFrame(render);
  entityManager.update();
  if (!entityManager.gameOver) {
    renderer.render(scene, cameraTP._camera);
  }
}

render();
