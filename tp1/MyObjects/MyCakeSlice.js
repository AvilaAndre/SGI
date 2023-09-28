import * as THREE from "three";
import { MyApp } from "../MyApp.js";

/**
 * This class contains a 3D cakeSlice representation
 */
class MyCakeSlice extends THREE.Object3D {
    /**
     *
     * @param {MyApp} app the application object
     * @param {number} up_radius the radius of the upside of the cakeSlice
     * @param {number} down_radius the radius of the downside of the cakeSlice
     * @param {string} flavor
     */
    constructor(app, flavor) {
        super();
        this.app = app;
        this.type = "Group";
        this.up_radius = 0.25;
        this.down_radius = 0.25;
        this.flavor = flavor;

        if(this.flavor === "strawberry"){
            this.cakeMaterial = new THREE.MeshPhongMaterial({
                color: "#FEC5E5",
                specular: "#6E260E",
                emissive: "#000000",
                shininess: 10,
            });
        } else if (this.flavor === "vanilla"){
            this.cakeMaterial = new THREE.MeshPhongMaterial({
                color: "#FFF6DF",
                specular: "#6E260E",
                emissive: "#000000",
                shininess: 10,
            });
        } else if (this.flavor === "chocolate"){
            this.cakeMaterial = new THREE.MeshPhongMaterial({
                color: "#805A46",
                specular: "#6E260E",
                emissive: "#000000",
                shininess: 10,
            });
        }

        let cakeSlice = new THREE.CylinderGeometry(
            //Raio  do círculo superior
            this.up_radius,
            //Raio do círculo inferior
            this.down_radius,
            //Altura
            0.1,
            //Segmentos radiais
            40,
            //Segmentos de altura
            3,
            false,
            0,
            (14*Math.PI)/8
        );
        this.cakeMesh = new THREE.Mesh(cakeSlice, this.cakeSliceMaterial);



        this.cakeSliceMesh.position.y = 0.24;
        //this.flavor = "strawberry";



        this.cakeSliceGroup = new THREE.Group()

        this.cakeSliceGroup.add(this.cakeSliceMesh)


        this.add(this.cakeSliceGroup);
    }
}

MyCakeSlice.prototype.isGroup = true;

export { MyCakeSlice };
