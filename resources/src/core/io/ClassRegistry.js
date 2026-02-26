import { AudioSource } from "../entities/AudioSource.js";
import { Behaviour } from "../entities/Behaviour.js";
import { BoxCollider } from "../entities/BoxCollider.js";
import { Camera } from "../entities/Camera.js";
import { Entity } from "../entities/Entity.js";
import { PointLight } from "../entities/PointLight.js";
import { ReflectionProbe } from "../entities/ReflectionProbe.js";
import { Renderer } from "../entities/Renderer.js";
import { Rigidbody } from "../entities/Rigidbody.js";
import { SphereCollider } from "../entities/SphereCollider.js";
import { AudioSourceLoader } from "./AudioSourceLoader.js";
import { BehaviourLoader } from "./BehaviourLoader.js";
import { BoxColliderLoader } from "./BoxColliderLoader.js";
import { CameraLoader } from "./CameraLoader.js";
import { EntityLoader } from "./EntityLoader.js";
import { PointLightLoader } from "./PointLightLoader.js";
import { ReflectionProbeLoader } from "./ReflectionProbeLoader.js";
import { RendererLoader } from "./RendererLoader.js";
import { RigidbodyLoader } from "./RigidbodyLoader.js";
import { SphereColliderLoader } from "./SphereColliderLoader.js";

export const ClassRegistry = {
    "AudioSource": {
        type: AudioSource,
        loader: AudioSourceLoader
    },
    "Behaviour": {
        type: Behaviour,
        loader: BehaviourLoader
    },
    "BoxCollider": {
        type: BoxCollider,
        loader: BoxColliderLoader
    },
    "Camera": {
        type: Camera,
        loader: CameraLoader
    },
    "Entity": {
        type: Entity,
        loader: EntityLoader
    },
    "PointLight": {
        type: PointLight,
        loader: PointLightLoader
    },
    "ReflectionProbe": {
        type: ReflectionProbe,
        loader: ReflectionProbeLoader
    },
    "Renderer": {
        type: Renderer,
        loader: RendererLoader
    },
    "Rigidbody": {
        type: Rigidbody,
        loader: RigidbodyLoader
    },
    "SphereCollider": {
        type: SphereCollider,
        loader: SphereColliderLoader
    },
}