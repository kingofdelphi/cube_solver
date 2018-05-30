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
		const S = state => JSON.stringify(state);
		const q = [state];
		const visited = {};
		const predecessor = {};
		const distance = {[S(state)]: 0};
		let found = false;
		while (!found && q.length > 0) {
			let sz = q.length;
			while (sz--) {
				const curstate = q.shift();
				const s = S(curstate);
				if (visited[s]) continue;
				visited[s] = true;
				const dist = distance[s];
				const { position } = curstate;
				if (floorMap[position.x][position.z]) {
					found = true;
					let cur = s;
					while (1) {
						const par = predecessor[cur];
						if (!par) break;
						console.log(par.move.type, -par.move.dir);
						cur = par.parentStateStr;
					}
					break;
				} else {
					this.enumerateMoves(curstate).forEach(move => {
						const st = rotateState(curstate, move.type, move.dir);
						q.push(st)
						const ms = S(st);
						let oldd = distance[ms];
						if (typeof oldd === 'undefined' || oldd > dist + 1) {
							distance[ms] = dist + 1;
							predecessor[ms] = { parentStateStr: s, move };
						}
					});
				}
			}
		}
	}

};

export default Solver;
