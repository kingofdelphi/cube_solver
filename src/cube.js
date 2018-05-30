import * as three from 'three';
import { canRotateState, rotateState, getInitialState } from './model';

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

class Cube {
	constructor(cubeObject, gridSize, r) {
		this.gridSize = gridSize;
		this.cubeObject = cubeObject;
		this.r = r;
		this.state = getInitialState();
	}

	canRotate(type, dir) {
		if (this.rotation) return false;
		return canRotateState(this.state, type, dir, this.gridSize);
	}

	rotationConfig(type, dir) {
		const { r, state: { position } } = this;
		const dx = type === 'z' ? r / 2 - position.x * r + (dir === 1 ? 0 : -r) : 0;
		const dz = type === 'x' ? -r / 2 + position.z * r + (dir === 1 ? 0 : r) : 0;
		return { type, angleLeft: dir * Math.PI / 2, dx, dz };
	}

	rotate(type, dir) {
		this.rotation = this.rotationConfig(type, dir);
		this.state = rotateState(this.state, type, dir);
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
