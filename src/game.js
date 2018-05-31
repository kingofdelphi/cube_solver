import * as three from 'three';
import { Cube } from './cube';

const defaultCubeColor = 0xfffff;
const pickColor = 0x00ff00;

const getCellColor = (i, j) => {
	return (i + j) % 2 ? 0xaaaaaa : 0xffffff;
};

const initializeFloorMap = (gridSize) => {
	const floorMap = [];
	for (let i = 0; i < gridSize; i += 1) {
		floorMap.push([]);
		for (let j = 0; j < gridSize; j += 1) {
			floorMap[i].push(false);
		}
	}
	return floorMap;
};

const placeColors = (gridSize) => {
	const f = [];
	for (let i = 0; i < gridSize; i += 1) {
		for (let j = 0; j < gridSize; j += 1) {
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

const prepareCube = (gameConfig, cubeMap) => {
	const cubeMaterials = cubeMap.map(colored => {
		const color = colored ? pickColor : defaultCubeColor;
		return new three.MeshLambertMaterial({color, transparent: true, opacity: 0.9, side: three.DoubleSide});
	});
	const { r } = gameConfig;
	const material = new three.MeshFaceMaterial(cubeMaterials);
	const geometry = new three.BoxGeometry(r, r, r);
	const cube = new three.Mesh(geometry, material);
	cube.position.y = r * 0.5;
	return cube;
};

const preparePlane = (gameConfig, floorMap) => {
	const { r } = gameConfig;
	const planes = [];
	for (let i = 0; i < floorMap.length; i += 1) {
		planes.push([]);
		for (let j = 0; j < floorMap[0].length; j += 1) {
			const geometry = new three.PlaneGeometry(r, r);
			const material = new three.MeshLambertMaterial({color: floorMap[i][j] ? pickColor : getCellColor(i, j), side: three.DoubleSide});
			const plane = new three.Mesh(geometry, material);
			plane.position.set(i * r, 0, -j * r);
			plane.rotation.x = Math.PI / 2;
			planes[i].push(plane);
		}
	}
	return planes;
};

class Game {
	constructor(config) {
		this.config = config;
		//const placed = [{i: 2, j: 3}, {i: 3, j: 1}, {i: 0, j: 2}, {i: 0, j: 3}, {i: 1, j: 0}, {i: 1, j: 1}];
		//this.cubeMap = [true, true, true, true, true, false];
		this.cubeMap = [false, false, false, false, false, false];
		const placed = placeColors(config.gridSize);
		this.floorMap = this.getFloorMap(placed);
		this.elements = {
			cube: prepareCube(config, this.cubeMap),
			planes: preparePlane(config, this.floorMap)
		};
		this.player = new Cube(this.elements.cube, config.gridSize, config.r); 
	}

	getFloorMap(placed) {
		const floorMap = initializeFloorMap(this.config.gridSize);
		placed.forEach(pos => {
			floorMap[pos.i][pos.j] = true;
		});
		return floorMap;
	}

	setCubeBottom(colored) {
		const color = colored ? pickColor : defaultCubeColor;
		const { cubeMap, player } = this;
		const { cube } = this.elements;
		cubeMap[player.state.config.bottom] = colored;
		cube.material[player.state.config.bottom].color.setHex(color);
	}

	setFloor(x, z, colored) {
		const { floorMap } = this;
		const { planes } = this.elements;
		floorMap[x][z] = colored;
		const color = colored ? pickColor : getCellColor(x, z);
		planes[x][z].material.color.setHex(color);
	}

};

export default Game;
