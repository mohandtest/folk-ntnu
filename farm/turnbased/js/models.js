/**
 * Models.js - Contains the fallback simple models for animals and character stats
 */

// Factory for creating simple animal models
const SimpleModelFactory = {
    // Available simple models
    models: {
        'chicken': createSimpleChicken,
        'cow': createSimpleCow,
        'pig': createSimplePig
    },
    
    // Get a model - if requested model doesn't exist, return chicken as default
    getModel: function(type) {
        if (this.models[type]) {
            return this.models[type]();
        }
        console.warn(`No simple model for "${type}" found, using chicken as fallback`);
        return this.models['chicken']();
    }
};

// Add the model creation functions
function createSimpleChicken() {
    const group = new THREE.Group();
    
    // Body - slightly elongated sphere
    const bodyGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    bodyGeometry.scale(1, 0.8, 1.2);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.5;
    group.add(body);
    
    // Head - smaller sphere
    const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(0, 1.1, 0.4);
    group.add(head);
    
    // Beak - cone
    const beakGeometry = new THREE.ConeGeometry(0.1, 0.3, 8);
    const beakMaterial = new THREE.MeshStandardMaterial({ color: 0xFFAA00 });
    const beak = new THREE.Mesh(beakGeometry, beakMaterial);
    beak.rotation.x = Math.PI / 2;
    beak.position.set(0, 1.1, 0.7);
    group.add(beak);
    
    // Legs - cylinders
    const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.5);
    const legMaterial = new THREE.MeshStandardMaterial({ color: 0xFFAA00 });
    
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(0.2, 0.25, 0);
    group.add(leftLeg);
    
    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(-0.2, 0.25, 0);
    group.add(rightLeg);
    
    group.traverse(function(node) {
        if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
        }
    });
    
    return group;
}

function createSimpleCow() {
    const group = new THREE.Group();
    
    // Body - elongated box
    const bodyGeometry = new THREE.BoxGeometry(1.2, 0.7, 0.6);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.7;
    group.add(body);
    
    // Head
    const headGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.5);
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(0.7, 1.1, 0);
    group.add(head);
    
    // Legs
    const legGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.7);
    const legMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    
    const positions = [
        [-0.4, 0.35, 0.2],  // front left
        [-0.4, 0.35, -0.2], // front right
        [0.4, 0.35, 0.2],   // back left
        [0.4, 0.35, -0.2],  // back right
    ];
    
    positions.forEach(position => {
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        leg.position.set(...position);
        group.add(leg);
    });
    
    group.traverse(function(node) {
        if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
        }
    });
    
    return group;
}

