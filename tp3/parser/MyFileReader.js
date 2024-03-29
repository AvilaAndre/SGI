import * as THREE from "three";
import { MySceneData } from "./MySceneData.js";
/**
 *  This class contains the XML parser
 *  Credits: Alexandre Valle (alexandre.valle@fe.up.pt)
 *  Version: 2023-10-13
 *
 *  DO NOT CHANGE THIS FILE. IT WILL BE MODIFIED OR REPLACED DURING EVALUATION
 *
 *  1. in a given class file MyWhateverNameClass.js in the constructor call:
 *
 *  this.reader = new MyFileReader(app, this, this.onSceneLoaded);
 *  this.reader.open("scenes/<path to xml file>.xml");
 *
 *  The last argumet in the constructor is a method that is called when the xml file is loaded and parsed (see step 2).
 *
 *  2. in the MyWhateverNameClass.js class, add a method with signature:
 *     onSceneLoaded(data) {
 *     }
 *
 *  This method is called once the xml file is loaded and parsed successfully. The data argument is the entire scene data object.
 *
 */

class MyFileReader {
    /**
       constructs the object
       @param {MyApp} app The application object
    */
    constructor(app, contents, onSceneLoadedCallback) {
        this.app = app;
        this.contents = contents;
        this.xmlhttp = null;
        this.xmlDoc = null;
        this.xmlloaded = false;
        this.data = new MySceneData();
        this.errorMessage = null;
        this.onSceneLoadedCallback = onSceneLoadedCallback;
    }

    open(xmlfile) {
        if (window.XMLHttpRequest) {
            this.xmlhttp = new XMLHttpRequest(); // For all modern browsers
        } else if (window.ActiveXObject) {
            this.xmlhttp = new ActiveXObject("Microsoft.XMLHTTP"); // For (older) IE
        }

        if (this.xmlhttp != null) {
            this.xmlhttp.onload = this.onStateChange;
            this.xmlhttp.reader = this;
            this.xmlfilename = xmlfile;
            this.xmlhttp.open("GET", xmlfile, false); //  (httpMethod,  URL,  asynchronous)
            this.xmlhttp.setRequestHeader("Content-Type", "text/xml");
            this.xmlhttp.send(null);
        } else {
            this.errorMessage = "The XMLHttpRequest is not supported";
            return;
        }
    }

    /**
     * Called when the state of the XMLHttpRequest changes. if 4 then the file is loaded and we can parse it.
     * @returns
     */
    onStateChange() {
        if (this.readyState == 4) {
            // 4 => loaded complete
            if (this.status == 200) {
                // HTTP status code  ( 200 => OK )

                let reader = this.reader;
                console.info(
                    "------------------ " +
                        reader.xmlfilename +
                        " file read. begin parsing ------------------"
                );

                let parser = new window.DOMParser();
                reader.xmlDoc = parser.parseFromString(
                    this.response,
                    "text/xml"
                );
                reader.readXML();

                if (reader.errorMessage != null) {
                    console.error(reader.errorMessage);
                    return;
                }
                try {
                    // final operations after load
                    reader.data.onLoadFinished(reader.app, reader.contents);

                    // signal contents that the file is read
                    reader.onSceneLoadedCallback.bind(reader.contents)(
                        reader.data
                    );
                } catch (error) {
                    console.error(error);
                    return;
                }
            } else {
                alert(
                    "statusText: " +
                        this.statusText +
                        "\nHTTP status code: " +
                        this.status
                );
            }
        }
    }

    /**
     * Read the xml file and loads the data
     */
    readXML() {
        try {
            let rootElement = this.xmlDoc.documentElement;

            if (rootElement == null) {
                throw new Error("No content in xml file");
            }

            var childNodes = rootElement.childNodes;
            if (childNodes.length == 2) {
                throw new Error(
                    "XML content error: " + rootElement.textContent
                );
            }

            this.checkForUnknownNodes(rootElement, this.data.primaryNodeIds);

            this.loadGlobals(rootElement);
            this.loadSkybox(rootElement);
            this.loadFog(rootElement);
            this.loadTextures(rootElement);
            this.loadMaterials(rootElement);
            this.loadCameras(rootElement);
            this.loadNodes(rootElement);
            this.loadRacetrack(rootElement);
            this.loadCars(rootElement);
            this.loadHUD(rootElement);
            this.loadObstacles(rootElement);
            this.loadAnimations(rootElement);
        } catch (error) {
            this.errorMessage = error;
        }
    }

    /**
     * checks if any unknown node is child a given element
     * @param {*} parentElem
     * @param {Array} list an array of strings with the valid node names
     */
    checkForUnknownNodes(parentElem, list) {
        // for each of the elem's children
        for (let i = 0; i < parentElem.children.length; i++) {
            let elem = parentElem.children[i];
            // is element's tag name not present in the list?
            if (list.includes(elem.tagName) === false) {
                // unkown element. Report!
                throw new Error(
                    "unknown xml element '" +
                        elem.tagName +
                        "' descendent of element '" +
                        parentElem.tagName +
                        "'"
                );
            }
        }
    }

    /**
     *  checks if any unknown attributes exits at a given element
     * @param {*} elem
     *  @param {Array} list an array of strings with the valid attribute names
     */
    checkForUnknownAttributes(elem, list) {
        // for each elem attributes
        for (let i = 0; i < elem.attributes.length; i++) {
            let attrib = elem.attributes[i];
            // is tag element not valid?
            if (list.includes(attrib.name) === false) {
                // report!
                throw new Error(
                    "unknown attribute '" +
                        attrib.name +
                        "' in element '" +
                        elem.tagName +
                        "'"
                );
            }
        }
    }

