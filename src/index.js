
import keys from './keys';

import './styles.css';
import * as three from 'three';

const scene = new three.Scene();
const camera = new three.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 1, 10000);
const renderer = new three.WebGLRenderer({ alpha: true });
renderer.setClearColor(0x0000ff, 0.2);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const r = .5;
const geometry = new three.BoxGeometry(r, r, r);
const material = new three.MeshLambertMaterial({color: 0xfffff});
const cube = new three.Mesh(geometry, material);

cube.position.y = r * 0.5;
scene.add(cube);

const size = 4;

const center = r * (size - 1) / 2;
const light = new three.PointLight(0xffffff, 1);
light.position.set(center, center, 1);
scene.add( light );
const ambiance = new three.AmbientLight(0x404040); // soft white light
scene.add(ambiance);
for (let i = 0; i < size; i += 1) {
	for (let j = 0; j < size; j += 1) {
		const geometry = new three.PlaneGeometry(r, r);
		const material = new three.MeshLambertMaterial({color: (i + j) % 2 ? 0xaaaaaa : 0xffffff, side: three.DoubleSide});
		const plane = new three.Mesh(geometry, material);
		plane.position.set(i * r, 0, -j * r);
		plane.rotation.x = Math.PI / 2;
		scene.add(plane);
	}
}

const vector = new three.Vector3(0, 0, -1);

const axis = new three.Vector3(1, 0, 0);
const angle = -Math.PI / 4;

vector.applyAxisAngle(axis, angle);
console.log(vector);

camera.position.set(center, 3, 1.5);        
camera.up = new three.Vector3(1,0,0).cross(vector);
camera.lookAt(vector.add(camera.position));

let dest_zrot = 0;
let dest_xrot = 0;
let cur_zrot = 0;
let dest_x = 0;
let dest_z = 0;
function render() {
	requestAnimationFrame(render);
	if (keys['a']) {
		keys['a'] = false;
		dest_zrot += Math.PI / 2;
		dest_x = Math.max(0, dest_x - 1);
	}
	if (keys['d']) {
		keys['d'] = false;
		dest_zrot -= Math.PI / 2;
		dest_x = Math.min(size - 1, dest_x + 1);
	}
	if (keys['s']) {
		keys['s'] = false;
		dest_xrot += Math.PI / 2;
		dest_z = Math.min(0, dest_z + 1);
	}
	if (keys['w']) {
		keys['w'] = false;
		dest_xrot -= Math.PI / 2;
		dest_z = Math.max(-(size - 1), dest_z - 1);
	}
	cube.rotation.z += (dest_zrot - cube.rotation.z) / 8;
	cube.rotation.x += (dest_xrot - cube.rotation.x) / 8;
	cube.position.x += (dest_x * r - cube.position.x) / 8;
	cube.position.z += (dest_z * r - cube.position.z) / 8;
	renderer.render(scene, camera);
};
render();
