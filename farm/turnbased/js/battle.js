/**
 * Battle.js - Handles battle mechanics and UI interaction
 */

class BattleSystem {
    constructor(modelLoader, camera) {
        this.modelLoader = modelLoader;
        this.camera = camera;
        
        // Battle state
        this.playerAnimal = null;
        this.enemyAnimal = null;
        this.playerStats = null;
        this.enemyStats = null;
        this.currentHealth = {
            player: 0,
            enemy: 0
        };
        this.isPlayerTurn = true;
        this.battleActive = false;
        
        // New state tracking
        this.turnCounter = 1;
        this.playerEffects = []; // Active status effects
        this.enemyEffects = []; // Active status effects
        this.attackCooldowns = {
            player: {},
            enemy: {}
        };
        
        // UI elements
        this.battleUI = document.getElementById('battleUI');
        this.battleMessage = document.getElementById('battleMessage');
        this.battleOptions = document.getElementById('battleOptions');
        this.playerHealthBar = document.getElementById('playerHealth');
        this.enemyHealthBar = document.getElementById('enemyHealth');
        
        // Animation states
        this.animationInProgress = false;
        
        // Create status effect display
        this.createStatusEffectDisplay();

        console.log("Battle system initialized");
    }
    
    // Create UI elements for status effects
    createStatusEffectDisplay() {
        // Create containers for status effect icons
        const healthBars = document.querySelector('.health-bars');
        
        // Player status effects
        const playerStatusContainer = document.createElement('div');
        playerStatusContainer.className = 'status-effects player-status';
        playerStatusContainer.id = 'playerStatus';
        
        // Enemy status effects
        const enemyStatusContainer = document.createElement('div');
        enemyStatusContainer.className = 'status-effects enemy-status';
        enemyStatusContainer.id = 'enemyStatus';
        
        // Add to UI
        healthBars.appendChild(playerStatusContainer);
        healthBars.appendChild(enemyStatusContainer);
        
        // Add CSS to head
        const style = document.createElement('style');
        style.textContent = `
            .status-effects {
                display: flex;
                gap: 5px;
                margin-top: 5px;
            }
            .status-effect {
                background-color: rgba(0,0,0,0.5);
                color: white;
                border-radius: 3px;
                padding: 2px 5px;
                font-size: 12px;
                display: flex;
                align-items: center;
            }
            .status-effect-icon {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                margin-right: 3px;
            }
            .confuse .status-effect-icon { background-color: purple; }
            .stun .status-effect-icon { background-color: yellow; }
            .accuracy_down .status-effect-icon { background-color: #87ceeb; }
            .defense_down .status-effect-icon { background-color: orange; }
            .player-status { justify-content: flex-start; }
            .enemy-status { justify-content: flex-end; }
        `;
        document.head.appendChild(style);
    }
    