    toArrayOfNames(descriptor) {
        let list = [];
        // for each descriptor, get the value
        for (let i = 0; i < descriptor.length; i++) {
            list.push(descriptor[i].name);
        }
        return list;
    }
    /**
     * returns the index of a string in a list. -1 if not found
     * @param {Array} list an array of strings
     * @param {*} searchString the searched string
     * @returns the zero-based index of the first occurrence of the specified string, or -1 if the string is not found
     */
    indexOf(list, searchString) {
        if (Array.isArray(list)) {
            return list.indexOf(searchString);
        }
        return -1;
    }

    /**
     * extracts the color (rgba) from an element for a particular attribute
     * @param {*} element the xml element
     * @param {String} attributeName the attribute name
     * @param {Boolean} required if the attribte is required or not
     * @returns {THREE.Color} the color encoded in a THREE.Color object
     */
    getRGBA(element, attributeName, required) {
        if (required == undefined) required = true;

        if (attributeName == null) {
            throw new Error("color (rgba) attribute name is null.");
        }

        if (element === null) {
            throw new Error("element '" + attributeName + "' is null.");
        }

        let value = element.getAttribute(attributeName);
        if (value == null) {
            if (required) {
                throw new Error(
                    "element '" +
                        element.id +
                        ": color (rgba) value is null for attribute '" +
                        attributeName +
                        "'."
                );
            }
        }

        let temp = value.split(" ");
        if (temp.length != 4) {
            throw new Error(
                "element '" +
                    element.id +
                    ": invalid " +
                    temp.length +
                    " number of color components for color (rgba) in attribute '" +
                    attributeName +
                    "'."
            );
        }

        let rgba = new Array();
        for (let i = 0; i < 4; i++) {
            rgba.push(parseFloat(temp[i]));
        }
        let color = new THREE.Color(rgba[0], rgba[1], rgba[2]);
        // NOTE: 20231117 this is injected in the object because students are
        // using it for transparency.
        // the a has no effect in the threejs platform
        // TODO: to be removed in 2024-2025
        if (rgba[3] !== null) {
            color.a = rgba[3];
        }
        return color;
    }

    /**
     * returns a rectangle2D from an element for a particular attribute
     * @param {*} element the xml element
     * @param {String} attributeName the attribute name
     * @param {boolean} required if the attribte is required or not
     * @returns {Array} an array object with 4 elements: x1, y1, x2, y2
     */

    getRectangle2D(element, attributeName, required) {
        if (required == undefined) required = true;

        if (element == null) {
            throw new Error("element is null.");
        }
        if (attributeName == null) {
            throw new Error("rectangle2D attribute name is null.");
        }

        let value = element.getAttribute(attributeName);
        if (value == null) {
            if (required) {
                throw new Error(
                    "element '" +
                        element.id +
                        ": rectangle2D value is null for attribute " +
                        attributeName +
                        "."
                );
            }
            return null;
        }

        let temp = value.split(" ");
        if (temp.length != 4) {
            throw new Error(
                "element '" +
                    element.id +
                    ": invalid " +
                    temp.length +
                    " number of components for a rectangle2D, in attribute " +
                    attributeName +
                    "."
            );
        }

        let rect = {};
        rect.x1 = parseFloat(temp[0]);
        rect.y1 = parseFloat(temp[1]);
        rect.x2 = parseFloat(temp[2]);
        rect.y2 = parseFloat(temp[3]);
        return rect;
    }

    /**
     * returns a vector3 from an element for a particular attribute
     * @param {*} element the xml element
     * @param {*} attributeName the attribute name
     * @param {*} required if the attribte is required or not
     * @returns {THREE.vector3} the vector3 encoded in a THREE.Vector3 object
     */

    getVector3(element, attributeName, required) {
        if (required == undefined) required = true;

        if (element == null) {
            throw new Error("element is null.");
        }
        if (attributeName == null) {
            throw new Error("vector3 attribute name is null.");
        }

        let value = element.getAttribute(attributeName);
        if (value == null) {
            if (required) {
                throw new Error(
                    "element '" +
                        element.id +
                        "': vector3 value is null for attribute '" +
                        attributeName +
                        "' in element '" +
                        element.id +
                        "'."
                );
            }
            return null;
        }

        let temp = value.split(" ");
        if (temp.length != 3) {
            throw new Error(
                "element '" +
                    element.id +
                    "': invalid " +
                    temp.length +
                    " number of components for a vector3, in attribute " +
                    attributeName +
                    "."
            );
        }

        let vector3 = new Array();
        for (let i = 0; i < 3; i++) {
            vector3.push(parseFloat(temp[i]));
        }
        return vector3;
    }

    /**
     * returns a vector2 from an element for a particular attribute
     * @param {*} element the xml element
     * @param {*} attributeName the attribute name
     * @param {*} required if the attribte is required or not
     * @returns {THREE.vector3} the vector2 encoded in a THREE.Vector3 object
     */

    getVector2(element, attributeName, required) {
        if (required == undefined) required = true;

        if (element == null) {
            throw new Error("element is null.");
        }
        if (attributeName == null) {
            throw new Error("vector3 attribute name is null.");
        }

        let value = element.getAttribute(attributeName);
        if (value == null) {
            if (required) {
                throw new Error(
                    "element '" +
                        element.id +
                        ": vector2 value is null for attribute " +
                        attributeName +
                        "."
                );
            }
            return null;
        }

        let temp = value.split(" ");
        if (temp.length != 2) {
            throw new Error(
                "element '" +
                    element.id +
                    ": invalid " +
                    temp.length +
                    " number of components for a vector2, in attribute " +
                    attributeName +
                    "."
            );
        }

        let vector2 = new Array();
        for (let i = 0; i < 2; i++) {
            vector2.push(parseFloat(temp[i]));
        }
        return vector2;
    }
    /**
     * returns an item from an element for a particular attribute and checks if the item is in the list of choices
     * @param {*} element the xml element
     * @param {*} attributeName the
     * @param {*} choices the list of choices
     * @param {*} required if the attribte is required or not
     * @returns {String} the item
     */
    getItem(element, attributeName, choices, required) {
        if (required == undefined) required = true;

        if (element == null) {
            throw new Error("element is null.");
        }
        if (attributeName == null) {
            throw new Error("item attribute name is null.");
        }

        let value = element.getAttribute(attributeName);
        if (value == null) {
            if (required) {
                throw new Error(
                    "element '" +
                        element.id +
                        ": item value is null for attribute " +
                        attributeName +
                        "."
                );
            }
            return null;
        }

        value = value.toLowerCase();
        let index = this.indexOf(choices, value);
        if (index < 0) {
            throw new Error(
                "element '" +
                    element.id +
                    ": value '" +
                    value +
                    "' is not a choice in [" +
                    choices.toString() +
                    "]"
            );
        }

        return value;
    }

