class Game {
    constructor() {
        this.graph = null;
        this.ui = null;
        this.startTime = null;
        this.timerInterval = null;
        this.timerEnabled = true;
        this.elapsedTime = 0;
        
        // Game settings
        this.gameSettings = {
            edgeCosts: true,   // If false, costs are on nodes
            nodeCosts: false,
            nodeCount: 10,
            complexity: 0.25   // Probability of edges
        };
        
        // DOM elements
        this.timerElement = document.getElementById('timer');
        this.timerToggleBtn = document.getElementById('timer-toggle');
        this.resetButton = document.getElementById('reset-btn');
        this.submitButton = document.getElementById('submit-btn');
        
        // Options panel elements
        this.edgeCostsBtn = document.getElementById('edge-costs-btn');
        this.nodeCostsBtn = document.getElementById('node-costs-btn');
        this.complexitySlider = document.getElementById('complexity-slider');
        this.complexityValue = document.getElementById('complexity-value');
        this.nodeCountSlider = document.getElementById('node-count-slider');
        this.nodeCountValue = document.getElementById('node-count-value');
        this.randomizeBtn = document.getElementById('randomize-btn');
        this.applySettingsBtn = document.getElementById('apply-settings-btn');
        
        // Settings panel toggle
        this.toggleOptionsBtn = document.getElementById('toggle-options');
        this.optionsPanel = document.querySelector('.options-panel');
        this.optionsPanelExpanded = true;
        
        // Set up event listeners
        this.resetButton.addEventListener('click', () => this.resetGame());
        this.submitButton.addEventListener('click', () => this.submitPath());
        this.timerToggleBtn.addEventListener('click', () => this.toggleTimer());
        
        // Options panel event listeners
        this.edgeCostsBtn.addEventListener('click', () => this.toggleCostDisplay('edge'));
        this.nodeCostsBtn.addEventListener('click', () => this.toggleCostDisplay('node'));
        this.complexitySlider.addEventListener('input', () => this.updateComplexityValue());
        this.nodeCountSlider.addEventListener('input', () => this.updateNodeCountValue());
        this.randomizeBtn.addEventListener('click', () => this.randomizeSettings());
        this.applySettingsBtn.addEventListener('click', () => this.applySettings());
        
        // Options panel toggle listener
        this.toggleOptionsBtn.addEventListener('click', () => this.toggleOptionsPanel());
        document.querySelector('.options-header').addEventListener('click', (e) => {
            if (e.target !== this.toggleOptionsBtn) {
                this.toggleOptionsPanel();
            }
        });
        
        // Initialize the game
        this.initGame();
    }
    
    initGame() {
        try {
            console.log("Initializing game...");
            
            // Ensure container has dimensions before creating graph
            const container = document.getElementById('graph-container');
            if (container.offsetWidth === 0 || container.offsetHeight === 0) {
                console.error("Graph container has no dimensions. Setting default dimensions.");
                container.style.width = "800px";
                container.style.height = "500px";
            }
            
            // Create a new graph with current settings
            this.graph = new Graph(
                this.gameSettings.nodeCount, 
                this.gameSettings.complexity, 
                this.gameSettings.edgeCosts
            );
            
            this.ui = new GameUI(this.graph, this.gameSettings);
            
            // Render the graph
            this.ui.renderGraph();
            
            // Reset elapsed time
            this.elapsedTime = 0;
            
            // Start the timer if enabled
            if (this.timerEnabled) {
                this.startTimer();
            } else {
                this.timerElement.textContent = `Time: paused`;
            }
            
            console.log("Game initialized successfully!");
        } catch (error) {
            console.error("Error initializing game:", error);
            document.getElementById('status-message').textContent = "Error initializing game. Check console for details.";
        }
    }
    
    toggleCostDisplay(type) {
        if (type === 'edge') {
            this.gameSettings.edgeCosts = true;
            this.gameSettings.nodeCosts = false;
            this.edgeCostsBtn.classList.add('active');
            this.nodeCostsBtn.classList.remove('active');
        } else {
            this.gameSettings.edgeCosts = false;
            this.gameSettings.nodeCosts = true;
            this.edgeCostsBtn.classList.remove('active');
            this.nodeCostsBtn.classList.add('active');
        }
    }
    