function createSimplePig() {
    const group = new THREE.Group();
    
    // Body - roundish body
    const bodyGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    bodyGeometry.scale(1.2, 0.8, 0.9);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xFFCCCC }); // Pink color
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.6;
    group.add(body);
    
    // Head
    const headGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0xFFCCCC });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(0.6, 0.8, 0);
    group.add(head);
    
    // Snout
    const snoutGeometry = new THREE.CylinderGeometry(0.15, 0.2, 0.2, 16);
    const snoutMaterial = new THREE.MeshStandardMaterial({ color: 0xFFCCCC });
    const snout = new THREE.Mesh(snoutGeometry, snoutMaterial);
    snout.rotation.z = Math.PI / 2;
    snout.position.set(0.85, 0.8, 0);
    group.add(snout);
    
    // Nostrils
    const nostrilGeometry = new THREE.CircleGeometry(0.04, 8);
    const nostrilMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    
    const leftNostril = new THREE.Mesh(nostrilGeometry, nostrilMaterial);
    leftNostril.position.set(0.95, 0.85, 0.08);
    leftNostril.rotation.y = Math.PI / 2;
    group.add(leftNostril);
    
    const rightNostril = new THREE.Mesh(nostrilGeometry, nostrilMaterial);
    rightNostril.position.set(0.95, 0.85, -0.08);
    rightNostril.rotation.y = Math.PI / 2;
    group.add(rightNostril);
    
    // Ears
    const earGeometry = new THREE.CircleGeometry(0.15, 8);
    const earMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xFFCCCC,
        side: THREE.DoubleSide 
    });
    
    const leftEar = new THREE.Mesh(earGeometry, earMaterial);
    leftEar.position.set(0.5, 1.05, 0.2);
    leftEar.rotation.y = Math.PI / 4;
    leftEar.rotation.x = -Math.PI / 6;
    group.add(leftEar);
    
    const rightEar = new THREE.Mesh(earGeometry, earMaterial);
    rightEar.position.set(0.5, 1.05, -0.2);
    rightEar.rotation.y = -Math.PI / 4;
    rightEar.rotation.x = -Math.PI / 6;
    group.add(rightEar);
    
    // Legs
    const legGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.5);
    const legMaterial = new THREE.MeshStandardMaterial({ color: 0xFFCCCC });
    
    const positions = [
        [-0.25, 0.25, 0.2],  // back left
        [-0.25, 0.25, -0.2], // back right
        [0.35, 0.25, 0.2],   // front left
        [0.35, 0.25, -0.2],  // front right
    ];
    
    positions.forEach(position => {
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        leg.position.set(...position);
        group.add(leg);
    });
    
    // Tail (curly)
    const tailCurve = new THREE.CubicBezierCurve3(
        new THREE.Vector3(-0.6, 0.7, 0),
        new THREE.Vector3(-0.8, 0.7, 0.1),
        new THREE.Vector3(-0.8, 0.8, -0.1),
        new THREE.Vector3(-0.7, 0.9, 0)
    );
    
    const tailGeometry = new THREE.TubeGeometry(tailCurve, 20, 0.03, 8, false);
    const tailMaterial = new THREE.MeshStandardMaterial({ color: 0xFFCCCC });
    const tail = new THREE.Mesh(tailGeometry, tailMaterial);
    group.add(tail);
    
    group.traverse(function(node) {
        if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
        }
    });
    
    return group;
}

// Enhanced Character stats with types, resistances, and special abilities
const AnimalStats = {
    chicken: {
        name: "Chicken",
        type: "Flying",
        maxHealth: 100,
        speed: 8, // Chickens are fast but fragile
        attacks: [
            { name: "Peck", damage: 15, type: "Normal", accuracy: 95, description: "A quick peck with the beak" },
            { name: "Wing Slap", damage: 10, type: "Flying", accuracy: 100, description: "Hits with both wings" },
            { name: "Egg Bomb", damage: 25, type: "Normal", accuracy: 80, cooldown: 2, currentCooldown: 0, description: "Throws an explosive egg (cooldown: 2 turns)" },
            { name: "Chicken Dance", damage: 5, type: "Special", accuracy: 100, effect: "confuse", description: "Confuses the opponent with funky moves" }
        ],
        resistances: {
            "Ground": 0.5,  // Takes less damage from ground attacks
            "Flying": 1.0,  // Normal damage from flying
            "Normal": 1.0,  // Normal damage from normal attacks
            "Special": 1.0  // Normal damage from special attacks
        }
    },
    cow: {
        name: "Cow",
        type: "Ground",
        maxHealth: 150, // Cows are tanky but slower
        speed: 4,
        attacks: [
            { name: "Headbutt", damage: 20, type: "Normal", accuracy: 90, description: "A powerful hit with the head" },
            { name: "Hoof Stomp", damage: 15, type: "Ground", accuracy: 100, effect: "stun", effectChance: 20, description: "Stomps the ground with hooves, chance to stun" },
            { name: "Milk Spray", damage: 10, type: "Special", accuracy: 100, healing: 10, description: "Sprays milk at the opponent, heals self slightly" },
            { name: "Moo Blast", damage: 25, type: "Special", accuracy: 80, cooldown: 3, currentCooldown: 0, description: "A powerful sonic moo (cooldown: 3 turns)" }
        ],
        resistances: {
            "Ground": 1.0,  // Normal damage from ground attacks
            "Flying": 1.5,  // Takes more damage from flying
            "Normal": 0.8,  // Takes less damage from normal attacks
            "Special": 1.0  // Normal damage from special attacks
        }
    },
    pig: {
        name: "Pig",
        type: "Ground",
        maxHealth: 125, // Pigs are balanced
        speed: 6,
        attacks: [
            { name: "Mud Splash", damage: 15, type: "Ground", accuracy: 90, effect: "accuracy_down", description: "Splashes mud at the opponent, may lower accuracy" },
            { name: "Snout Slam", damage: 20, type: "Normal", accuracy: 95, description: "Hits with a powerful snout" },
            { name: "Roll Attack", damage: 25, type: "Ground", accuracy: 85, description: "Rolls into the opponent" },
            { name: "Pig Squeal", damage: 10, type: "Special", accuracy: 100, effect: "defense_down", description: "A high-pitched squeal that lowers defense" }
        ],
        resistances: {
            "Ground": 0.8,  // Takes less damage from ground attacks
            "Flying": 1.2,  // Takes more damage from flying
            "Normal": 1.0,  // Normal damage from normal attacks
            "Special": 1.1  // Takes slightly more damage from special attacks
        }
    }
};

