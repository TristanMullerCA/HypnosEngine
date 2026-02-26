import { DATA_POOL } from "../DataPool.js";
import { Mat4 } from "../math/Mat4.js";
import { Mathf } from "../math/Mathf.js";
import { Vec3 } from "../math/Vec3.js";
import { Resource } from "../Resource.js";

export class Entity extends Resource {
    constructor(name = "") {
        super();
        this.name = name;
        this.static = false;
        this.position = new Vec3();
        this.rotation = new Vec3();
        this.scale = new Vec3(1, 1, 1);
        this.worldPosition = new Vec3();
        /** @type {Entity[]} */
        this.children = [];
        /** @type {Entity} */
        this.parent = null;
        this.modelMatrix = null;
    }

    /**
     * @param {Entity} child 
     */
    addChild(child) {
        if (this.children.includes(child)) return;
        child.parent = this;
        this.children.push(child);
        this.children.sort((a, b) => {
            const typeA = a.constructor.name.toUpperCase();
            const typeB = b.constructor.name.toUpperCase();
            if (typeA < typeB) return -1;
            if (typeA > typeB) return 1;
            return 0;
        });
    }

    /**
     * @param {Entity} child 
     */
    removeChild(child) {
        if (this.children.includes(child)) {
            this.children.splice(this.children.indexOf(child), 1);
            child.parent = null;
        }
    }

    remove() {
        this.parent.removeChild(this);
        DATA_POOL.remove(this);
        for (const element of this.children) {
            element.remove();
        }
    }

    /**
     * @returns {Entity}
     */
    getRoot() {
        if (this.parent) return this.parent.getRoot();
        return this;
    }

    /**
     * @param {Type} type Type of Entity (ex. "PointLight")
     * @returns {Entity} Entity (null is not found)
     */
    getChildOfType(type) {
        for (const child of this.children) {
            if (child instanceof type) return child;
        }
        return null;
    }

    /**
     * @param {Type} type Type of Entity (ex. "PointLight")
     * @returns {Entity[]}
     */
    getChildrenOfType(type) {
        const array = [];
        for (const child of this.children) {
            if (child instanceof type) array.push(child);
            array.push(...child.getChildrenOfType(type));
        }
        return array;
    }

    getAllChildren() {
        const array = [];
        for (const child of this.children) {
            array.push(child);
            array.push(...child.getAllChildren());
        }
        return array;
    }

    updateTransformations() {
        if (this.static == false || !this.modelMatrix) {
            this.translationMatrix = Mat4.translation(this.position.x, this.position.y, this.position.z);

            this.rotation.x = this.rotation.x % Mathf.Deg2Rad(360);
            this.rotation.y = this.rotation.y % Mathf.Deg2Rad(360);
            this.rotation.z = this.rotation.z % Mathf.Deg2Rad(360);
            this.rotationMatrix = Mat4.rotationXYZ(this.rotation.x, this.rotation.y, this.rotation.z);

            this.scaleMatrix = Mat4.scale(this.scale.x, this.scale.y, this.scale.z);

            this.normalMatrix = Mat4.multiply(this.scaleMatrix, this.rotationMatrix);

            let mMat = Mat4.multiply(this.translationMatrix, this.rotationMatrix);
            mMat = Mat4.multiply(mMat, this.scaleMatrix);

            if (this.parent) {
                if (this.parent.modelMatrix) {
                    mMat = Mat4.multiply(this.parent.modelMatrix, mMat);
                } else {
                    console.warn("Parent don't have model matrix : " + this.parent.constructor.name)
                }

                if (this.parent.normalMatrix) {
                    this.normalMatrix = Mat4.multiply(this.parent.normalMatrix, this.normalMatrix);
                }
            }

            this.modelMatrix = mMat;
            const wm = mMat.data;
            this.worldPosition = new Vec3(wm[12], wm[13], wm[14]);
        }

        for (const child of this.children) {
            child.updateTransformations();
        }
    }

    /**
     * @param {Vec3} vector 
     * @returns {Vec3}
     */
    toLocalSpace(vector) {
        if (this.rotationMatrix) {
            const translation = Mat4.translation(vector.x, vector.y, vector.z);
            const transformation = Mat4.multiply(this.rotationMatrix, translation);
            const tData = transformation.data;
            const localVec = new Vec3(tData[12], tData[13], tData[14]);
            if (this.parent) {
                return this.parent.toLocalSpace(localVec);
            }
            return localVec;
        } else {
            return vector;
        }
    }
}