import { GLTFLoader } from './three.js/loaders/GLTFLoader.js';
import { DepthTexture } from './three.js/three.module.js';
import { TriangleController } from './triangle.js';
import { getArrowHelper } from './arrowHelper.js';

const renderArea = document.querySelector("#camera-render-area");
const loadingArea = document.querySelector("#loading");

const userAgent = navigator.userAgent.toLowerCase();

let isIOS, isMobile;
let triangleObject;
let baseObject;
let secondTriangle;

const triangleController = new TriangleController(0.5);
const arrowHelpers = getArrowHelper(1); // 1 유닛 길이의 화살표를 반환받습니다.
let globalCamera;

function getUserAgent() {
    if (userAgent.match("iphone") || userAgent.match("ipad") || userAgent.match("ipod") || userAgent.match("mac")) {
		isIOS = true;
        isMobile = true;
		if (!userAgent.match("safari") || userAgent.match("naver") || userAgent.match("twitter")) {
			isIOS = false;
		}
	} else {
        isMobile = userAgent.match("Android") || userAgent.match("mobile");
    }
}

function getLogTitle(text) {
    let base = "======================================";
    return (base + `\n${text}\n` +base);
}

const imageTargetPipelineModule = () => {
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const onPointerMove = (event) => {
        pointer.x = (event.targetTouches[0].pageX / renderArea.clientWidth) * 2 - 1;
        pointer.y = -(event.targetTouches[0].pageY / renderArea.clientHeight) * 2 + 1;
    }

    const initXrScene = ({scene, camera}) => {
        // ArrowHelper

        // 각 화살표를 scene에 추가합니다.
        arrowHelpers.forEach(arrowHelper => {
            console.log(arrowHelper)
            scene.add(arrowHelper);
        });

        baseObject = triangleController.createTriangle(triangleController.triangleSize);
        secondTriangle = triangleController.createTriangle(triangleController.triangleSize);

        scene.add(baseObject);
        scene.add(secondTriangle);

        const light = new THREE.AmbientLight(0xFFFFFF);
        scene.add(light);

        camera.position.set(0, 3, 0);
        globalCamera = camera;
    }


    const showTarget = ({detail}) => {
        // console.log(detail)
        if (detail.name === "ar_marker_resized") {
            let currentMarkerPosition = detail.position;
            let currentMarkerQuaternion = detail.rotation;

            arrowHelpers[0].position.copy(currentMarkerPosition);
            // arrowHelpers[0].quaternion.copy(currentMarkerQuaternion);
            arrowHelpers[0].scale.set(detail.scale, detail.scale, detail.scale);

            arrowHelpers[1].position.copy(currentMarkerPosition);
            // arrowHelpers[1].quaternion.copy(currentMarkerQuaternion);
            arrowHelpers[1].scale.set(detail.scale, detail.scale, detail.scale);

            arrowHelpers[2].position.copy(currentMarkerPosition);
            // arrowHelpers[2].quaternion.copy(currentMarkerQuaternion);
            arrowHelpers[2].scale.set(detail.scale, detail.scale, detail.scale);

            baseObject.position.copy(currentMarkerPosition);
            baseObject.quaternion.copy(currentMarkerQuaternion);
            
            secondTriangle.position.copy(detail.position);
            secondTriangle.quaternion.copy(detail.rotation);

            secondTriangle.position.x = detail.position.x + triangleController.triangleHeight;
            secondTriangle.position.z = detail.position.z - (0.5 * triangleController.triangleSize);
            
            // 쿼터니언각을 오일러각으로 변환 뒤 z축 기준으로 180도 회전해서 다시 쿼터니언으로 변환
            const euler = new THREE.Euler();
            euler.setFromQuaternion(secondTriangle.quaternion, 'XYZ');
            euler.z += Math.PI;

            const additionalQuaternion = new THREE.Quaternion().setFromEuler(euler);
            console.log(secondTriangle.quaternion);
            console.log(additionalQuaternion);
            secondTriangle.quaternion.x = additionalQuaternion.x;
            secondTriangle.quaternion.y = additionalQuaternion.y;
            secondTriangle.quaternion.z = additionalQuaternion.z;
            secondTriangle.quaternion.w = additionalQuaternion.w;

            console.log(baseObject.quaternion.w - secondTriangle.quaternion.w);
            console.log(baseObject.quaternion.x - secondTriangle.quaternion.x);
            console.log(baseObject.quaternion.y - secondTriangle.quaternion.y);
            console.log(baseObject.quaternion.z - secondTriangle.quaternion.z);

            // let markerPosition = triangleController.baseObject.position; // 포지션 x, y, z
            // let markerRotation = detail.rotation; // 쿼터니언 w,x,y,z
            
            // markerPosition.x = markerPosition.x - triangleController.triangleHeight;
            // secondTriangle.position.copy(markerPosition);
            // secondTriangle.rotation.copy(markerRotation);

            // console.log(detail.rotation, markerRotation);

            // videoObj.scale.set(detail.scale, detail.scale, detail.scale);
            // videoObj.visible = true;

            // console.log(globalCamera.position);
            // console.log(globalCamera.rotation);
        }
    }

    const hideTarget = ({detail}) => {
        if (detail.name === "ar_marker_resized") {
            //video.pause()
            //videoObj.visible = false
        }
    }

    const onStart = ({canvas}) => {
        loadingArea.style.backgroundColor = "rgb(0, 0, 0, 0.45)";

        const { scene, camera } = XR8.Threejs.xrScene();

        const renderer = XR8.Threejs.xrScene().renderer;
        
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 0.8;

        initXrScene({ scene, camera });

        canvas.addEventListener("touchstart", (event) => {
            onPointerMove(event);
            raycaster.setFromCamera(pointer, camera);
            const intersection = raycaster.intersectObjects(scene.children);
            
            // console.log(intersection.length);
            console.log(pointer);
            // if (intersection) {
            //     sound.play();
            // }

            // for (let i = 0; i < intersection.length; i++) {
            //     if (intersection[i].object.name == "Gallery") {
            //         video.play();
            //     }
            // }
        })

        canvas.addEventListener('touchmove', (event) => {
            event.preventDefault()
        })

        XR8.XrController.updateCameraProjectionMatrix({
            origin: camera.position,
            facing: camera.quaternion,
        })
    }

    setTimeout(() => {
        loadingArea.parentElement.removeChild(loadingArea);
    }, 5000);

    return {
        name: "GalleryBaton",
        onStart,
        listeners: [
            {event: "reality.imagefound", process: showTarget},
            {event: "reality.imageupdated", process: showTarget},
            {event: "reality.imagelost", process: hideTarget},
        ],
    }
}

