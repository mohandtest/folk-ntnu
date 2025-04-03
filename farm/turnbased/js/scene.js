/**
 * Scene.js - Handles battle arena setup, lighting, and environment
 */

class BattleScene {
    constructor() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Light blue sky background
        
        // Camera setup
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 1.5, 5);
        
        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        document.body.appendChild(this.renderer.domElement);
        
        // Window resize handler
        window.addEventListener('resize', this.onWindowResize.bind(this));
        
        // Initialize scene components
        this.addLights();
        this.addBattleArena();
    }
    
    addLights() {
        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        
        // Add directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 10, 7.5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        this.scene.add(directionalLight);
    }
    
    addBattleArena() {
        // Create the battle arena floor
        const floorGeometry = new THREE.CircleGeometry(5, 32);
        const floorMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x8B4513, // Brown color for dirt arena
            roughness: 0.8,
            metalness: 0.1
        });
        
        this.floor = new THREE.Mesh(floorGeometry, floorMaterial);
        this.floor.rotation.x = -Math.PI / 2;
        this.floor.receiveShadow = true;
        this.scene.add(this.floor);
        
        // Create battle positions - markers where the animals will stand
        this.playerPosition = new THREE.Vector3(-2, 0, 0);
        this.enemyPosition = new THREE.Vector3(2, 0, 0);
        
        // Optional: Add position markers
        const markerGeometry = new THREE.CircleGeometry(0.5, 16);
        const playerMarkerMaterial = new THREE.MeshStandardMaterial({ color: 0x4CAF50, transparent: true, opacity: 0.5 });
        const enemyMarkerMaterial = new THREE.MeshStandardMaterial({ color: 0xFF5252, transparent: true, opacity: 0.5 });
        
        const playerMarker = new THREE.Mesh(markerGeometry, playerMarkerMaterial);
        playerMarker.position.copy(this.playerPosition);
        playerMarker.position.y = 0.01; // Slightly above ground
        playerMarker.rotation.x = -Math.PI / 2;
        this.scene.add(playerMarker);
        
        const enemyMarker = new THREE.Mesh(markerGeometry, enemyMarkerMaterial);
        enemyMarker.position.copy(this.enemyPosition);
        enemyMarker.position.y = 0.01; // Slightly above ground
        enemyMarker.rotation.x = -Math.PI / 2;
        this.scene.add(enemyMarker);
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}
