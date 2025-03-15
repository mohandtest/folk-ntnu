class Graph {
    constructor(nodeCount, edgeProbability, edgeCosts = true) {
        this.nodes = [];
        this.edges = [];
        this.nodeCount = nodeCount;
        this.sourceNode = null;
        this.targetNode = null;
        this.useEdgeCosts = edgeCosts;
        
        this.generateNodes();
        this.generateEdges(edgeProbability);
        this.selectSourceAndTarget();
    }

    generateNodes() {
        const container = document.getElementById('graph-container');
        const width = container.offsetWidth;
        const height = container.offsetHeight;
        const minDistance = 100; // Minimum distance between nodes
        
        for (let i = 0; i < this.nodeCount; i++) {
            let x, y;
            let validPosition = false;
            let attempts = 0;
            const maxAttempts = 100; // Prevent infinite loops
            
            // Try to find a position that's far enough from existing nodes
            while (!validPosition && attempts < maxAttempts) {
                x = Math.random() * (width - 100) + 50;
                y = Math.random() * (height - 100) + 50;
                validPosition = true;
                
                // Check distance from all existing nodes
                for (let j = 0; j < i; j++) {
                    const existingNode = this.nodes[j];
                    const distance = Math.sqrt(
                        Math.pow(existingNode.x - x, 2) + 
                        Math.pow(existingNode.y - y, 2)
                    );
                    
                    if (distance < minDistance) {
                        validPosition = false;
                        break;
                    }
                }
                
                attempts++;
            }
            
            // Only assign cost to nodes in node costs mode
            const cost = this.useEdgeCosts ? 0 : Math.floor(Math.random() * 9) + 1;
            
            this.nodes.push({
                id: i,
                x: x,
                y: y,
                cost: cost,
                connections: []
            });
        }
    }

    generateEdges(probability) {
        // Reduce probability slightly to create less complex graphs
        const adjustedProbability = probability * 0.8;
        
        // Create edges between nodes with the given probability
        for (let i = 0; i < this.nodeCount; i++) {
            for (let j = i + 1; j < this.nodeCount; j++) {
                if (Math.random() < adjustedProbability) {
                    const cost = this.useEdgeCosts ? Math.floor(Math.random() * 9) + 1 : 0;
                    
                    this.edges.push({
                        from: i,
                        to: j,
                        cost: cost
                    });
                    
                    // Add connections to both nodes
                    this.nodes[i].connections.push(j);
                    this.nodes[j].connections.push(i);
                }
            }
        }
        
        // Ensure the graph is connected using a minimal spanning tree approach
        this.ensureConnected();
    }

    ensureConnected() {
        // Track which nodes are connected
        const connected = new Set([0]);
        const unconnected = new Set(Array.from({ length: this.nodeCount }, (_, i) => i).slice(1));
        
        // Keep connecting nodes until all are connected
        while (unconnected.size > 0) {
            let closestFrom = null;
            let closestTo = null;
            let minDistance = Infinity;
            
            // Find the closest pair of nodes between connected and unconnected sets
            for (const i of connected) {
                for (const j of unconnected) {
                    const nodeI = this.nodes[i];
                    const nodeJ = this.nodes[j];
                    const distance = Math.sqrt(
                        Math.pow(nodeI.x - nodeJ.x, 2) + Math.pow(nodeI.y - nodeJ.y, 2)
                    );
                    
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestFrom = i;
                        closestTo = j;
                    }
                }
            }
            
            // Add an edge between these nodes with a random cost
            const cost = this.useEdgeCosts ? Math.floor(Math.random() * 9) + 1 : 0;
            this.edges.push({
                from: closestFrom,
                to: closestTo,
                cost: cost
            });
            
            // Update connections
            this.nodes[closestFrom].connections.push(closestTo);
            this.nodes[closestTo].connections.push(closestFrom);
            
            // Update sets
            connected.add(closestTo);
            unconnected.delete(closestTo);
        }
    }

    // Get the edge between two nodes (if it exists)
    getEdge(fromNodeId, toNodeId) {
        return this.edges.find(edge => 
            (edge.from === fromNodeId && edge.to === toNodeId) || 
            (edge.from === toNodeId && edge.to === fromNodeId)
        );
    }

    selectSourceAndTarget() {
        // Choose a random source node
        const sourceIndex = Math.floor(Math.random() * this.nodeCount);
        
        // Calculate distances from the source node to all other nodes
        const distances = this.calculateShortestPaths(sourceIndex);
        
        // Find the node(s) with the maximum distance from the source
        let maxDistance = 0;
        let farthestNodes = [];
        
        for (let i = 0; i < this.nodeCount; i++) {
            if (i !== sourceIndex && distances[i] !== Infinity) {
                if (distances[i] > maxDistance) {
                    maxDistance = distances[i];
                    farthestNodes = [i];
                } else if (distances[i] === maxDistance) {
                    farthestNodes.push(i);
                }
            }
        }
        
        // If we found at least one farthest node, pick one randomly
        let targetIndex;
        if (farthestNodes.length > 0) {
            const randomIndex = Math.floor(Math.random() * farthestNodes.length);
            targetIndex = farthestNodes[randomIndex];
        } else {
            // Fallback - just pick a random node that's not the source
            do {
                targetIndex = Math.floor(Math.random() * this.nodeCount);
            } while (targetIndex === sourceIndex);
        }
        
        this.sourceNode = sourceIndex;
        this.targetNode = targetIndex;
        
        console.log(`Selected source: ${sourceIndex}, target: ${targetIndex}, distance: ${distances[targetIndex]}`);
    }

    calculateShortestPaths(startNodeId) {
        // Dijkstra's algorithm to calculate shortest paths
        const distances = Array(this.nodeCount).fill(Infinity);
        distances[startNodeId] = 0;
        const unvisited = new Set(Array.from({ length: this.nodeCount }, (_, i) => i));
        
        while (unvisited.size > 0) {
            // Find node with minimum distance
            let current = null;
            let minDistance = Infinity;
            for (const node of unvisited) {
                if (distances[node] < minDistance) {
                    current = node;
                    minDistance = distances[node];
                }
            }
            
            // If we can't reach any more nodes, break
            if (current === null || distances[current] === Infinity) break;
            
            unvisited.delete(current);
            
            // Update distances to neighbors
            for (const neighborId of this.nodes[current].connections) {
                // Cost depends on whether we're using edge costs or node costs
                const cost = this.useEdgeCosts ? 
                    this.getEdge(current, neighborId).cost : 
                    this.nodes[neighborId].cost;
                    
                const totalCost = distances[current] + cost;
                if (totalCost < distances[neighborId]) {
                    distances[neighborId] = totalCost;
                }
            }
        }
        
        return distances;
    }

    findOptimalPath() {
        // Use Dijkstra's algorithm to find the optimal path
        const distances = Array(this.nodeCount).fill(Infinity);
        distances[this.sourceNode] = 0;
        
        const previous = Array(this.nodeCount).fill(null);
        const unvisited = new Set(Array.from({ length: this.nodeCount }, (_, i) => i));
        
        while (unvisited.size > 0) {
            // Find node with minimum distance
            let current = null;
            let minDistance = Infinity;
            for (const node of unvisited) {
                if (distances[node] < minDistance) {
                    current = node;
                    minDistance = distances[node];
                }
            }
            
            if (current === null || distances[current] === Infinity) break;
            if (current === this.targetNode) break;
            
            unvisited.delete(current);
            
            // Update distances to neighbors
            for (const neighborId of this.nodes[current].connections) {
                // Cost depends on whether we're using edge costs or node costs
                const cost = this.useEdgeCosts ? 
                    this.getEdge(current, neighborId).cost : 
                    this.nodes[neighborId].cost;
                    
                const totalCost = distances[current] + cost;
                if (totalCost < distances[neighborId]) {
                    distances[neighborId] = totalCost;
                    previous[neighborId] = current;
                }
            }
        }
        
        // Build the path
        const path = [];
        let current = this.targetNode;
        
        while (current !== null) {
            path.unshift(current);
            current = previous[current];
        }
        
        return {
            path: path,
            cost: distances[this.targetNode]
        };
    }
}