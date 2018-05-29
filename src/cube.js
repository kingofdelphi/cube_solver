import * as three from 'three';

function rotateAroundWorldAxis(object, axis, radians, dx, dy, dz) {
	const t = new three.Matrix4();
	t.makeTranslation(dx, dy, dz);
	object.applyMatrix(t);
	const rotWorldMatrix = new three.Matrix4();
	rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);
	object.applyMatrix(rotWorldMatrix);
	t.makeTranslation(-dx, -dy, -dz);
	object.applyMatrix(t);
}

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

const getMovement = (type, dir) => {
	switch (type) {
		case 'z':
			if (dir === 1) return { dx: -1, dz: 0 };
			return { dx: 1, dz: 0 };
		case 'x':
			if (dir === 1) return { dx: 0, dz: -1 };
			return { dx: 0, dz: 1 };
		default:
			return { dx: 0, dz: 0 };
	}
};

class Cube {
	constructor(cubeObject, gridSize, r) {
		this.gridSize = gridSize;
		this.cubeObject = cubeObject;
		this.r = r;
		this.position = { 
			x: 0, 
			z: 0
		};
		this.config = {
			right: 0,
			left: 1,
			top: 2,
			bottom: 3,
			front: 4,
			back: 5
		};
	}

	canRotate(type, dir) {
		if (this.rotation) return false;
		const mv = getMovement(type, dir);
		const p = { 
			x: this.position.x + mv.dx, 
			z: this.position.z + mv.dz 
		};
		return p.x >= 0 && p.x < this.gridSize && p.z >= 0 && p.z < this.gridSize;
	}

	rotationConfig(type, dir) {
		const { r, position } = this;
		const dx = type === 'z' ? r / 2 - position.x * r + (dir === 1 ? 0 : -r) : 0;
		const dz = type === 'x' ? -r / 2 + position.z * r + (dir === 1 ? 0 : r) : 0;
		return { type, angleLeft: dir * Math.PI / 2, dx, dz };
	}

	rotate(type, dir) {
		this.rotation = this.rotationConfig(type, dir);
		this.config = rotateCube(this.config, type, dir);
		const mv = getMovement(type, dir);
		this.position = { 
			x: this.position.x + mv.dx, 
			z: this.position.z + mv.dz 
		};
	}

	update(factor) {
		const { rotation } = this;
		const f = rotation.angleLeft * factor;
		const axis = rotation.type === 'z' ? new three.Vector3(0, 0, 1) : new three.Vector3(1, 0, 0);
		rotateAroundWorldAxis(this.cubeObject, axis, f, rotation.dx, 0, rotation.dz);
		rotation.angleLeft -= f;
		if (Math.abs(rotation.angleLeft) <= 1e-3) {
			this.rotation = undefined;
		}
	}
};

export {
	Cube,
	rotateCube,
};
