import { canRotateState, rotateState } from './model';

class Solver {
	constructor(gridSize) {
		this.gridSize = gridSize;
	}

	enumerateMoves(state) {
		const moves = 
			[
				{ type: 'x', dir: 1 },
				{ type: 'x', dir: -1 },
				{ type: 'z', dir: 1 },
				{ type: 'z', dir: -1 },
			];
		const result = moves
			.filter(move => canRotateState(state, move.type, move.dir, this.gridSize));
		return result;
	}

	// given cubeMap and floorMap, fill the next empty face of cube(if it exists)
	solve(state, cubeMap, floorMap) {
		console.log('solving');
	}

};

export default Solver;