    /**
     * returns a string from an element for a particular attribute
     * @param {*} element the xml element
     * @param {*} attributeName the attribute name
     * @param {*} required if the attribte is required or not
     * @returns {String} the string
     */
    getString(element, attributeName, required) {
        if (required == undefined) required = true;

        if (element == null) {
            throw new Error("element is null.");
        }
        if (attributeName == null) {
            throw new Error("string attribute name is null.");
        }

        let value = element.getAttribute(attributeName);
        if (value == null && required) {
            throw new Error(
                "element '" +
                    element.id +
                    ": in element '" +
                    element.id +
                    "' string value is null for attribute '" +
                    attributeName +
                    "'."
            );
        }
        return value;
    }

    /**
     * checks if an element has a particular attribute
     * @param {*} element the xml element
     * @param {*} attributeName
     * @returns {boolean} if the element has the attribute
     */
    hasAttribute(element, attributeName) {
        if (element == null) {
            throw new Error("element is null.");
        }
        if (attributeName == null) {
            throw new Error("string attribute name is null.");
        }

        let value = element.getAttribute(attributeName);
        return value != null;
    }

    /**
     * returns a boolean from an element for a particular attribute
     * @param {*} element the xml element
     * @param {*} attributeName the
     * @param {*} required if the attribte is required or not
     * @returns {boolean} the boolean value
     */
    getBoolean(element, attributeName, required) {
        if (required === undefined) required = true;

        let value = this.getItem(
            element,
            attributeName,
            ["true", "t", "1", "false", "f", "0"],
            required
        );
        if (value == null && required) {
            throw new Error(
                "element '" +
                    element.id +
                    ": expected boolean element " +
                    attributeName +
                    " not found"
            );
        }

        if (value == "1" || value == "true" || value == "t") return true;
        if (value == "0" || value == "false" || value == "f") return false;
        return null;
    }

    /**
     * returns a integer from an element for a particular attribute
     * @param {*} element the xml element
     * @param {*} attributeName the
     * @param {*} required if the attribte is required or not
     * @returns {Integer} the integer value
     */
    getInteger(element, attributeName, required) {
        if (required == undefined) required = true;

        let value = this.getString(element, attributeName, required);
        if (value == null) {
            return null;
        }
        return parseInt(value);
    }

    /**
     * returns a float from an element for a particular attribute
     * @param {*} element the xml element
     * @param {*} attributeName the
     * @param {*} required if the attribte is required or not
     * @returns {Float} the float value
     */
    getFloat(element, attributeName, required) {
        if (required == undefined) required = true;

        let value = this.getString(element, attributeName, required);
        if (value == null) {
            return null;
        }
        return parseFloat(value);
    }

    /*
		Load a xml attributes item based on a descriptor:
		Example: options = {elem: elem, descriptor: descriptor, extras: [["type", "pointlight"]]}
		where elem is a xml element, descriptor is an array of all the attributes description and extras are extra
		attributes to add to the resulting object.

		Each attribute descriptor is an object with the following properties:
		- name: the name of the attribute
		- type: the type of the attribute (string, boolean, integer, float, vector3, vector2, rgba, rectangle2D, item)
		- required: true if the attribute is required, false otherwise
		- default: the default value if the attribute is not required and not present in the xml element
		- choices: an array of choices if the type is item

	*/
    loadXmlItem(options) {
        // create an empty object
        let obj = {};

        if (options === null || options === undefined) {
            throw new Error(
                "unable to load xml item because arguments are null or undefined"
            );
        }

        if (options.elem === null || options.elem === undefined) {
            throw new Error(
                "unable to load xml item because xml element is null or undefined"
            );
        }

        if (options.descriptor === null || options.descriptor === undefined) {
            throw new Error(
                "unable to load xml item because descriptor to parse element '" +
                    options.elem.id +
                    "' is null or undefined"
            );
        }

        this.checkForUnknownAttributes(
            options.elem,
            this.toArrayOfNames(options.descriptor)
        );

        // for each descriptor, get the value
        for (let i = 0; i < options.descriptor.length; i++) {
            let value = null;
            let descriptor = options.descriptor[i];
            if (descriptor.type === "string")
                value = this.getString(
                    options.elem,
                    descriptor.name,
                    descriptor.required
                );
            else if (descriptor.type === "boolean")
                value = this.getBoolean(
                    options.elem,
                    descriptor.name,
                    descriptor.required
                );
            else if (descriptor.type === "integer")
                value = this.getInteger(
                    options.elem,
                    descriptor.name,
                    descriptor.required
                );
            else if (descriptor.type === "float")
                value = this.getFloat(
                    options.elem,
                    descriptor.name,
                    descriptor.required
                );
            else if (descriptor.type === "vector3")
                value = this.getVector3(
                    options.elem,
                    descriptor.name,
                    descriptor.required
                );
            else if (descriptor.type === "vector2")
                value = this.getVector2(
                    options.elem,
                    descriptor.name,
                    descriptor.required
                );
            else if (descriptor.type === "rgba")
                value = this.getRGBA(
                    options.elem,
                    descriptor.name,
                    descriptor.required
                );
            else if (descriptor.type === "rectangle2D")
                value = this.getRectangle2D(
                    options.elem,
                    descriptor.name,
                    descriptor.required
                );
            else if (descriptor.type === "item")
                value = this.getItem(
                    options.elem,
                    descriptor.name,
                    descriptor.choices,
                    descriptor.required
                );
            else {
                throw new Error(
                    "element '" +
                        options.elem.id +
                        " invalid type '" +
                        descriptor.type +
                        "' in descriptor"
                );
            }

            // if the value is null and the attribute is not required, then use the default value
            if (
                value == null &&
                descriptor.required == false &&
                descriptor.default != undefined
            ) {
                value = descriptor.default;
            }

            // store the value in the object
            obj[descriptor.name] = value;
        }
        // append extra parameters if any
        for (let i = 0; i < options.extras.length; i++) {
            let extra = options.extras[i];
            obj[extra[0]] = extra[1];
        }

        // return the object
        return obj;
    }

