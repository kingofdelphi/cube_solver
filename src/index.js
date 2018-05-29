
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
geometry.colorsNeedUpdate = true;

const cubeMaterials = [ 
    new three.MeshLambertMaterial({color:0xff0000, side: three.DoubleSide}),
    new three.MeshLambertMaterial({color:0x00ff00, side: three.DoubleSide}), 
    new three.MeshLambertMaterial({color:0x0000ff, side: three.DoubleSide}),
    new three.MeshLambertMaterial({color:0xffffff, side: three.DoubleSide}), 
    new three.MeshLambertMaterial({color:0x000000, side: three.DoubleSide}), 
    new three.MeshLambertMaterial({color:0x00ffff, side: three.DoubleSide}), 
]; 

let config = {
	right: 0,
	left: 1,
	top: 2,
	bottom: 3,
	front: 4,
	back: 5
};

const rotateCube = (config, type, dir) => {
	if (type === 'z') {
		let d = [config.right, config.top, config.left, config.bottom];
		if (dir === 1) { //rotate left
			const last = d.pop();
			d = [last].concat(d);
		} else {
			const first = d.shift();
			d.push(first);
		}
		return Object.assign({}, config,
			{
				right: d[0],
				top: d[1],
				left: d[2],
				bottom: d[3],
			}
		);
	}
	if (type === 'x') {
		let d = [config.front, config.top, config.back, config.bottom];
		if (dir === -1) { //rotate forward
			const last = d.pop();
			d = [last].concat(d);
		} else {
			const first = d.shift();
			d.push(first);
		}
		return Object.assign({}, config,
			{
				front: d[0],
				top: d[1],
				back: d[2],
				bottom: d[3],
			}
		);
	}
	return config;
};
const material = new three.MeshFaceMaterial(cubeMaterials);
const cube = new three.Mesh(geometry, material);

cube.position.y = r * 0.5;
scene.add(cube);

const size = 8;

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

const player = { x: 0, z: 0 };

const vector = new three.Vector3(0, 0, -1);

const axis = new three.Vector3(1, 0, 0);
const angle = -Math.PI / 4;

vector.applyAxisAngle(axis, angle);

//slanted top view
camera.position.set(center, 3, 1.5);        
camera.up = new three.Vector3(1,0,0).cross(vector);
camera.lookAt(vector.add(camera.position));

//front view
//camera.position.set(center, 1, 2.5);        

function rotateAroundWorldAxis(object, axis, radians, dx, dz = 0) {
    const t = new three.Matrix4();
	t.makeTranslation(dx, 0, dz);
	object.applyMatrix(t);
    const rotWorldMatrix = new three.Matrix4();
    rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);
	object.applyMatrix(rotWorldMatrix);
	t.makeTranslation(-dx, 0, -dz);
	object.applyMatrix(t);
}

const rotation = (dir, type) => {
	const dx = type === 'z' ? r / 2 - player.x * r + (dir === 1 ? 0 : -r) : 0;
	const dz = type === 'x' ? -r / 2 + player.z * r + (dir === 1 ? 0 : r) : 0;
	return { type, angleLeft: dir * Math.PI / 2, dx, dz };
};

let rot;

function render() {
	requestAnimationFrame(render);
	if (keys['a']) {
		if (!rot && player.x > 0) {
			keys['a'] = false;
			config = rotateCube(config, 'z', 1);
			rot = rotation(1, 'z');
			player.x = Math.max(0, player.x - 1);
		}
	}
	if (keys['d']) {
		if (!rot && player.x < size - 1) {
			keys['d'] = false;
			config = rotateCube(config, 'z', -1);
			rot = rotation(-1, 'z');
			player.x = Math.min(size - 1, player.x + 1);
		}
	}
	if (keys['s']) {
		if (!rot && player.z > 0) {
			keys['s'] = false;
			rot = rotation(1, 'x');
			config = rotateCube(config, 'x', 1);
			player.z = Math.max(0, player.z - 1);
		}
	}
	if (keys['w']) {
		if (!rot && player.z < size - 1) {
			keys['w'] = false;
			rot = rotation(-1, 'x');
			config = rotateCube(config, 'x', -1);
			player.z = Math.min(size - 1, player.z + 1);
		}
	}
	if (keys['c']) {
		cubeMaterials[config.bottom].color.setHex(0xFFFFFF);
	}
	let factor = 1 / 6;
	if (rot) {
		if (rot.type === 'z') {
			if (keys['a'] && rot.angleLeft > 0) factor = 1 / 2; 
			if (keys['d'] && rot.angleLeft < 0) factor = 1 / 2; 
		}
		if (rot.type === 'x') {
			if (keys['s'] && rot.angleLeft > 0) factor = 1 / 2; 
			if (keys['w'] && rot.angleLeft < 0) factor = 1 / 2; 
		}
		const f = rot.angleLeft * factor;
		const axis = rot.type === 'z' ? new three.Vector3(0, 0, 1) : new three.Vector3(1, 0, 0);
		rotateAroundWorldAxis(cube, axis, f, rot.dx, rot.dz);
		rot.angleLeft -= f;
		if (Math.abs(rot.angleLeft) <= 1e-3) {
			rot = undefined;
		}
	}

	renderer.render(scene, camera);
};
render();