    // Initialize a new battle with enhanced stats
    startBattle(playerAnimal, enemyAnimal) {
        console.log(`Starting battle: ${playerAnimal} vs ${enemyAnimal}`);
        
        // Convert animal types to lowercase for case-insensitive matching
        this.playerAnimal = playerAnimal.toLowerCase();
        this.enemyAnimal = enemyAnimal.toLowerCase();
        
        console.log("Normalized animal types:", this.playerAnimal, this.enemyAnimal);
        
        // Get stats for both animals with robust error handling
        try {
            if (!AnimalStats[this.playerAnimal]) {
                console.error(`Stats not found for player animal: ${this.playerAnimal}`);
                console.log("Available stats:", Object.keys(AnimalStats));
                this.playerStats = AnimalStats['chicken']; // Default to chicken if stats not found
                this.playerAnimal = 'chicken';
            } else {
                this.playerStats = Object.assign({}, AnimalStats[this.playerAnimal]);
                console.log("Found player stats for", this.playerAnimal);
            }
            
            if (!AnimalStats[this.enemyAnimal]) {
                console.error(`Stats not found for enemy animal: ${this.enemyAnimal}`);
                console.log("Available stats:", Object.keys(AnimalStats));
                this.enemyStats = AnimalStats['pig']; // Default to pig if stats not found
                this.enemyAnimal = 'pig';
            } else {
                this.enemyStats = Object.assign({}, AnimalStats[this.enemyAnimal]);
                console.log("Found enemy stats for", this.enemyAnimal);
            }
        } catch (error) {
            console.error("Error getting animal stats:", error);
            // Emergency fallback
            this.playerStats = AnimalStats['chicken'];
            this.enemyStats = AnimalStats['pig'];
            this.playerAnimal = 'chicken';
            this.enemyAnimal = 'pig';
        }
        
        console.log("Final player stats:", this.playerStats);
        console.log("Final enemy stats:", this.enemyStats);
        
        // Set initial health
        this.currentHealth.player = this.playerStats.maxHealth;
        this.currentHealth.enemy = this.enemyStats.maxHealth;
        console.log(`Initial health - Player: ${this.currentHealth.player}, Enemy: ${this.currentHealth.enemy}`);
        
        // Update health bars
        this.updateHealthBars();
        
        // Player goes first
        this.isPlayerTurn = true;
        this.animationInProgress = false;
        
        // Reset turn counter and effects
        this.turnCounter = 1;
        this.playerEffects = [];
        this.enemyEffects = [];
        this.attackCooldowns = {
            player: {},
            enemy: {}
        };
        
        // Show battle UI
        this.battleUI.style.display = 'block';
        
        // Generate move buttons
        this.generateMoveButtons();
        
        // Set battle message
        this.setMessage(`A wild ${this.enemyStats.name} appeared!`);
        
        // Active battle flag
        this.battleActive = true;
        
        // Focus camera on the enemy first
        this.camera.focusOn('enemy');
        
        // After a delay, focus on player for their turn
        setTimeout(() => {
            this.camera.focusOn('player');
            this.setMessage(`What will ${this.playerStats.name} do?`);
        }, 2000);
        
        // Update UI with initial info
        this.updateStatusEffectsDisplay();
        this.updateAttackButtonState();
    }
    
    // Generate move buttons with enhanced info
    generateMoveButtons() {
        // Clear existing buttons
        this.battleOptions.innerHTML = '';
        
        // Create button for each move with enhanced info
        this.playerStats.attacks.forEach((attack, index) => {
            const button = document.createElement('button');
            button.className = 'battle-option';
            button.setAttribute('data-attack', index);
            
            // Build button content with additional info
            let buttonContent = `<strong>${attack.name}</strong> <span class="attack-type">${attack.type}</span><br>`;
            buttonContent += `<small>${attack.description}</small><br>`;
            buttonContent += `<div class="attack-stats">`;
            buttonContent += `<span class="damage">DMG: ${attack.damage}</span>`;
            if (attack.accuracy) {
                buttonContent += ` <span class="accuracy">ACC: ${attack.accuracy}%</span>`;
            }
            buttonContent += `</div>`;
            
            // If attack has a cooldown, add counter
            if (attack.cooldown) {
                const remainingCooldown = this.attackCooldowns.player[index] || 0;
                if (remainingCooldown > 0) {
                    buttonContent += `<div class="cooldown">Cooldown: ${remainingCooldown}</div>`;
                }
            }
            
            button.innerHTML = buttonContent;
            button.onclick = () => this.playerAttack(attack, index);
            
            // Disable if on cooldown
            if (attack.cooldown && (this.attackCooldowns.player[index] || 0) > 0) {
                button.disabled = true;
            }
            
            this.battleOptions.appendChild(button);
        });
        
        // Add CSS for new button elements
        const style = document.createElement('style');
        style.textContent = `
            .attack-type {
                float: right;
                background-color: #666;
                color: white;
                padding: 0 5px;
                border-radius: 3px;
                font-size: 12px;
            }
            .attack-stats {
                display: flex;
                justify-content: space-between;
                margin-top: 5px;
                font-size: 12px;
            }
            .damage { color: #ff5252; }
            .accuracy { color: #2196f3; }
            .cooldown {
                color: #ff9800;
                text-align: center;
                margin-top: 5px;
            }
            .battle-option:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }
            .battle-option[data-attack="0"] { border-left: 3px solid #ff5252; }
            .battle-option[data-attack="1"] { border-left: 3px solid #4caf50; }
            .battle-option[data-attack="2"] { border-left: 3px solid #2196f3; }
            .battle-option[data-attack="3"] { border-left: 3px solid #ff9800; }
        `;
        document.head.appendChild(style);
    }
    
