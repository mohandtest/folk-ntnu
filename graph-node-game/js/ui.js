class GameUI {
    constructor(graph, gameSettings) {
        this.graph = graph;
        this.gameSettings = gameSettings;
        this.selectedNodes = [graph.sourceNode]; // Start with source node selected
        this.graphContainer = document.getElementById('graph-container');
        this.nodeElements = [];
        this.edgeElements = [];
        this.pathEdgeElements = [];
        this.draggedNode = null;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;
    }

    renderGraph() {
        try {
            console.log("Rendering graph...");
            this.graphContainer.innerHTML = '';
            this.nodeElements = [];
            this.edgeElements = [];
            this.pathEdgeElements = [];
            
            // Log container dimensions for debugging
            console.log("Container dimensions:", this.graphContainer.offsetWidth, "x", this.graphContainer.offsetHeight);
            
            // Draw edges first so they appear under the nodes
            this.renderEdges();
            
            // Then draw nodes
            this.renderNodes();
            
            console.log("Graph rendering complete");
        } catch (error) {
            console.error("Error rendering graph:", error);
            this.showMessage("Error rendering graph. See console for details.");
        }
    }

    renderNodes() {
        for (let i = 0; i < this.graph.nodes.length; i++) {
            const node = this.graph.nodes[i];
            
            const nodeElement = document.createElement('div');
            nodeElement.className = 'node';
            
            // Position the node
            nodeElement.style.left = `${node.x - 25}px`; // Offset by half node width
            nodeElement.style.top = `${node.y - 25}px`; // Offset by half node height
            
            // Add special classes for source and target nodes
            if (i === this.graph.sourceNode) {
                nodeElement.classList.add('source');
                nodeElement.textContent = 'S';
            } else if (i === this.graph.targetNode) {
                nodeElement.classList.add('target');
                nodeElement.textContent = 'T';
            } else {
                // Leave nodes empty in edge costs mode, show cost in node costs mode
                nodeElement.textContent = this.gameSettings.edgeCosts ? "" : node.cost;
            }
            
            // Check if node is in the current path
            if (this.selectedNodes.includes(i)) {
                nodeElement.classList.add('selected');
            }
            
            // Add click event handler
            nodeElement.addEventListener('click', () => this.handleNodeClick(i));
            
            // Add drag event handlers
            nodeElement.addEventListener('mousedown', (e) => this.startDrag(e, i));
            
            this.graphContainer.appendChild(nodeElement);
            this.nodeElements[i] = nodeElement;
        }

        // Add global mouse event handlers for dragging
        document.addEventListener('mousemove', (e) => this.drag(e));
        document.addEventListener('mouseup', () => this.endDrag());
    }

    startDrag(event, nodeId) {
        // Prevent node click when starting drag
        event.stopPropagation();
        
        // Store which node is being dragged
        this.draggedNode = nodeId;
        
        // Calculate the offset between mouse position and node position
        const nodeElement = this.nodeElements[nodeId];
        const rect = nodeElement.getBoundingClientRect();
        this.dragOffsetX = event.clientX - rect.left - 25; // 25px is half the node width
        this.dragOffsetY = event.clientY - rect.top - 25; // 25px is half the node height
    }

    drag(event) {
        if (this.draggedNode === null) return;
        
        event.preventDefault();
        
        const containerRect = this.graphContainer.getBoundingClientRect();
        
        // Calculate new position within the container bounds
        let x = event.clientX - containerRect.left - this.dragOffsetX;
        let y = event.clientY - containerRect.top - this.dragOffsetY;
        
        // Apply bounds checking
        x = Math.max(25, Math.min(containerRect.width - 25, x));
        y = Math.max(25, Math.min(containerRect.height - 25, y));
        
        // Update node position in the model
        this.graph.nodes[this.draggedNode].x = x;
        this.graph.nodes[this.draggedNode].y = y;
        
        // Update node position in the DOM
        const nodeElement = this.nodeElements[this.draggedNode];
        nodeElement.style.left = `${x - 25}px`;
        nodeElement.style.top = `${y - 25}px`;
        
        // Update all connected edges
        this.updateEdges();
    }

    endDrag() {
        this.draggedNode = null;
    }

    updateEdges() {
        // Remove all existing edges and their cost labels
        for (const edge of this.edgeElements) {
            edge.element.remove();
            if (edge.costLabel) edge.costLabel.remove();
        }
        for (const edge of this.pathEdgeElements) {
            edge.element.remove();
            if (edge.costLabel) edge.costLabel.remove();
        }
        
        this.edgeElements = [];
        this.pathEdgeElements = [];
        this.renderEdges();
    }

    renderEdges() {
        // Draw all edges in the graph
        for (const edge of this.graph.edges) {
            this.drawEdge(edge.from, edge.to, false);
        }
        
        // Draw path edges
        this.updatePathEdges();
    }

    drawEdge(fromNodeId, toNodeId, isPath = false) {
        const fromNode = this.graph.nodes[fromNodeId];
        const toNode = this.graph.nodes[toNodeId];
        const edgeData = this.graph.getEdge(fromNodeId, toNodeId);
        
        // Create the edge line
        const edgeElement = document.createElement('div');
        edgeElement.className = isPath ? 'edge path-edge' : 'edge';
        
        const deltaX = toNode.x - fromNode.x;
        const deltaY = toNode.y - fromNode.y;
        const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
        
        edgeElement.style.width = `${length}px`;
        edgeElement.style.left = `${fromNode.x}px`;
        edgeElement.style.top = `${fromNode.y}px`;
        edgeElement.style.transform = `rotate(${angle}deg)`;
        
        // Only create cost label if using edge costs
        let costLabel = null;
        if (this.gameSettings.edgeCosts) {
            // Create and position the cost label
            costLabel = document.createElement('div');
            costLabel.className = 'edge-cost';
            costLabel.textContent = edgeData.cost;
            
            // Position the cost label in the middle of the edge
            costLabel.style.left = `${fromNode.x + deltaX / 2 - 10}px`;
            costLabel.style.top = `${fromNode.y + deltaY / 2 - 10}px`;
            
            this.graphContainer.appendChild(costLabel);
        }
        
        this.graphContainer.appendChild(edgeElement);
        
        if (isPath) {
            this.pathEdgeElements.push({element: edgeElement, costLabel: costLabel});
        } else {
            this.edgeElements.push({element: edgeElement, costLabel: costLabel});
        }
    }

    updatePathEdges() {
        // Remove old path edges
        for (const edge of this.pathEdgeElements) {
            edge.element.remove();
            edge.costLabel.remove();
        }
        this.pathEdgeElements = [];
        
        // Draw new path edges
        for (let i = 0; i < this.selectedNodes.length - 1; i++) {
            this.drawEdge(this.selectedNodes[i], this.selectedNodes[i + 1], true);
        }
    }

    handleNodeClick(nodeId) {
        if (this.draggedNode !== null) return; // Don't handle clicks during drag
        
        const lastSelected = this.selectedNodes[this.selectedNodes.length - 1];
        
        // If clicked on the last selected node, deselect it (unless it's the source)
        if (nodeId === lastSelected && this.selectedNodes.length > 1) {
            this.selectedNodes.pop();
            this.updateUI();
            return;
        }
        
        // If node is already in the path but not the last one, can't select
        if (this.selectedNodes.includes(nodeId) && nodeId !== lastSelected) {
            this.showMessage("You can't revisit a node in your path!");
            return;
        }
        
        // Check if the node is connected to the last selected node
        if (!this.graph.nodes[lastSelected].connections.includes(nodeId)) {
            this.showMessage("You can only connect to adjacent nodes!");
            return;
        }
        
        // Add the node to the selected path
        this.selectedNodes.push(nodeId);
        
        // Check if we reached the target
        if (nodeId === this.graph.targetNode) {
            this.showMessage("You've reached the target! Check your path or submit.");
        }
        
        this.updateUI();
    }

    updateUI() {
        // Update node highlighting
        for (let i = 0; i < this.nodeElements.length; i++) {
            if (this.selectedNodes.includes(i)) {
                this.nodeElements[i].classList.add('selected');
            } else {
                this.nodeElements[i].classList.remove('selected');
            }
        }
        
        // Update path edges
        this.updatePathEdges();
        
        // Update path cost
        this.updatePathCost();
    }

    updatePathCost() {
        let cost = 0;
        
        // Calculate cost based on game settings
        if (this.gameSettings.edgeCosts) {
            // Add the costs of all edges in the path
            for (let i = 0; i < this.selectedNodes.length - 1; i++) {
                const fromNode = this.selectedNodes[i];
                const toNode = this.selectedNodes[i + 1];
                const edge = this.graph.getEdge(fromNode, toNode);
                cost += edge.cost;
            }
        } else {
            // Add the costs of all nodes in the path except the source
            for (let i = 1; i < this.selectedNodes.length; i++) {
                cost += this.graph.nodes[this.selectedNodes[i]].cost;
            }
        }
        
        document.getElementById('path-cost').textContent = `Current path cost: ${cost}`;
        return cost;
    }

    showMessage(message) {
        const statusMessage = document.getElementById('status-message');
        statusMessage.textContent = message;
        
        // Clear the message after 3 seconds
        setTimeout(() => {
            if (statusMessage.textContent === message) {
                statusMessage.textContent = '';
            }
        }, 3000);
    }
}