import keys from './keys';

import './styles.css';
import * as three from 'three';
import { Cube, rotateCube } from './cube';

const scene = new three.Scene();
const camera = new three.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 1, 10000);
const renderer = new three.WebGLRenderer({ alpha: true, antialias: true });
renderer.setClearColor(0x0000ff, 0.2);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const r = .5;

const defaultCubeColor = 0xfffff;
const pickColor = 0x00ff00;

const prepareCube = () => {
	const cubeMaterials = [ 
		new three.MeshLambertMaterial({color: defaultCubeColor, transparent: true, opacity: 0.9, side: three.DoubleSide}),
		new three.MeshLambertMaterial({color: defaultCubeColor, transparent: true, opacity: 0.9, side: three.DoubleSide}), 
		new three.MeshLambertMaterial({color: defaultCubeColor, transparent: true, opacity: 0.9, side: three.DoubleSide}),
		new three.MeshLambertMaterial({color: defaultCubeColor, transparent: true, opacity: 0.9, side: three.DoubleSide}), 
		new three.MeshLambertMaterial({color: defaultCubeColor, transparent: true, opacity: 0.9, side: three.DoubleSide}), 
		new three.MeshLambertMaterial({color: defaultCubeColor, transparent: true, opacity: 0.9, side: three.DoubleSide}), 
	]; 
	const material = new three.MeshFaceMaterial(cubeMaterials);
	const geometry = new three.BoxGeometry(r, r, r);
	const cube = new three.Mesh(geometry, material);
	cube.position.y = r * 0.5;
	return [cube, cubeMaterials];
};

const size = 4;

const center = r * (size - 1) / 2;

const getCellColor = (i, j) => {
	return (i + j) % 2 ? 0xaaaaaa : 0xffffff;
};

const preparePlane = () => {
	const planes = [];
	for (let i = 0; i < size; i += 1) {
		planes.push([]);
		for (let j = 0; j < size; j += 1) {
			const geometry = new three.PlaneGeometry(r, r);
			const material = new three.MeshLambertMaterial({color: getCellColor(i, j), side: three.DoubleSide});
			const plane = new three.Mesh(geometry, material);
			plane.position.set(i * r, 0, -j * r);
			plane.rotation.x = Math.PI / 2;
			planes[i].push(plane);
		}
	}
	return planes;
};

const placeColors = () => {
	const f = [];
	for (let i = 0; i < size; i += 1) {
		for (let j = 0; j < size; j += 1) {
			f.push({ i, j });
		}
	}
	for (let i = 0; i < f.length; i += 1) {
		const id = Math.floor(Math.random() * f.length);
		const tmp = f[id];
		f[id] = f[0];
		f[0] = tmp;
	}
	return f.slice(0, 6);
};

const prepareCamera = () => {
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

};

const prepareScene = () => {
	// scene setup
	const light = new three.PointLight(0xffffff, 1);
	light.position.set(center, center, 1);
	scene.add( light );
	const ambiance = new three.AmbientLight(0x404040); // soft white light
	scene.add(ambiance);

	// cube
	scene.add(cube);

	// planes
	planes.forEach(d => {
		d.forEach(plane => scene.add(plane));
	});

	// camera
	prepareCamera();
};

let allPicked = false;
function render() {
	requestAnimationFrame(render);
	if (keys['a']) {
		if (player.canRotate('z', 1)) {
			keys['a'] = false;
			player.rotate('z', 1);
		}
	}
	if (keys['d']) {
		if (player.canRotate('z', -1)) {
			keys['d'] = false;
			player.rotate('z', -1);
		}
	}
	if (keys['s']) {
		if (player.canRotate('x', 1)) {
			keys['s'] = false;
			player.rotate('x', 1);
		}
	}
	if (keys['w']) {
		if (player.canRotate('x', -1)) {
			keys['w'] = false;
			player.rotate('x', -1);
		}
	}
	if (keys['c']) {
		cubeMaterials[player.config.bottom].color.setHex(0xFFFFF);
	}
	let factor = 1 / 6;
	const { rotation } = player;
	if (rotation) {
		if (rotation.type === 'z') {
			if (keys['a'] && rotation.angleLeft > 0) factor = 1 / 2; 
			if (keys['d'] && rotation.angleLeft < 0) factor = 1 / 2; 
		}
		if (rotation.type === 'x') {
			if (keys['s'] && rotation.angleLeft > 0) factor = 1 / 2; 
			if (keys['w'] && rotation.angleLeft < 0) factor = 1 / 2; 
		}
		player.update(factor);
		const { position } = player;
		if (!player.rotation) {
			//transfer color
			if (!allPicked && cubeMap[player.config.bottom] ^ floorMap[position.x][position.z]) {
				const [cubeColor, planeColor] = 
					floorMap[position.x][position.z] ? 
					[pickColor, getCellColor(position.x, position.z)] : 
					[defaultCubeColor, pickColor];
				cubeMaterials[player.config.bottom].color.setHex(cubeColor);
				planes[position.x][position.z].material.color.setHex(planeColor);
				cubeMap[player.config.bottom] = cubeColor === pickColor;
				floorMap[position.x][position.z] = planeColor === pickColor;

				if (cubeColor === pickColor) {
					allPicked = cubeMap.every(d => d);
				}
			}
		}
	}

	renderer.render(scene, camera);
};

const [cube, cubeMaterials] = prepareCube();

const planes = preparePlane();
const placed = placeColors();
const floorMap = [];
const cubeMap = [false, false, false, false, false, false];
for (let i = 0; i < size; i += 1) {
	floorMap[i] = [];
	for (let j = 0; j < size; j += 1) {
		floorMap[i][j] = false;
	}
}

placed.forEach(pos => {
	floorMap[pos.i][pos.j] = true;
	planes[pos.i][pos.j].material.color.setHex(pickColor);
});

const player = new Cube(cube, size, r);
prepareScene();
render();