    // Handle player's attack with enhanced mechanics
    playerAttack(attack, attackIndex) {
        // Check if effect prevents action
        const effectResult = this.checkStatusEffectsTurn('player');
        if (effectResult && !effectResult.canAct) {
            this.setMessage(effectResult.message);
            setTimeout(() => {
                this.switchTurnToEnemy();
            }, 1500);
            return;
        }
        
        // Check if attack is on cooldown
        if (attack.cooldown && (this.attackCooldowns.player[attackIndex] || 0) > 0) {
            this.setMessage(`${attack.name} is still on cooldown!`);
            return;
        }
        
        // Prevent actions if it's not player's turn or animation is in progress
        if (!this.isPlayerTurn || this.animationInProgress || !this.battleActive) {
            console.log("Attack prevented due to state conditions");
            return;
        }
        
        // Start attack sequence
        this.animationInProgress = true;
        
        // Disable buttons during animation
        this.disableAttackButtons(true);
        
        // Show attack message
        this.setMessage(`${this.playerStats.name} used ${attack.name}!`);
        
        // Focus camera on player
        this.camera.focusOn('player');
        
        // Animate the attack after a short delay
        setTimeout(() => {
            // Get model positions
            const enemyPosition = this.modelLoader.getModel('enemy').position;
            
            this.modelLoader.animateAttack('player', enemyPosition, () => {
                // Apply attack logic
                this.executeAttack(attack, attackIndex, 'player', 'enemy');
                
                // Check if battle should end
                if (this.currentHealth.enemy <= 0) {
                    this.endBattle(true);
                    return;
                }
                
                // Set attack on cooldown if needed
                if (attack.cooldown) {
                    this.attackCooldowns.player[attackIndex] = attack.cooldown;
                }
                
                // Update UI
                this.updateStatusEffectsDisplay();
                
                // Switch turns after a delay
                setTimeout(() => {
                    this.switchTurnToEnemy();
                }, 1500);
            });
        }, 500);
    }
    
    // Switch turn to enemy
    switchTurnToEnemy() {
        this.isPlayerTurn = false;
        console.log("Switched turn to enemy");
        
        // Decrease player cooldowns
        this.decreaseCooldowns('player');
        
        // Update attack button state
        this.updateAttackButtonState();
        
        // Process enemy turn with a delay
        this.animationInProgress = false;
        setTimeout(() => {
            this.enemyAttack();
        }, 1000);
    }
    
    // Handle enemy's attack with enhanced mechanics
    enemyAttack() {
        console.log("Enemy attack function called");
        
        // Check if effect prevents action
        const effectResult = this.checkStatusEffectsTurn('enemy');
        if (effectResult && !effectResult.canAct) {
            this.setMessage(effectResult.message);
            setTimeout(() => {
                this.switchTurnToPlayer();
            }, 1500);
            return;
        }
        
        if (this.animationInProgress || !this.battleActive) {
            console.log("Enemy attack prevented due to animation in progress or battle inactive");
            return;
        }
        
        this.animationInProgress = true;
        
        // Choose an attack
        const availableAttacks = this.enemyStats.attacks.filter((attack, index) => {
            return !attack.cooldown || (this.attackCooldowns.enemy[index] || 0) === 0;
        });
        
        if (availableAttacks.length === 0) {
            // No available attacks, use a basic attack
            const basicAttack = {
                name: "Struggle",
                damage: 5,
                type: "Normal",
                accuracy: 100,
                description: "A desperate attack when no moves are available"
            };
            
            this.setMessage(`${this.enemyStats.name} used Struggle!`);
            
            // Continue with attack
            this.executeBasicAttack(basicAttack, 'enemy', 'player');
            return;
        }
        
        // Select a random available attack
        const attackIndex = this.enemyStats.attacks.findIndex(attack => availableAttacks.includes(attack));
        const attack = availableAttacks[Math.floor(Math.random() * availableAttacks.length)];
        
        // Show attack message
        this.setMessage(`${this.enemyStats.name} used ${attack.name}!`);
        
        // Focus camera on enemy
        this.camera.focusOn('enemy');
        
        // Animate the attack after a short delay
        setTimeout(() => {
            const playerPosition = this.modelLoader.getModel('player').position;
            
            this.modelLoader.animateAttack('enemy', playerPosition, () => {
                // Apply attack logic
                this.executeAttack(attack, attackIndex, 'enemy', 'player');
                
                // Check if battle should end
                if (this.currentHealth.player <= 0) {
                    this.endBattle(false);
                    return;
                }
                
                // Set attack on cooldown if needed
                if (attack.cooldown) {
                    this.attackCooldowns.enemy[attackIndex] = attack.cooldown;
                }
                
                // Update UI
                this.updateStatusEffectsDisplay();
                
                // Switch turns after a delay
                setTimeout(() => {
                    this.switchTurnToPlayer();
                }, 1500);
            });
        }, 500);
    }
    