    /**
     * for all the children of a given type, of an element, loads each child content into an
     * array in the target object
     * @param {*} elem the parent of the children xml elements to consider
     * @param {*} targetObj the object to store the loaded children items
     * @param {*} attribute the name of the array attribute to create in the target object
     * @param {*} type the element tag name to search and also the descriptor name
     */
    loadChildElementsOfType(elem, targetObj, attribute, type) {
        this.checkForUnknownNodes(elem, [type]);

        targetObj[attribute] = [];
        let elems = elem.getElementsByTagName(type);
        let descriptor = this.data.descriptors[type];
        for (let i = 0; i < elems.length; i++) {
            let obj = this.loadXmlItem({
                elem: elems[i],
                descriptor: descriptor,
                extras: [["type", type]],
            });
            targetObj[attribute].push(obj);
        }
    }

    /**
     * Check if an element exists. Reports a new error if it does not exist.
     * @param {*} elem the xml element
     * @param {*} name the name of the xml element
     */
    checkMandatoryElemExists(elem, name) {
        if (elem == null)
            throw new Error("expected element '" + name + "' not found.");
    }

    /**
     * check if an element has the expected number of instances. Reports a new error if it does not.
     * @param {*} elem the xml element
     * @param {*} name the name of the xml element
     * @param {*} expected the expected number of instances
     */
    checkElemHasInstances(elem, name, min_instances = 1, max_instances = 1) {
        if (
            elem !== null &&
            (elem.length < min_instances || elem.length > max_instances)
        )
            throw new Error(
                "expected number of '" +
                    name +
                    "' elements to be between " +
                    min_instances +
                    " and " +
                    max_instances +
                    ", but found " +
                    elem.length +
                    "."
            );
    }

    /**
     * get an element and check if it exists and has only one instance
     * @param {*} parentElem the parent xml element
     * @param {*} name the name of the xml element
     * @returns the first element with the given name
     */
    getAndCheck(parentElem, name, min_instances = 1, max_instances = 1) {
        let elems = parentElem.getElementsByTagName(name);
        this.checkMandatoryElemExists(elems, name);
        this.checkElemHasInstances(elems, name, min_instances, max_instances);
        return elems[0];
    }

    loadXmlItems(parentElem, tagName, descriptor, extras, addFunc) {
        let elems = parentElem.getElementsByTagName(tagName);
        for (let i = 0; i < elems.length; i++) {
            let obj = this.loadXmlItem({
                elem: elems[i],
                descriptor: descriptor,
                extras: extras,
            });
            addFunc.bind(this.data)(obj);
        }
    }
    /*
     * Load globals element
     *
     */
    loadGlobals(rootElement) {
        let elem = this.getAndCheck(rootElement, "globals");
        this.data.setOptions(
            this.loadXmlItem({
                elem: elem,
                descriptor: this.data.descriptors["globals"],
                extras: [["type", "globals"]],
            })
        );
    }

    /*
     * Load skybox element
     *
     */
    loadSkybox(rootElement) {
        let elem = this.getAndCheck(rootElement, "skybox");
        this.data.setSkybox(
            this.loadXmlItem({
                elem: elem,
                descriptor: this.data.descriptors["skybox"],
                extras: [["type", "skybox"]],
            })
        );
    }

    /*
     * Load fog element
     *
     */
    loadFog(rootElement) {
        let elem = this.getAndCheck(rootElement, "fog", 0, 1);
        if (elem !== null && elem !== undefined)
            this.data.setFog(
                this.loadXmlItem({
                    elem: elem,
                    descriptor: this.data.descriptors["fog"],
                    extras: [["type", "fog"]],
                })
            );
    }

    /**
     * Load the textures element
     * @param {*} rootElement
     */
    loadTextures(rootElement) {
        let elem = this.getAndCheck(rootElement, "textures");
        this.loadXmlItems(
            elem,
            "texture",
            this.data.descriptors["texture"],
            [["type", "texture"]],
            this.data.addTexture
        );
    }

    /**
     * Load the materials element
     * @param {*} rootElement
     */
    loadMaterials(rootElement) {
        let elem = this.getAndCheck(rootElement, "materials");
        this.loadXmlItems(
            elem,
            "material",
            this.data.descriptors["material"],
            [["type", "material"]],
            this.data.addMaterial
        );
    }

    /**
     * Load the cameras element
     * @param {*} rootElement
     */
    loadCameras(rootElement) {
        let elem = this.getAndCheck(rootElement, "cameras");

        let id = this.getString(elem, "initial");
        this.data.setActiveCameraId(id);

        let orthogonals = elem.getElementsByTagName("orthogonal");
        let perspectives = elem.getElementsByTagName("perspective");
        if (orthogonals === null && perspectives === null) {
            throw new Error(
                "at least one camera (ortho/perspective) is required"
            );
        }
        if (
            orthogonals != null &&
            perspectives != null &&
            orthogonals.length + perspectives.length == 0
        ) {
            throw new Error(
                "at least one camera (ortho/perspective) is required"
            );
        }

        this.loadXmlItems(
            elem,
            "orthogonal",
            this.data.descriptors["orthogonal"],
            [["type", "orthogonal"]],
            this.data.addCamera
        );

        this.loadXmlItems(
            elem,
            "perspective",
            this.data.descriptors["perspective"],
            [["type", "perspective"]],
            this.data.addCamera
        );
    }

