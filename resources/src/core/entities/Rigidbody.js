import { Vec3 } from "../math/Vec3.js";
import { Collider } from "./Collider.js";
import { Entity } from "./Entity.js";

export class Rigidbody extends Entity {
    constructor() {
        super();
        this.velocity = new Vec3(0, 0, 0);
        this.acceleration = new Vec3(0, 0, 0);
        this.linearDamping = 0.5;
        this.bounciness = 0.1;
        this.mass = 1.0;
        this.useGravity = true;
    }

    applyForce(forceVec) {
        if (this.static) return;
        const f = Vec3.divScalar(forceVec, this.mass);
        this.acceleration = Vec3.add(this.acceleration, f);
    }

    update(delta) {
        const collider = this.getChildOfType(Collider);

        if (collider) {
            for (const collision of collider.collisions) {
                const other = collision.collider;
                const isStatic = other.parent instanceof Rigidbody || collider.static;
                const normal = Vec3.normalize(collision.normal);
                const depth = collision.depth;
                // const force = Vec3.mulScalar(normal, 0.1 + this.velocity.magnitude);
                const dot = Vec3.dot(this.velocity, normal);

                if (dot > 0) {
                    const reflection = Vec3.mulScalar(normal, 2 * dot);
                    this.velocity = Vec3.sub(this.velocity, reflection);
                }
            }
        }

        this.velocity = Vec3.add(this.velocity, Vec3.mulScalar(this.acceleration, delta));
        this.velocity = Vec3.mulScalar(this.velocity, Math.max(0, 1 - this.linearDamping * delta));
        this.position = Vec3.add(this.position, Vec3.mulScalar(this.velocity, delta));
        this.acceleration = new Vec3();

        if (Math.pow(this.velocity.magnitude, 2) < 0.0001) {
            this.velocity = new Vec3();
        } else {
            this.updateTransformations();
        }
    }
}

/*
function resolveOverlap(entityA, entityB, manifold) {
    const { normal, depth } = manifold;
    
    // If one object is static (like a floor), move the other 100%
    if (entityB.rigidbody.isStatic) {
        const correction = normal.clone().multiplyScalar(depth);
        entityA.position.sub(correction); // Push A out of B
    } else {
        // If both move, move them each by 50%
        const correction = normal.clone().multiplyScalar(depth * 0.5);
        entityA.position.sub(correction);
        entityB.position.add(correction);
    }
}


function resolveVelocity(rbA, rbB, manifold) {
    const normal = manifold.normal;
    
    // 1. Calculate relative velocity
    const relativeVelocity = Vec3.sub(rbA.velocity, rbB.velocity);
    
    // 2. Calculate velocity along the normal (Scalar)
    const velAlongNormal = Vec3.dot(relativeVelocity, normal);

    // Do not resolve if velocities are separating
    if (velAlongNormal > 0) return;

    // 3. Calculate Restitution (Bounciness: 0 is a thud, 1 is a perfect bounce)
    const e = 0.5; 

    // 4. Calculate Impulse Scalar (how hard the hit is)
    let j = -(1 + e) * velAlongNormal;
    j /= (1 / rbA.mass) + (1 / (rbB.isStatic ? Infinity : rbB.mass));

    // 5. Apply Impulse
    const impulse = normal.clone().multiplyScalar(j);
    rbA.velocity.add(impulse.clone().divideScalar(rbA.mass));
}
*/