    // Switch turn to player
    switchTurnToPlayer() {
        this.isPlayerTurn = true;
        console.log("Switched turn back to player");
        
        // Decrease enemy cooldowns
        this.decreaseCooldowns('enemy');
        
        // Update effects
        this.updateStatusEffects();
        this.updateStatusEffectsDisplay();
        
        // Increment turn counter
        this.turnCounter++;
        
        // Re-enable attack buttons
        this.disableAttackButtons(false);
        this.updateAttackButtonState();
        
        // Focus camera on player
        this.camera.focusOn('player');
        
        // Update message
        this.setMessage(`Turn ${this.turnCounter}: What will ${this.playerStats.name} do?`);
        
        this.animationInProgress = false;
    }
    
    // Execute attack with accuracy check, damage calculation, and effects
    executeAttack(attack, attackIndex, attackerType, defenderType) {
        // Get attacker and defender stats
        const attacker = attackerType === 'player' ? this.playerStats : this.enemyStats;
        const defender = defenderType === 'player' ? this.playerStats : this.enemyStats;
        
        // Check for confusion, which might redirect the attack
        const confusionEffect = this.checkStatusEffectsAttack(attackerType, defenderType, attack, attack.damage);
        if (confusionEffect && confusionEffect.target !== defenderType) {
            // Attacker hit themselves in confusion
            if (confusionEffect.message) {
                this.setMessage(confusionEffect.message);
            }
            
            // Apply self-damage
            this.dealDamage(attackerType, confusionEffect.damage);
            return;
        }
        
        // Check if attack hits based on accuracy
        if (!CombatUtils.checkHit(attack)) {
            this.setMessage(`${attacker.name}'s attack missed!`);
            return;
        }
        
        // Calculate damage with type effectiveness
        const damageResult = CombatUtils.calculateDamage(attack, attacker, defender);
        let damage = damageResult.damage;
        
        // Check for defense modification effects
        const defenseEffect = this.checkStatusEffectsDefend(attackerType, defenderType, attack, damage);
        if (defenseEffect) {
            damage = defenseEffect.damage;
            if (defenseEffect.message) {
                setTimeout(() => {
                    this.setMessage(defenseEffect.message);
                }, 500);
            }
        }
        
        // Show effectiveness message if any
        if (damageResult.message) {
            setTimeout(() => {
                this.setMessage(damageResult.message);
            }, 300);
        }
        
        // Apply healing if attack has it
        if (attack.healing && attackerType) {
            const healAmount = attack.healing;
            const maxHealth = attackerType === 'player' ? this.playerStats.maxHealth : this.enemyStats.maxHealth;
            this.currentHealth[attackerType] = Math.min(this.currentHealth[attackerType] + healAmount, maxHealth);
            
            setTimeout(() => {
                this.setMessage(`${attacker.name} restored ${healAmount} health!`);
                this.updateHealthBars();
            }, 800);
        }
        
        // Deal damage to defender
        setTimeout(() => {
            this.dealDamage(defenderType, damage);
            
            // Check for and apply status effects
            const effectResult = CombatUtils.applyEffects(attack, defender);
            if (effectResult) {
                // Add the effect to the appropriate target
                if (defenderType === 'player') {
                    this.playerEffects.push({ 
                        ...effectResult,
                        turnsLeft: effectResult.duration
                    });
                } else {
                    this.enemyEffects.push({ 
                        ...effectResult,
                        turnsLeft: effectResult.duration
                    });
                }
                
                // Show effect message
                setTimeout(() => {
                    this.setMessage(effectResult.message);
                    this.updateStatusEffectsDisplay();
                }, 500);
            }
        }, 600);
    }
    