    /**
     * Load the nodes element
     * @param {*} rootElement
     */
    loadNodes(rootElement) {
        let graphs = rootElement.getElementsByTagName("graph");
        if (graphs == null || graphs.length != 1) {
            throw new Error("graph scene element is missing.");
        }

        let nodeElements = graphs[0].getElementsByTagName("node");
        if (nodeElements == null || nodeElements.length <= 0) {
            throw new Error("at least one node is required in the data.");
        }

        let lodElements = graphs[0].getElementsByTagName("lod");

        let graph = graphs[0];
        let rootId = this.getString(graph, "rootid");

        // set the root node id
        this.data.setRootId(rootId);

        for (let i = 0; i < nodeElements.length; i++) {
            let nodeElement = nodeElements[i];
            this.loadNode(nodeElement);
        }

        // load lod elements if present. There can be no LOD items
        if (lodElements !== null && lodElements !== undefined) {
            for (let i = 0; i < lodElements.length; i++) {
                let lodElement = lodElements[i];
                this.loadLOD(lodElement);
            }
        }
    }

    /**
     * Load the data for a particular node elemment
     * @param {*} nodeElement the xml node element
     */
    loadNode(nodeElement) {
        let id = this.getString(nodeElement, "id");

        // get if node previously added (for instance because it was a child ref in other node)
        let obj = this.data.getNode(id);
        if (obj == null) {
            // otherwise add a new node
            obj = this.data.createEmptyNode(id);
        }

        let isPickable = this.getString(nodeElement, "pickable", false);

        if (isPickable) obj.isPickable = true;

        let castshadows = this.getBoolean(nodeElement, "castshadows", false);
        let receiveShadows = this.getBoolean(
            nodeElement,
            "receiveshadows",
            false
        );

        obj.castShadows = castshadows !== null ? castshadows : false;
        obj.receiveShadows = receiveShadows !== null ? receiveShadows : false;

        // load transformations
        let transforms = nodeElement.getElementsByTagName("transforms");
        if (transforms !== null && transforms.length > 0) {
            this.loadTransforms(obj, transforms[0]);
        }

        // load material references
        let materialsRef = nodeElement.getElementsByTagName("materialref");
        if (materialsRef != null && materialsRef.length > 0) {
            if (materialsRef.length != 1) {
                throw new Error(
                    "in node " +
                        id +
                        ", " +
                        materialsRef.length +
                        " materialref nodes found. Only one materialref is allowed."
                );
            }

            let materialId = this.getString(materialsRef[0], "id");
            obj["materialIds"].push(materialId);
        }

        // load collider
        let colliders = nodeElement.getElementsByTagName("collider");

        if (colliders != null) {
            if (colliders.length > 1) {
                throw new Error("node " + id + ", can only have one collider");
            } else if (colliders.length == 1) {
                let descriptor = this.data.descriptors["collider"];
                let collider = this.loadXmlItem({
                    elem: colliders[0],
                    descriptor: descriptor,
                    extras: [],
                });

                obj.collider = collider;
            }
        }

        // load children (primitives or other node references)
        let childrens = nodeElement.getElementsByTagName("children");
        if (childrens == null || childrens.length != 1) {
            throw new Error("in node " + id + ", a children node is required");
        }
        this.loadChildren(obj, childrens[0]);
        obj.loaded = true;
    }

    /**
     * Load the transformations for a particular node element
     * @param {*} obj the node object
     * @param {*} transformsElement the transforms xml element
     * @returns
     */
    loadTransforms(obj, transformsElement) {
        for (let i = 0; i < transformsElement.childNodes.length; i++) {
            let temp = transformsElement.childNodes[i];
            if (temp.nodeType == 1) {
                let transform = temp;
                if (transform.tagName == "scale") {
                    let factor = this.getVector3(transform, "value3");
                    // add a scale
                    obj.transformations.push({ type: "S", scale: factor });
                } else if (transform.tagName == "rotate") {
                    let factor = this.getVector3(transform, "value3");
                    // add a rotation
                    obj.transformations.push({ type: "R", rotation: factor });
                } else if (transform.tagName == "translate") {
                    let translate = this.getVector3(transform, "value3");
                    // add a translation
                    obj.transformations.push({
                        type: "T",
                        translate: translate,
                    });
                } else {
                    return (
                        "unrecognized transformation " + transform.tagName + "."
                    );
                }
            }
        }
        return null;
    }

    /**
     * Load the children for a particular node element
     * @param {*} nodeObj the node object
     * @param {*} childrenElement the xml children element
     */

    loadChildren(nodeObj, childrenElement) {
        // the allowed children types + noderef
        let lightIds = ["spotlight", "pointlight", "directionallight"];

        for (let i = 0; i < childrenElement.childNodes.length; i++) {
            let child = childrenElement.childNodes[i];
            if (child.nodeType == 1) {
                const id = child.tagName;
                if (lightIds.includes(id)) {
                    let lightObj = this.loadLight(child);
                    this.data.addChildToNode(nodeObj, lightObj);
                } else if (id == "primitive") {
                    let primitiveObj = this.data.createEmptyPrimitive();
                    this.loadPrimitive(child, primitiveObj);
                    this.data.addChildToNode(nodeObj, primitiveObj);
                } else if (id == "noderef") {
                    let id = this.getString(child, "id");
                    // add a node ref: if the node does not exist
                    // create an empty one and reference it.
                    let reference = this.data.getNode(id);
                    if (reference === null) {
                        // does not exist, yet. create it!
                        reference = this.data.createEmptyNode(id);
                    }
                    // reference it.
                    this.data.addChildToNode(nodeObj, reference);
                } else if (id == "lodref") {
                    let id = this.getString(child, "id");
                    // add a lod ref: if the lod does not exist
                    // create an empty one and reference it.
                    let reference = this.data.getLOD(id);
                    if (reference === null) {
                        // does not exist, yet. create it!
                        reference = this.data.createEmptyLOD(id);
                    }
                    // reference it.
                    this.data.addChildToNode(nodeObj, reference);
                } else {
                    throw new Error("unrecognized child type '" + id + "'.");
                }
            }
        }
    }