// Status effect definitions
const StatusEffects = {
    "confuse": {
        name: "Confused",
        duration: 2,
        onAttack: (attacker, defender, attack, damage) => {
            // 30% chance to hit itself
            if (Math.random() < 0.3) {
                return {
                    damage: Math.floor(damage * 0.5),
                    target: attacker,
                    message: `${attacker.name} is confused and hurt itself!`
                };
            }
            return { damage, target: defender, message: null };
        }
    },
    "stun": {
        name: "Stunned",
        duration: 1,
        onTurn: (character) => {
            return {
                canAct: false,
                message: `${character.name} is stunned and can't move!`
            };
        }
    },
    "accuracy_down": {
        name: "Blinded",
        duration: 2,
        onAttack: (attacker, defender, attack, damage) => {
            // 25% chance to miss
            if (Math.random() < 0.25) {
                return {
                    damage: 0,
                    target: defender,
                    message: `${attacker.name} can't see well and missed!`
                };
            }
            return { damage, target: defender, message: null };
        }
    },
    "defense_down": {
        name: "Weakened",
        duration: 3,
        onDefend: (attacker, defender, attack, damage) => {
            // Take 20% more damage
            return {
                damage: Math.floor(damage * 1.2),
                message: `${defender.name} is weakened and took extra damage!`
            };
        }
    }
};

// Helper functions for combat logic
const CombatUtils = {
    // Calculate damage with type effectiveness and randomness
    calculateDamage: function(attack, attacker, defender) {
        // Base damage
        let damage = attack.damage;
        
        // Type effectiveness (if defender has resistances to this attack type)
        if (defender.resistances && defender.resistances[attack.type]) {
            const effectiveness = defender.resistances[attack.type];
            damage = Math.floor(damage * effectiveness);
            
            // Create message based on effectiveness
            if (effectiveness > 1) {
                return { damage, message: "It's super effective!" };
            } else if (effectiveness < 1) {
                return { damage, message: "It's not very effective..." };
            }
        }
        
        // Add small random variation (+/- 15%)
        const variation = 0.85 + Math.random() * 0.3; // between 0.85 and 1.15
        damage = Math.floor(damage * variation);
        
        return { damage, message: null };
    },
    
    // Check if attack hits based on accuracy
    checkHit: function(attack) {
        // If no accuracy is specified, always hit
        if (!attack.accuracy) return true;
        
        // Roll for hit chance
        return Math.random() * 100 <= attack.accuracy;
    },
    
    // Check and apply attack effects
    applyEffects: function(attack, target) {
        if (!attack.effect) return null;
        
        // Check if effect should be applied (based on chance)
        if (attack.effectChance && Math.random() * 100 > attack.effectChance) {
            return null;
        }
        
        // Get effect details
        const effect = StatusEffects[attack.effect];
        if (!effect) return null;
        
        // Return effect to be applied
        return {
            type: attack.effect,
            name: effect.name,
            duration: effect.duration,
            message: `${target.name} became ${effect.name.toLowerCase()}!`
        };
    }
};