    updateComplexityValue() {
        const value = this.complexitySlider.value;
        this.complexityValue.textContent = value;
        this.gameSettings.complexity = parseFloat(value);
    }
    
    updateNodeCountValue() {
        const value = this.nodeCountSlider.value;
        this.nodeCountValue.textContent = value;
        this.gameSettings.nodeCount = parseInt(value);
    }
    
    randomizeSettings() {
        // Randomize node count between 5 and 20
        const randomNodeCount = Math.floor(Math.random() * 16) + 5;
        this.nodeCountSlider.value = randomNodeCount;
        this.nodeCountValue.textContent = randomNodeCount;
        this.gameSettings.nodeCount = randomNodeCount;
        
        // Randomize complexity between 0.1 and 0.5
        const randomComplexity = Math.round((Math.random() * 0.4 + 0.1) * 100) / 100;
        this.complexitySlider.value = randomComplexity;
        this.complexityValue.textContent = randomComplexity;
        this.gameSettings.complexity = randomComplexity;
        
        // Randomly choose between node and edge costs
        if (Math.random() > 0.5) {
            this.toggleCostDisplay('edge');
        } else {
            this.toggleCostDisplay('node');
        }
    }
    
    applySettings() {
        // Apply current settings and reset the game
        this.resetGame();
    }
    
    resetGame() {
        // Stop the current timer
        this.stopTimer();
        
        // Clear status message
        document.getElementById('status-message').textContent = '';
        
        // Reinitialize the game
        this.initGame();
    }
    
    startTimer() {
        if (!this.timerEnabled) return;
        
        this.startTime = Date.now() - (this.elapsedTime * 1000);
        
        // Update timer every second
        this.timerInterval = setInterval(() => {
            this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
            this.timerElement.textContent = `Time: ${this.elapsedTime}s`;
        }, 1000);
    }
    
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
            
            // Store elapsed time if timer was running
            if (this.startTime) {
                this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
            }
        }
    }
    
    toggleTimer() {
        this.timerEnabled = !this.timerEnabled;
        
        if (this.timerEnabled) {
            this.startTimer();
            this.timerToggleBtn.textContent = 'Pause Timer';
        } else {
            this.stopTimer();
            this.timerElement.textContent = `Time: paused`;
            this.timerToggleBtn.textContent = 'Resume Timer';
        }
    }
    
    toggleOptionsPanel() {
        this.optionsPanelExpanded = !this.optionsPanelExpanded;
        
        if (this.optionsPanelExpanded) {
            this.optionsPanel.classList.remove('collapsed');
            this.optionsPanel.classList.add('expanded');
            this.toggleOptionsBtn.textContent = '▲';
        } else {
            this.optionsPanel.classList.remove('expanded');
            this.optionsPanel.classList.add('collapsed');
            this.toggleOptionsBtn.textContent = '▼';
        }
    }
    
    submitPath() {
        const lastNode = this.ui.selectedNodes[this.ui.selectedNodes.length - 1];
        
        // Check if path ends at the target
        if (lastNode !== this.graph.targetNode) {
            this.ui.showMessage("Your path must end at the target node!");
            return;
        }
        
        // Calculate path cost
        const userPathCost = this.ui.updatePathCost();
        
        // Find the optimal path
        const optimalPath = this.graph.findOptimalPath();
        
        // Stop the timer
        this.stopTimer();
        
        // Get time message
        let timeMessage = this.timerEnabled ? 
            ` in ${this.elapsedTime} seconds` : 
            ` (timer was paused)`;
        
        // Check if user's path is optimal
        if (userPathCost === optimalPath.cost) {
            this.ui.showMessage(`Perfect! You found the optimal path with cost ${userPathCost}${timeMessage}.`);
        } else {
            this.ui.showMessage(`Your path cost is ${userPathCost}, but the optimal cost is ${optimalPath.cost}. Try again!`);
        }
    }
}

// Start the game when the page is fully loaded
window.addEventListener('load', () => {
    try {
        console.log("DOM fully loaded, initializing game...");
        const game = new Game();
    } catch (error) {
        console.error("Error creating game instance:", error);
    }
});

// Keep the original DOMContentLoaded event as a fallback
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded event fired");
});