    /**
     * Loads a light object into a new object
     * @param {*} elem
     * @returns
     */

    loadLight(elem) {
        const primitiveId = elem.tagName;
        let descriptor = this.data.descriptors[primitiveId];
        let obj = this.loadXmlItem({
            elem: elem,
            descriptor: descriptor,
            extras: [["type", primitiveId]],
        });
        return obj;
    }

    /**
     * For a given primitive element, loads the available representations into the primitive object
     * @param {XML element} parentElem
     * @param {*} primitiveObj the primitive object to load data into
     */
    loadPrimitive(parentElem, primitiveObj) {
        this.checkForUnknownNodes(parentElem, this.data.primitiveIds);

        for (let i = 0; i < this.data.primitiveIds.length; i++) {
            let elems = parentElem.getElementsByTagName(
                this.data.primitiveIds[i]
            );
            for (let j = 0; j < elems.length; j++) {
                let elem = elems[j];
                const primitiveId = elem.tagName;
                let descriptor = this.data.descriptors[primitiveId];
                let reprObj = this.loadXmlItem({
                    elem: elem,
                    descriptor: descriptor,
                    extras: [["type", primitiveId]],
                });
                if (primitiveId === "nurbs")
                    this.loadChildElementsOfType(
                        elem,
                        reprObj,
                        "controlpoints",
                        "controlpoint"
                    );
                primitiveObj.representations.push(reprObj);
                if (primitiveObj.subtype === null)
                    primitiveObj.subtype = primitiveId;
            }
        }
        if (primitiveObj.subtype === null) {
            throw new Error(
                "primitive element has no recognized primitive instances"
            );
        }
        primitiveObj.loaded = true;
    }

    /**
     * Load the data for a particular lod elemment
     * @param {*} lodElement the xml lod element
     */
    loadLOD(lodElement) {
        // get the id of the LOD
        let id = this.getString(lodElement, "id");

        // get if LOD previously added (for instance because it was a  ref in other part of the file)
        let obj = this.data.getLOD(id);
        if (obj == null) {
            // otherwise add a new LOD
            obj = this.data.createEmptyLOD(id);
        }

        // load LOD noderef (children) elements
        let noderefs = lodElement.getElementsByTagName("noderef");
        if (noderefs === null || noderefs === undefined) {
            throw new Error("in LOD " + id + ", a noderef is required");
        }
        if (noderefs.length == 0) {
            throw new Error(
                "in LOD " + id + ", at least one noderef is required"
            );
        }

        // for each noderef
        for (let i = 0; i < noderefs.length; i++) {
            let noderef = noderefs[i];
            let id = this.getString(noderef, "id");
            let mindist = this.getFloat(noderef, "mindist");

            // find node by id. if not present create a new one
            let node = this.data.getNode(id);
            if (node == null) {
                // otherwise add a new node
                node = this.data.createEmptyNode(id);
            }
            // store the node as child of this LOD
            obj.children.push({
                node: node,
                mindist: mindist,
                type: "lodnoderef",
            });
        }
        // set the LOD as loaded
        obj.loaded = true;
    }

    /**
     * Load the data for a racetrack
     * @param {*} rootElement
     */
    loadRacetrack(rootElement) {
        // load racetrack
        let racetracks = rootElement.getElementsByTagName("racetrack");

        if (racetracks.length < 1)
            throw new Error(
                "At least one racetrack should be specified in the YAF XML!"
            );

        // There is only one racetrack
        const racetrackElement = racetracks[0];

        // get the id of the Racetrack
        let id = this.getString(racetrackElement, "id");

        let racetrackObj = this.data.createEmptyRacetrack(id);

        racetrackObj.width = this.getFloat(racetrackElement, "width");
        let checkpointsAttr = racetrackElement.getAttribute("checkpoints");
        if (checkpointsAttr !== null) {
            racetrackObj.checkpoints = parseInt(checkpointsAttr);
        } else {
            // Set a default value or handle the absence of the attribute
            racetrackObj.checkpoints = 2; // Example: default to 0
        }

        if (racetrackObj.width == null)
            throw new Error("The track should have a float width");

        // track texture
        racetrackObj.texturePath = this.getString(racetrackElement, "texture");

        // path
        let pathElements = racetrackElement.getElementsByTagName("path");

        if (pathElements == null || pathElements.length != 1) {
            throw new Error(
                "There should be exactly one path in the racetrack"
            );
        }

        this.loadChildElementsOfType(
            pathElements[0],
            racetrackObj,
            "path",
            "point"
        );

        // Check for empty path and set a flag or property accordingly
        if (racetrackObj.path.length === 0) {
            racetrackObj.isEmpty = true; // This property indicates an empty racetrack
        } else if (racetrackObj.path.length < 3) {
            throw new Error("The racetrack path should have at least 3 points");
        }

        // powerups
        let powerUpElements = racetrackElement.getElementsByTagName("powerups");

        if (powerUpElements == null || powerUpElements.length != 1) {
            throw new Error(
                "There should be exactly one path in the racetrack"
            );
        } else {
            this.loadChildElementsOfType(
                powerUpElements[0],
                racetrackObj,
                "powerups",
                "powerup"
            );
        }

        this.data.setRacetrack(racetrackObj);
    }

