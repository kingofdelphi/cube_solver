import keys from './keys';

import './styles.scss';
import * as three from 'three';
import Solver from './solver';
import Game from './game';

const scene = new three.Scene();
const camera = new three.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 1, 10000);
const renderer = new three.WebGLRenderer({ alpha: true, antialias: true });
renderer.setClearColor(0x0000ff, 0.2);

const body = document.getElementById('body');
body.appendChild(renderer.domElement);
renderer.setSize(body.offsetWidth, body.offsetHeight);

const form = {
	solve: document.getElementById('solve'),
	arrows: {
		left: document.getElementById('left'),
		right: document.getElementById('right'),
		up: document.getElementById('up'),
		down: document.getElementById('down'),
	}
}

const setSolverMode = () => {
	const { player, cubeMap, floorMap } = game;
	const { config, position } = player.state;
	if (solverMode || !player.isStatic()) {
		return false;
	}
	// always pick the initial position bottom while solving
	if (cubeMap[config.bottom] ^ floorMap[position.x][position.z]) {
		game.setCubeBottom(true);
		game.setFloor(position.x, position.z, false);
	}
	solverMode = true;
	return true;
};

const addListeners = () => {
	form.solve.addEventListener('click', function() {
		if (allPicked) {
			alert('already solved');
		} else {
			setSolverMode();
		}
	});
	const helper = (type, dir) => {
		const { player } = game;
		if (player.canRotate(type, dir)) {
			player.rotate(type, dir);
		}
	}
	form.arrows.left.addEventListener('click', function() {
		helper('z', 1);
	});
	form.arrows.right.addEventListener('click', function() {
		helper('z', -1);
	});
	form.arrows.up.addEventListener('click', function() {
		helper('x', -1);
	});
	form.arrows.down.addEventListener('click', function() {
		helper('x', 1);
	});
};

const gameConfig = { r: 0.5, gridSize: 4 };

const center = gameConfig.r * (gameConfig.gridSize - 1) / 2;

const prepareCamera = () => {
	const vector = new three.Vector3(0, 0, -1);

	const axis = new three.Vector3(1, 0, 0);
	const angle = -Math.PI / 4;

	vector.applyAxisAngle(axis, angle);

	//slanted top view
	camera.position.set(center, 2, 1.5);        
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
let solverMode = false;
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
	if (keys['c']) {
		const success = setSolverMode();
		if (!success) console.log('wait');
	}
	if (solverMode) {
		if (!allPicked && moveList.length === 0 && player.isStatic()) {
			const solver = new Solver(gameConfig.gridSize);
			const moves = solver.solve(player.state, cubeMap, floorMap);
			console.log(moves);
			moveList = moves;
		}
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

addListeners();

const game = new Game(gameConfig);
prepareScene();
render();