    // Execute a basic fallback attack when no moves are available
    executeBasicAttack(attack, attackerType, defenderType) {
        // Focus camera on attacker
        this.camera.focusOn(attackerType);
        
        // Animate the attack after a short delay
        setTimeout(() => {
            const targetPosition = this.modelLoader.getModel(defenderType).position;
            
            this.modelLoader.animateAttack(attackerType, targetPosition, () => {
                // Deal small damage
                this.dealDamage(defenderType, attack.damage);
                
                // Switch turns after a delay
                setTimeout(() => {
                    if (attackerType === 'enemy') {
                        this.switchTurnToPlayer();
                    } else {
                        this.switchTurnToEnemy();
                    }
                }, 1000);
            });
        }, 500);
    }
    
    // Check status effects at the start of turn
    checkStatusEffectsTurn(characterType) {
        const effects = characterType === 'player' ? this.playerEffects : this.enemyEffects;
        const character = characterType === 'player' ? this.playerStats : this.enemyStats;
        
        // Check for effects that prevent acting
        for (const effect of effects) {
            if (!StatusEffects[effect.type] || !StatusEffects[effect.type].onTurn) continue;
            
            const result = StatusEffects[effect.type].onTurn(character);
            if (result && !result.canAct) {
                return result;
            }
        }
        
        // Default: can act normally
        return { canAct: true, message: null };
    }
    
    // Check status effects that modify attacks
    checkStatusEffectsAttack(attackerType, defenderType, attack, damage) {
        const effects = attackerType === 'player' ? this.playerEffects : this.enemyEffects;
        const attacker = attackerType === 'player' ? this.playerStats : this.enemyStats;
        const defender = defenderType === 'player' ? this.playerStats : this.enemyStats;
        
        // Check for effects that modify attacks
        for (const effect of effects) {
            if (!StatusEffects[effect.type] || !StatusEffects[effect.type].onAttack) continue;
            
            const result = StatusEffects[effect.type].onAttack(attacker, defender, attack, damage);
            if (result) {
                return result;
            }
        }
        
        // Default: normal attack
        return null;
    }
    
    // Check status effects that modify defense
    checkStatusEffectsDefend(attackerType, defenderType, attack, damage) {
        const effects = defenderType === 'player' ? this.playerEffects : this.enemyEffects;
        const attacker = attackerType === 'player' ? this.playerStats : this.enemyStats;
        const defender = defenderType === 'player' ? this.playerStats : this.enemyStats;
        
        // Check for effects that modify defense
        for (const effect of effects) {
            if (!StatusEffects[effect.type] || !StatusEffects[effect.type].onDefend) continue;
            
            const result = StatusEffects[effect.type].onDefend(attacker, defender, attack, damage);
            if (result) {
                return result;
            }
        }
        
        // Default: normal defense
        return null;
    }
    
    // Update status effects (decrease duration, remove expired)
    updateStatusEffects() {
        // Update player effects
        this.playerEffects = this.playerEffects.filter(effect => {
            effect.turnsLeft--;
            return effect.turnsLeft > 0;
        });
        
        // Update enemy effects
        this.enemyEffects = this.enemyEffects.filter(effect => {
            effect.turnsLeft--;
            return effect.turnsLeft > 0;
        });
    }
    
    // Update the visual display of status effects
    updateStatusEffectsDisplay() {
        // Update player status display
        const playerStatusContainer = document.getElementById('playerStatus');
        playerStatusContainer.innerHTML = '';
        
        this.playerEffects.forEach(effect => {
            const effectEl = document.createElement('div');
            effectEl.className = `status-effect ${effect.type}`;
            effectEl.innerHTML = `<div class="status-effect-icon"></div>${effect.name} (${effect.turnsLeft})`;
            playerStatusContainer.appendChild(effectEl);
        });
        
        // Update enemy status display
        const enemyStatusContainer = document.getElementById('enemyStatus');
        enemyStatusContainer.innerHTML = '';
        
        this.enemyEffects.forEach(effect => {
            const effectEl = document.createElement('div');
            effectEl.className = `status-effect ${effect.type}`;
            effectEl.innerHTML = `<div class="status-effect-icon"></div>${effect.name} (${effect.turnsLeft})`;
            enemyStatusContainer.appendChild(effectEl);
        });
    }
    
    // Decrease cooldowns for a character's attacks
    decreaseCooldowns(characterType) {
        const cooldowns = this.attackCooldowns[characterType];
        
        for (const attackIndex in cooldowns) {
            if (cooldowns[attackIndex] > 0) {
                cooldowns[attackIndex]--;
            }
        }
    }
    
