/**
 * Controls.js - Handles camera movement for the battle scene
 */

class BattleCamera {
    constructor(camera) {
        this.camera = camera;
        this.targetPosition = new THREE.Vector3(0, 1.5, 5);
        this.currentFocus = 'overview'; // 'overview', 'player', 'enemy'
    }
    
    // Update camera position
    update() {
        // Simple lerp to target position
        this.camera.position.lerp(this.targetPosition, 0.05);
        
        // Always look at the center of the arena
        this.camera.lookAt(0, 0.5, 0);
    }
    
    // Focus camera on a specific target
    focusOn(target) {
        switch(target) {
            case 'player':
                this.targetPosition.set(-3, 2, 3);
                this.currentFocus = 'player';
                break;
                
            case 'enemy':
                this.targetPosition.set(3, 2, 3);
                this.currentFocus = 'enemy';
                break;
                
            case 'overview':
            default:
                this.targetPosition.set(0, 3, 6);
                this.currentFocus = 'overview';
                break;
        }
    }
    
    // Move camera to focus on active character
    focusOnActive(isPlayerTurn) {
        this.focusOn(isPlayerTurn ? 'player' : 'enemy');
    }
    
    // Quick shake effect for impacts
    shake(intensity = 0.2, duration = 500) {
        const originalPosition = this.targetPosition.clone();
        const startTime = Date.now();
        
        const shakeInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            if (elapsed >= duration) {
                clearInterval(shakeInterval);
                this.targetPosition.copy(originalPosition);
                return;
            }
            
            // Reduce intensity as time passes
            const currentIntensity = intensity * (1 - elapsed / duration);
            
            // Apply random offset
            this.targetPosition.set(
                originalPosition.x + (Math.random() - 0.5) * currentIntensity,
                originalPosition.y + (Math.random() - 0.5) * currentIntensity,
                originalPosition.z + (Math.random() - 0.5) * currentIntensity
            );
        }, 50);
    }
}