    /**
     * Load the carcameras element
     * @param {*} elem
     */
    loadCarCameras(elem, car) {
        let orthogonals = elem.getElementsByTagName("orthogonal");
        let perspectives = elem.getElementsByTagName("perspective");
        if (orthogonals === null && perspectives === null) {
            throw new Error(
                "at least one camera (ortho/perspective) is required"
            );
        }

        if (
            orthogonals != null &&
            perspectives != null &&
            orthogonals.length + perspectives.length == 0
        ) {
            throw new Error(
                "at least one camera (ortho/perspective) is required"
            );
        }

        for (let i = 0; i < orthogonals.length; i++) {
            const orth = orthogonals[i];
            let orthogonal = this.loadXmlItem({
                elem: orth,
                descriptor: this.data.descriptors["orthogonal"],
                extras: [["type", "orthogonal"]],
            });

            car.cameras.push(orthogonal);
        }

        for (let i = 0; i < perspectives.length; i++) {
            const perp = perspectives[i];
            let perspective = this.loadXmlItem({
                elem: perp,
                descriptor: this.data.descriptors["perspective"],
                extras: [["type", "perspective"]],
            });

            car.cameras.push(perspective);
        }
    }

    /**
     * Load the data for the cars
     * @param {*} rootElement
     */
    loadCars(rootElement) {
        // load cars
        let cars = rootElement.getElementsByTagName("car");

        if (
            cars.length < 1 &&
            this.xmlfilename != "scenes/scene1/initialMenu.xml" &&
            this.xmlfilename != "scenes/scene1/finalMenu.xml"
        )
            throw new Error(
                "At least one car should be specified in the YAF XML!"
            );

        // Load car data
        const carElements = cars;

        for (let elemIdx = 0; elemIdx < carElements.length; elemIdx++) {
            const element = carElements[elemIdx];

            const id = this.getString(element, "id");

            const car = this.data.createEmptyCar(id);

            /* BODY */
            const body = this.data.createEmptyNode(id + "_body");

            // load children (primitives or other node references) these are the car's parts
            let childrens = element.getElementsByTagName("body");
            if (childrens == null || childrens.length != 1) {
                throw new Error("in car " + id + ", a body node is required");
            }

            this.loadChildren(body, childrens[0]);

            car.body = body;

            /* WHEELS */ // TODO: this;

            const turningWheels = this.data.createEmptyNode(
                id + "_turning_wheels"
            );

            // load children (primitives or other node references) these are the car's parts
            let twChildrens = element.getElementsByTagName("turnwheels");
            if (twChildrens == null || twChildrens.length != 1) {
                throw new Error("in car " + id + ", a body node is required");
            }

            this.loadChildren(turningWheels, twChildrens[0]);

            for (let i = 0; i < turningWheels.children.length; i++) {
                const element = turningWheels.children[i];
                car.turningWheels.push(element);
            }

            const stationaryWheels = this.data.createEmptyNode(
                id + "_stationary_wheels"
            );

            // load children (primitives or other node references) these are the car's parts
            let stChildrens = element.getElementsByTagName("statwheels");
            if (stChildrens == null || stChildrens.length != 1) {
                throw new Error("in car " + id + ", a body node is required");
            }

            this.loadChildren(stationaryWheels, stChildrens[0]);

            for (let i = 0; i < stationaryWheels.children.length; i++) {
                const element = stationaryWheels.children[i];
                car.stationaryWheels.push(element);
            }

            /* COLLIDER */

            let colliders = element.getElementsByTagName("collider");

            if (colliders == null || colliders.length != 1) {
                throw new Error(
                    "in car " + id + ", a unique collider node is required"
                );
            }

            let descriptor = this.data.descriptors["collider"];
            let collider = this.loadXmlItem({
                elem: colliders[0],
                descriptor: descriptor,
                extras: [],
            });

            car.collider = collider;

            /* CAR CAMERAS */
            let carcameras = element.getElementsByTagName("carcameras");
            if (carcameras == null || carcameras.length != 1) {
                throw new Error(
                    "in car " + id + ", a carcameras node is required"
                );
            }

            this.loadCarCameras(carcameras[0], car);

            /* CAR FRONTLIGHTS */
            let frontlights = element.getElementsByTagName("frontlights");

            if (frontlights == null || frontlights.length != 1) {
                throw new Error(
                    "in car " + id + ", a frontlights node is required"
                );
            }

            for (let i = 0; i < frontlights[0].children.length; i++) {
                const child = frontlights[0].children[i];
                let lightObj = this.loadLight(child);

                car.frontLights.push(lightObj);
            }

            /* CAR REARLIGHTS */
            let rearlights = element.getElementsByTagName("rearlights");

            if (rearlights == null || rearlights.length != 1) {
                throw new Error(
                    "in car " + id + ", a rearlights node is required"
                );
            }

            for (let i = 0; i < rearlights[0].children.length; i++) {
                const child = rearlights[0].children[i];
                let lightObj = this.loadLight(child);

                car.rearLights.push(lightObj);
            }

            /* CAR ROUTE */

            let carRoute = element.getElementsByTagName("route");

            if (carRoute == null || carRoute.length != 1) {
                throw new Error("in car " + id + ", a route node is required");
            }

            car.routeTime = this.getFloat(carRoute[0], "time");

            this.loadChildElementsOfType(carRoute[0], car, "route", "point");

            this.data.addCar(car);
        }
    }

