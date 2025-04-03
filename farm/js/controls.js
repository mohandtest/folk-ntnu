/**
 * Controls.js - Handles user camera controls and model rotation
 */

class CameraControls {
    constructor(camera, models = {}) {
        this.camera = camera;
        this.models = models;
        this.isDragging = false;
        this.previousMousePosition = { x: 0, y: 0 };
        this.rotationSpeed = 0.01;
        
        // Initialize event listeners
        this.initEventListeners();
    }
    
    initEventListeners() {
        document.addEventListener('mousedown', this.onMouseDown.bind(this));
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
        document.addEventListener('mouseup', this.onMouseUp.bind(this));
        document.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
        document.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.onTouchEnd.bind(this));
    }
    
    onMouseDown(e) {
        this.isDragging = true;
        this.previousMousePosition = {
            x: e.clientX,
            y: e.clientY
        };
    }
    
    onMouseMove(e) {
        if (!this.isDragging) return;
        
        const deltaMove = {
            x: e.clientX - this.previousMousePosition.x,
            y: e.clientY - this.previousMousePosition.y
        };
        
        // Rotate camera based on mouse movement
        const deltaRotationQuaternion = new THREE.Quaternion()
            .setFromEuler(new THREE.Euler(
                this.toRadians(deltaMove.y * this.rotationSpeed),
                this.toRadians(deltaMove.x * this.rotationSpeed),
                0,
                'XYZ'
            ));
        
        this.camera.quaternion.multiplyQuaternions(deltaRotationQuaternion, this.camera.quaternion);
        
        this.previousMousePosition = {
            x: e.clientX,
            y: e.clientY
        };
    }
    
    onMouseUp() {
        this.isDragging = false;
    }
    
    // Touch controls for mobile
    onTouchStart(e) {
        e.preventDefault();
        if (e.touches.length === 1) {
            this.isDragging = true;
            this.previousMousePosition = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
        }
    }
    
    onTouchMove(e) {
        e.preventDefault();
        if (!this.isDragging || e.touches.length !== 1) return;
        
        const deltaMove = {
            x: e.touches[0].clientX - this.previousMousePosition.x,
            y: e.touches[0].clientY - this.previousMousePosition.y
        };
        
        // Rotate camera based on touch movement
        const deltaRotationQuaternion = new THREE.Quaternion()
            .setFromEuler(new THREE.Euler(
                this.toRadians(deltaMove.y * this.rotationSpeed),
                this.toRadians(deltaMove.x * this.rotationSpeed),
                0,
                'XYZ'
            ));
        
        this.camera.quaternion.multiplyQuaternions(deltaRotationQuaternion, this.camera.quaternion);
        
        this.previousMousePosition = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
        };
    }
    
    onTouchEnd() {
        this.isDragging = false;
    }
    
    // Convert degrees to radians
    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
    
    // Update model rotations - simplified to always rotate
    update(models) {
        // Update the models reference if provided
        if (models) {
            this.models = models;
        }
        
        // Always rotate models without any conditional checks
        for (const [id, model] of Object.entries(this.models)) {
            // Different rotation speeds for different animals
            if (id === 'chicken') {
                model.rotation.y += 0.01;
            } else if (id === 'cow') {
                model.rotation.y += 0.005; // Slower rotation
            } else if (id === 'pig') {
                model.rotation.y += 0.008; // Medium rotation speed
            } else {
                model.rotation.y += 0.01; // Default
            }
        }
    }
}
