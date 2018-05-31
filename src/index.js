import keys from './keys';

import './styles.css';
import * as three from 'three';
import Solver from './solver';
import Game from './game';

const scene = new three.Scene();
const camera = new three.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 1, 10000);
const renderer = new three.WebGLRenderer({ alpha: true, antialias: true });
renderer.setClearColor(0x0000ff, 0.2);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const gameConfig = { r: 0.5, gridSize: 4 };

const center = gameConfig.r * (gameConfig.gridSize - 1) / 2;

const prepareCamera = () => {
	const vector = new three.Vector3(0, 0, -1);

	const axis = new three.Vector3(1, 0, 0);
	const angle = -Math.PI / 4;

	vector.applyAxisAngle(axis, angle);

	//slanted top view
	camera.position.set(0, 2, 1.5);        
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
	scene.add(game.elements.cube);

	// planes
	game.elements.planes.forEach(d => {
		d.forEach(plane => scene.add(plane));
	});

	// camera
	prepareCamera();
};

let allPicked = false;
let moveList = [];
function render() {
	requestAnimationFrame(render);
	const { player, cubeMap, floorMap } = game;
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
	debugger;
	if (keys['c'] && moveList.length === 0 && !allPicked) {
		const { config, position } = player.state;
		// always pick the initial position bottom while solving
		if (cubeMap[config.bottom] ^ floorMap[position.x][position.z]) {
			game.setCubeBottom(true);
			game.setFloor(position.x, position.z, false);
		}
		const solver = new Solver(gameConfig.gridSize);
		const moves = solver.solve(player.state, cubeMap, floorMap);
		console.log(moves);
		moveList = moves;
		keys['c'] = false;
	}
	// return;
	let factor = 1 / 6;
	if (!player.isStatic()) {
		const { rotation } = player;
		if (rotation.type === 'z') {
			if (keys['a'] && rotation.angleLeft > 0) factor = 1 / 2; 
			if (keys['d'] && rotation.angleLeft < 0) factor = 1 / 2; 
		}
		if (rotation.type === 'x') {
			if (keys['s'] && rotation.angleLeft > 0) factor = 1 / 2; 
			if (keys['w'] && rotation.angleLeft < 0) factor = 1 / 2; 
		}
		player.update(factor);
		const { position, config } = player.state;
		if (player.isStatic()) {
			//transfer color
			if (!allPicked && cubeMap[config.bottom] ^ floorMap[position.x][position.z]) {
				const pick = floorMap[position.x][position.z];
				game.setFloor(position.x, position.z, !pick);
				game.setCubeBottom(pick);
				if (pick) {
					allPicked = cubeMap.every(d => d);
				}
			}
		}
	} else if (moveList.length > 0) {
		const move = moveList.shift();
		player.rotate(move.type, move.dir);
	}

	renderer.render(scene, camera);
};

const game = new Game(gameConfig);
prepareScene();
render();
