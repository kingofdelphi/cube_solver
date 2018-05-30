import { canRotateState, rotateState } from './model';
import * as buckets from 'buckets-js';

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
		const S = state => JSON.stringify(state);
		const distance = {[S(state)]: 0};
		const q = new buckets.PriorityQueue((a, b) => -distance[a] + distance[b]);
		q.add(S(state));
		const visited = {};
		const predecessor = {};
		let found = false;
		while (!found && !q.isEmpty()) {
			debugger;
			const s = q.dequeue();
			if (visited[s]) continue;
			visited[s] = true;
			const curstate = JSON.parse(s);
			const dist = distance[s];
			const { position } = curstate;
			if (floorMap[position.x][position.z] && !cubeMap[curstate.config.bottom]) {
				found = true;
				let cur = s;
				const moves = [];
				while (1) {
					const par = predecessor[cur];
					if (!par) break;
					moves.push(par.move);
					cur = par.parentStateStr;
				}
				console.log(moves.reverse());
				break;
			} else {
				this.enumerateMoves(curstate).forEach(move => {
					const st = rotateState(curstate, move.type, move.dir);
					const ms = S(st);
					const oldCost = distance[ms];
					//if cube bottom has color and floor doesn't extra 2 steps needed
					const newCost = dist + 1 + 2 * (floorMap[position.x][position.z] ^ cubeMap[curstate.config.bottom] ? 1 : 0);
					if (typeof oldCost === 'undefined' || oldCost > newCost) {
						distance[ms] = newCost;
						q.add(ms);
						predecessor[ms] = { parentStateStr: s, move };
					}
				});
			}
		}
	}

};

export default Solver;
