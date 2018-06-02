import keys from './keys';

import './styles.scss';
import * as three from 'three';
import Game from './game';

const scene = new three.Scene();
const camera = new three.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 1, 10000);
const renderer = new three.WebGLRenderer({ alpha: true, antialias: true });
renderer.setClearColor(0x0000ff, 0.2);

const id = (name) => document.getElementById(name);
const body = id('body');
body.appendChild(renderer.domElement);

const resize = () => renderer.setSize(body.offsetWidth, body.offsetHeight);
resize();

window.addEventListener('resize', function() {
	resize();
});

const form = {
	solve: id('solve'),
	reset: id('reset'),
	floorSize: id('floor-size'),
	gridSize: id('grid-size'),
	arrows: {
		left: id('left'),
		right: id('right'),
		up: id('up'),
		down: id('down'),
	}
}

const gameConfig = { r: form.floorSize.valueAsNumber, gridSize: form.gridSize.valueAsNumber};

const addListeners = () => {
	form.solve.addEventListener('mousedown', function() {
		if (game.allPicked) {
			alert('already solved');
		} else {
			game.setSolverMode();
		}
	});
	form.floorSize.addEventListener('change', function(d) {
		if (d.target.valueAsNumber) {
			gameConfig.r = d.target.valueAsNumber;
		}
	});
	form.gridSize.addEventListener('change', function(d) {
		if (d.target.valueAsNumber) {
			gameConfig.gridSize = d.target.valueAsNumber;
		}
	});
	form.reset.addEventListener('mousedown', function() {
		initNewGame();
	});
	const helper = (type, dir) => {
		game.addToMoveList(type, dir);
	}
	form.arrows.left.addEventListener('mousedown', function() {
		helper('z', 1);
	});
	form.arrows.right.addEventListener('mousedown', function() {
		helper('z', -1);
	});
	form.arrows.up.addEventListener('mousedown', function() {
		helper('x', -1);
	});
	form.arrows.down.addEventListener('mousedown', function() {
		helper('x', 1);
	});
};

const center = () => gameConfig.r * (gameConfig.gridSize - 1) / 2;
const prepareCamera = () => {

	const vector = new three.Vector3(0, 0, -1);

	const axis = new three.Vector3(1, 0, 0);
	const angle = -Math.PI / 4;

	vector.applyAxisAngle(axis, angle);

	//slanted top view
	camera.position.set(center(), 2, 1.5);        
	camera.up = new three.Vector3(1,0,0).cross(vector);
	camera.lookAt(vector.add(camera.position));

	//front view
	//camera.position.set(center, 1, 2.5);        

};

const prepareScene = () => {
	//clear scene first
	while (scene.children.length > 0){ 
		scene.remove(scene.children[0]); 
	}
	
	// scene setup
	const light = new three.PointLight(0xffffff, 1);
	light.position.set(center(), center(), 1);
	scene.add(light);
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

let game;
const initNewGame = () => {
	game = new Game(gameConfig);
	prepareScene();
};

initNewGame();
addListeners();

function render() {
	requestAnimationFrame(render);
	if (keys['a']) {
		keys['a'] = false;
		game.addToMoveList('z', 1);
	}
	if (keys['d']) {
		keys['d'] = false;
		game.addToMoveList('z', -1);
	}
	if (keys['s']) {
		keys['s'] = false;
		game.addToMoveList('x', 1);
	}
	if (keys['w']) {
		keys['w'] = false;
		game.addToMoveList('x', -1);
	}
	if (keys['c']) {
		keys['c'] = false;
		const success = game.setSolverMode();
		if (!success) {
			alert('please wait');
		}
	}
	game.update();
	renderer.render(scene, camera);
};

render();