    /**
     * Load the data for a hud element
     * @param {*} rootElement
     */
    loadHUD(rootElement) {
        // load hud
        let hud = rootElement.getElementsByTagName("hud");

        if (hud.length < 1)
            throw new Error(
                "At least one hud should be specified in the YAF XML!"
            );

        // There is only one hud
        const hudElement = hud[0];

        // get the id of the HUD
        let id = this.getString(hudElement, "id");

        //creates an empty hud, with all its attributes
        let hudObj = this.data.createEmptyHud(id);

        // TIMEELAPSED
        let timeElapsedElements =
            hudElement.getElementsByTagName("timeElapsed");

        if (timeElapsedElements == null) {
            throw new Error(
                "There should be exactly one time elapsed element in the hud"
            );
        }

        this.loadChildElementsOfType(
            timeElapsedElements[0],
            hudObj,
            "timeElapsed",
            "time"
        );

        //LAPS

        let lapsElements = hudElement.getElementsByTagName("laps");

        if (lapsElements == null) {
            throw new Error(
                "There should be exactly one laps element in the hud"
            );
        }

        this.loadChildElementsOfType(lapsElements[0], hudObj, "laps", "lap");

        //SPEEDOMETER

        let speedometerElements =
            hudElement.getElementsByTagName("speedometer");

        if (speedometerElements == null) {
            throw new Error(
                "There should be exactly one speedometer element in the hud"
            );
        }

        this.loadChildElementsOfType(
            speedometerElements[0],
            hudObj,
            "speedometer",
            "speed"
        );

        //TIMELEFTBENEFIT

        let timeLeftBenefitElements =
            hudElement.getElementsByTagName("timeLeftBenefit");

        if (timeLeftBenefitElements == null) {
            throw new Error(
                "There should be exactly one timeLeftBenefit element in the hud"
            );
        }

        this.loadChildElementsOfType(
            timeLeftBenefitElements[0],
            hudObj,
            "timeLeftBenefit",
            "time"
        );

        //TIMELEFTPENALTY

        let timeLeftPenaltyElements =
            hudElement.getElementsByTagName("timeLeftPenalty");

        if (timeLeftPenaltyElements == null) {
            throw new Error(
                "There should be exactly one timeLeftPenalty element in the hud"
            );
        }

        this.loadChildElementsOfType(
            timeLeftPenaltyElements[0],
            hudObj,
            "timeLeftPenalty",
            "time"
        );

        //STATES

        let statesElements = hudElement.getElementsByTagName("states");

        if (statesElements == null) {
            throw new Error(
                "There should be exactly one states element in the hud"
            );
        }

        this.loadChildElementsOfType(
            statesElements[0],
            hudObj,
            "states",
            "state"
        );

        this.data.setHud(hudObj);
    }

    loadObstacles(rootElement) {
        // load hud
        let obstaclesObjs = rootElement.getElementsByTagName("obstacles");

        if (obstaclesObjs.length > 1)
            throw new Error(
                "Only one obstacles should be specified in the YAF XML!"
            );

        if (obstaclesObjs.length == 0) return;

        const obstaclesDataObj = this.data.createEmptyObstacles();

        obstaclesDataObj.cameraName = this.getString(
            obstaclesObjs[0],
            "camera",
            true
        );

        const obstacles = obstaclesObjs[0].getElementsByTagName("obstacle");

        for (let i = 0; i < obstacles.length; i++) {
            const obstacleElement = obstacles[i];

            obstaclesDataObj.obstacles.push(
                this.getString(obstacleElement, "noderef")
            );
        }

        this.data.setObstacles(obstaclesDataObj);
    }

    /**
     * Load the data for the animations
     * @param {*} rootElement
     */
    loadAnimations(rootElement) {
        // load animations
        let animationElements = rootElement.getElementsByTagName("animation");

        if (animationElements.length < 1) return;

        for (let animIdx = 0; animIdx < animationElements.length; animIdx++) {
            const animElement = animationElements[animIdx];

            let descriptor = this.data.descriptors["animation"];
            let animation = this.loadXmlItem({
                elem: animElement,
                descriptor: descriptor,
                extras: [],
            });

            const tracksElements = animElement.getElementsByTagName("tracks");

            if (tracksElements.length != 1) {
                throw new Error(
                    "There should be exactly one tracks element in the " +
                        animation.id +
                        " animation"
                );
            }

            const trackElem = tracksElements[0];

            const trackElements = trackElem.getElementsByTagName("track");

            const tracks = [];

            for (let i = 0; i < trackElements.length; i++) {
                const track = trackElements[i];

                const trackId = this.getString(track, "id");

                const interpolation = this.getString(track, "interpolation");

                switch (interpolation) {
                    case "smooth":
                    case "linear":
                    case "discrete":
                        break;
                    default:
                        throw new Error(
                            "There is no interpolation called " + interpolation
                        );
                }

                let noderefElements = track.getElementsByTagName("noderef");

                const trackNodes = [];

                for (let j = 0; j < noderefElements.length; j++) {
                    const noderef = noderefElements[j];

                    trackNodes.push(this.getString(noderef, "value"));
                }

                tracks.push({
                    id: trackId,
                    nodes: trackNodes,
                    interpolation,
                });
            }

            animation.tracks = tracks;

            const timestampsElements =
                animElement.getElementsByTagName("timestamps");

            if (timestampsElements.length != 1) {
                throw new Error(
                    "There should be exactly one timestamps element in the " +
                        animation.id +
                        " animation"
                );
            }

            const timestampElem = timestampsElements[0];

            const timestampElements =
                timestampElem.getElementsByTagName("timestamp");

            const timestamps = [];

            for (let i = 0; i < timestampElements.length; i++) {
                const timestamp = timestampElements[i];

                const timestampValue = this.getFloat(timestamp, "value");

                let keyElements = timestamp.getElementsByTagName("key");

                const timestampKeys = new Object();

                for (let j = 0; j < keyElements.length; j++) {
                    const key = keyElements[j];

                    const keyId = this.getString(key, "id");
                    let foundTrack = false;
                    tracks.forEach((track) => {
                        if (track.id == keyId) {
                            foundTrack = true;
                        }
                    });

                    if (!foundTrack) {
                        throw new Error(
                            "Animation " +
                                animation.id +
                                " has a key with id " +
                                keyId +
                                " but no track with the same id"
                        );
                    }

                    const keyObj = {
                        id: keyId,
                        transformations: [],
                    };
                    this.loadTransforms(keyObj, key);
                    timestampKeys[keyId] = keyObj;
                }

                timestamps.push({
                    value: timestampValue,
                    keys: timestampKeys,
                });
            }

            animation.timestamps = timestamps;

            this.data.addAnimation(animation);
        }
    }
}

export { MyFileReader };