const onxrloaded = () => {
    XR8.XrController.configure({disableWorldTracking: false});
    XR8.addCameraPipelineModules([
        XR8.GlTextureRenderer.pipelineModule(),
        XR8.Threejs.pipelineModule(),
        XR8.XrController.pipelineModule(),
        XRExtras.AlmostThere.pipelineModule(),
        XRExtras.FullWindowCanvas.pipelineModule(),
        XRExtras.Loading.pipelineModule(),
        XRExtras.RuntimeError.pipelineModule(),

        imageTargetPipelineModule(),
    ]);
    XR8.run({canvas: renderArea});
}

window.onload = async () => {
    getUserAgent();

    const permObserver = new MutationObserver((mutations) => {
        const permBox = document.querySelector(".prompt-box-8w");
        const permBtnContainer = document.querySelector(".prompt-button-container-8w")
        const permDenyBtn = document.querySelector(".prompt-button-8w");
        const permAllowBtn = document.querySelector(".button-primary-8w");
        if (permBox) {
            permBox.querySelector("p").innerHTML = "<strong>AR 서비스를 이용하실려면<br/>권한 허용이 필요합니다.</strong><br/>계속하시려면 허용 버튼을<br/>눌러주세요";
            permBox.style.fontSize = "18px";
            //permBtnContainer.insertBefore(permAllowBtn, permDenyBtn);
            permDenyBtn.innerHTML = "취소";
            permAllowBtn.innerHTML = "허용";
            permObserver.disconnect();
        }
    });

    permObserver.observe(document.body, {childList: true});

    const load = () => { XRExtras.Loading.showLoading({onxrloaded}) };
    window.XRExtras ? load() : window.addEventListener("xrextrasloaded", load);
}