    // Update attack button state (disabled for cooldowns)
    updateAttackButtonState() {
        if (!this.isPlayerTurn) return;
        
        const buttons = this.battleOptions.querySelectorAll('.battle-option');
        buttons.forEach((button, index) => {
            const attackIndex = parseInt(button.getAttribute('data-attack'));
            const attack = this.playerStats.attacks[attackIndex];
            
            // Update cooldown display
            if (attack.cooldown) {
                const remainingCooldown = this.attackCooldowns.player[attackIndex] || 0;
                const cooldownEl = button.querySelector('.cooldown');
                
                if (remainingCooldown > 0) {
                    button.disabled = true;
                    if (cooldownEl) {
                        cooldownEl.textContent = `Cooldown: ${remainingCooldown}`;
                    } else {
                        const newCooldownEl = document.createElement('div');
                        newCooldownEl.className = 'cooldown';
                        newCooldownEl.textContent = `Cooldown: ${remainingCooldown}`;
                        button.appendChild(newCooldownEl);
                    }
                } else {
                    button.disabled = false;
                    if (cooldownEl) {
                        cooldownEl.remove();
                    }
                }
            }
        });
    }
    
    // Helper to enable/disable all attack buttons
    disableAttackButtons(disabled) {
        const buttons = this.battleOptions.querySelectorAll('.battle-option');
        buttons.forEach(button => {
            button.disabled = disabled;
        });
    }
    
    // Deal damage to target
    dealDamage(target, damage) {
        console.log(`Dealing ${damage} damage to ${target}`);
        console.log(`Health before damage - ${target}: ${this.currentHealth[target]}`);
        
        // Apply damage
        this.currentHealth[target] -= damage;
        
        // Ensure health doesn't go below 0
        if (this.currentHealth[target] < 0) {
            this.currentHealth[target] = 0;
        }
        
        console.log(`Health after damage - ${target}: ${this.currentHealth[target]}`);
        
        // Update health bars
        this.updateHealthBars();
        
        // Camera shake effect
        this.camera.shake();
        
        // Animate damage reaction
        this.modelLoader.animateDamage(target);
    }
    
    // Update health bars in the UI
    updateHealthBars() {
        const playerPercent = (this.currentHealth.player / this.playerStats.maxHealth) * 100;
        const enemyPercent = (this.currentHealth.enemy / this.enemyStats.maxHealth) * 100;
        
        this.playerHealthBar.style.width = `${playerPercent}%`;
        this.enemyHealthBar.style.width = `${enemyPercent}%`;
        
        // Change color based on health percentage
        if (playerPercent < 20) {
            this.playerHealthBar.style.backgroundColor = '#FF5252';
        } else if (playerPercent < 50) {
            this.playerHealthBar.style.backgroundColor = '#FFC107';
        } else {
            this.playerHealthBar.style.backgroundColor = '#4CAF50';
        }
        
        if (enemyPercent < 20) {
            this.enemyHealthBar.style.backgroundColor = '#FF5252';
        } else if (enemyPercent < 50) {
            this.enemyHealthBar.style.backgroundColor = '#FFC107';
        } else {
            this.enemyHealthBar.style.backgroundColor = '#4CAF50';
        }
    }
    
    // End the battle
    endBattle(playerWon) {
        console.log(`Battle ended. Player won: ${playerWon}`);
        // Set battle as inactive
        this.battleActive = false;
        this.animationInProgress = false;
        
        // Show result message
        if (playerWon) {
            this.setMessage(`${this.enemyStats.name} fainted! You won!`);
        } else {
            this.setMessage(`${this.playerStats.name} fainted! You lost!`);
        }
        
        // Focus camera on overview
        this.camera.focusOn('overview');
        
        // Hide battle options
        Array.from(this.battleOptions.children).forEach(button => {
            button.style.display = 'none';
        });
        
        // Add restart button
        const restartButton = document.createElement('button');
        restartButton.className = 'battle-option';
        restartButton.style.gridColumn = '1 / span 2';
        restartButton.textContent = 'Play Again';
        restartButton.onclick = () => {
            location.reload();
        };
        this.battleOptions.appendChild(restartButton);
    }
    
    // Set battle message
    setMessage(text) {
        console.log(`Battle message: "${text}"`);
        this.battleMessage.textContent = text;
    }
    
    // Update function called on animation frame
    update() {
        // You could add idle animations or effects here
    }
}
