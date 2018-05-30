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

const rotateState = (state, type, dir) => {
	const mv = getMovement(type, dir);
	const position = { 
		x: state.position.x + mv.dx, 
		z: state.position.z + mv.dz 
	};
	return {
		position,
		config: rotateCube(state.config, type, dir)
	};
};

const getInitialState = () => {
	const position = { 
		x: 0, 
		z: 0
	};
	const config = {
		right: 0,
		left: 1,
		top: 2,
		bottom: 3,
		front: 4,
		back: 5
	};
	return {
		position,
		config
	};
};

const canRotateState = (state, type, dir, gridSize) => {
	const mv = getMovement(type, dir);
	const { position } = state;
	const p = { 
		x: position.x + mv.dx, 
		z: position.z + mv.dz 
	};
	return p.x >= 0 && p.x < gridSize && p.z >= 0 && p.z < gridSize;
};

export {
	canRotateState,
	getInitialState,
	rotateState,
}
