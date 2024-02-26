import React, {Ref, useEffect, useMemo, useRef} from 'react';
import {Canvas, extend, useFrame, useLoader, useThree} from '@react-three/fiber';
import type {OrbitControls as OrbitControlsImpl} from 'three-stdlib'
import {OrbitControls, Box, PerspectiveCamera, Sky} from '@react-three/drei';
import {useTexture} from '@react-three/drei';
import {
    BufferGeometry,
    Float32BufferAttribute,
    MeshStandardMaterial,
    RepeatWrapping,
    TextureLoader,
    Vector2,
    Mesh,
    Group
} from 'three';
import * as THREE from 'three';
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader'
import {EXRLoader} from 'three/examples/jsm/loaders/EXRLoader'

const BASE_URL = 'http://127.0.0.1:9000'

// 墙壁的厚度
const wallThickness = 0.12;
// 墙壁的高度
const wallHeight = 3;

// 门宽度
const doorWidth = 1;
const doorHeight = 2 * doorWidth;

function Ground() {
    const [map, metalnessMap, normalMap, aoMap] = useLoader(TextureLoader, [
        `${BASE_URL}/wild_grass/MI_Wild_Grass_pjwce0_4K_BaseColor.png`,
        `${BASE_URL}/wild_grass/MI_Wild_Grass_pjwce0_4K_MetallicRoughness.png`,
        `${BASE_URL}/wild_grass/MI_Wild_Grass_pjwce0_4K_Normal.png`,
        `${BASE_URL}/wild_grass/MI_Wild_Grass_pjwce0_4K_Occlusion.png`,
    ]);

    const repeat = new Vector2(4000, 4000); // 根据您的需要调整这个值
    [map, metalnessMap, normalMap, aoMap].forEach(texture => {
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
        texture.repeat.set(repeat.x, repeat.y);
    });

    const mixedTexture = {
        map,
        metalnessMap,
        normalMap,
        aoMap,
        metalness: 0.4,
        roughness: 0.5,
        normalScale: new Vector2(2, 2),
    };

    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} castShadow receiveShadow>
            <planeGeometry attach="geometry" args={[1000, 1000]}/>
            <meshStandardMaterial attach="material" {...mixedTexture}/>
        </mesh>
    );
}

export default function Scene(props: any) {
    return (
        <Canvas>
            <PerspectiveCamera makeDefault position={[0, doorHeight * 0.6, -10]}/>
            {/*<OrbitControls/>*/}
            <CameraController/>
            <ambientLight intensity={1}/>
            {/*<pointLight position={[0, 3, -6]} intensity={1}/>*/}
            <pointLight position={[0, doorHeight, 0]} intensity={3}/>
            <Ground/>
            <Room/>

            <Sky
                distance={450000}
                sunPosition={[5, 100, -20]}
                inclination={0}
                azimuth={0.25}
                {...props}
            />
        </Canvas>
    );
}

function Door() {
    const doorRefBox = useRef<Mesh>(null);
    const doorGroupRef = useRef<Group>(null);

    const [map, metalnessMap, normalMap] = useTexture([
        `${BASE_URL}/door/door.png`,
        `${BASE_URL}/door/doorM.png`,
        `${BASE_URL}/door/doorN.png`,
    ]);

    useMemo(() => {
        [map, metalnessMap, normalMap].forEach(texture => {
            texture.wrapS = texture.wrapT = RepeatWrapping;
        });
    }, [map, metalnessMap, normalMap]);

    const doorMaterial = {
        map,
        metalnessMap,
        normalMap,
        metalness: 0.4,
        roughness: 0.5,
    };

    // 初始状态
    let open = false; // 控制门是否开启
    let targetRotationY = 0; // 目标Y轴旋转角度（弧度）

    useFrame((state, delta) => {
        if (doorGroupRef.current) {
            if (open && doorGroupRef.current.rotation.y > targetRotationY) {
                // 开门动画
                doorGroupRef.current.rotation.y -= delta * 3.2;
                if (doorGroupRef.current.rotation.y < targetRotationY) {
                    doorGroupRef.current.rotation.y = targetRotationY;
                }
            } else if (!open && doorGroupRef.current.rotation.y < 0) {
                // 关门动画
                doorGroupRef.current.rotation.y += delta * 3.2;
                if (doorGroupRef.current.rotation.y > 0) {
                    doorGroupRef.current.rotation.y = 0;
                }
            }
        }
    });

    useEffect(() => {
        if (doorRefBox.current) {
            doorRefBox.current.geometry.translate(-doorWidth * 0.5, 0, 0);
        }
    }, [])

    const toggleOpen = () => {
        open = !open;
        targetRotationY = open ? -Math.PI / 1.3 : 0; // 旋转90度开门
    };

    return <group ref={doorGroupRef} position={[doorWidth * 0.5, doorHeight * 0.5, -5]} onClick={toggleOpen}>
        <mesh>
            <Box args={[doorWidth, doorHeight, 0.1]} ref={doorRefBox}>
                <meshStandardMaterial attach="material" {...doorMaterial}/>
            </Box>
        </mesh>
    </group>
}


function Room() {
    const [map, metalnessMap, normalMap, aoMap] = useTexture([
        `${BASE_URL}/wall/1/wall_BaseColor.png`,
        `${BASE_URL}/wall/1/wall_MetallicRoughness.png`,
        `${BASE_URL}/wall/1/wall_Normal.png`,
        `${BASE_URL}/wall/1/wall_Occlusion.png`,
    ])

    const repeat = new Vector2(10, 10);

    [map, metalnessMap, normalMap, aoMap].forEach(texture => {
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
        texture.repeat.set(repeat.x, repeat.y);
    })

    const mixedTexture = {
        map,
        metalnessMap,
        normalMap,
        aoMap,
        metalness: 0.4,
        roughness: 0.5,
        normalScale: new Vector2(2, 2),
    };

    return (
        <mesh>
            {/* 门模型 */}
            <Door/>

            {/* 地板 */}
            {/*<Box args={[10 - wallThickness, wallThickness, 10 - wallThickness]}*/}
            {/*     position={[0, wallThickness / 2, 0]}>*/}
            {/*    <meshStandardMaterial attach="material" {...mixedTexture}/>*/}
            {/*</Box>*/}
            {/* 天花板 */}
            <Box args={[10 - wallThickness, wallThickness, 10 - wallThickness]}
                 position={[0, wallHeight - wallThickness / 2, 0]}>
                <meshStandardMaterial attach="material" {...mixedTexture}/>
            </Box>

            {/* 后墙 */}
            <Box args={[10, wallHeight, wallThickness]} position={[0, wallHeight / 2, 5]}>
                <meshStandardMaterial attach="material" {...mixedTexture}/>
            </Box>
            {/* 左墙 */}
            <Box args={[wallThickness, wallHeight, 10]} position={[-5, wallHeight / 2, 0]}>
                <meshStandardMaterial attach="material" {...mixedTexture}/>
            </Box>
            {/* 右墙 */}
            <Box args={[wallThickness, wallHeight, 10]} position={[5, wallHeight / 2, 0]}>
                <meshStandardMaterial attach="material" {...mixedTexture}/>
            </Box>

            {/* 门左侧的墙壁部分 */}
            <Box args={[4.5, wallHeight, wallThickness]} position={[-2.75, wallHeight / 2, -5]}>
                <meshStandardMaterial attach="material" {...mixedTexture}/>
            </Box>
            {/* 门右侧的墙壁部分 */}
            <Box args={[4.5, wallHeight, wallThickness]} position={[2.75, wallHeight / 2, -5]}>
                <meshStandardMaterial attach="material" {...mixedTexture}/>
            </Box>
            {/* 门上方的墙壁部分 */}
            <Box args={[doorWidth, wallHeight - doorHeight, wallThickness]}
                 position={[0, (wallHeight + doorHeight) * 0.5, -5]}>
                <meshStandardMaterial attach="material" {...mixedTexture}/>
            </Box>

        </mesh>
    );
}


function CameraController() {
    const {camera, gl} = useThree();
    const orbitRef = useRef<OrbitControlsImpl>(null);
    const moveSpeed = 0.05; // 调整移动速度

    const [movingDirection, setMovingDirection] = React.useState<'forward' | 'backward' | 'left' | 'right' | null>(null);

    const moveForward = (distance: number) => {
        camera.translateZ(-distance);
    }

    const target = new THREE.Vector3(0, doorHeight * 0.6, 0);

    const moveRight = (distance: number) => {
        camera.translateX(distance);
    }

    useFrame(() => {
        const controls = orbitRef.current;

        // 示例：简单地保持摄像机的Y轴位置，防止上下移动超出预设范围
        // camera.position.clamp(new THREE.Vector3(-5, 2, -5), new THREE.Vector3(5, 4, 5));

        switch (movingDirection) {
            case 'forward':
                moveForward(moveSpeed);
                break;
            case 'backward':
                moveForward(-moveSpeed);
                break;
            case 'left':
                moveRight(-moveSpeed);
                break;
            case 'right':
                moveRight(moveSpeed);
                break;
        }
        // camera.lookAt(target);
        // camera.position.set(camera.position.x, doorHeight * 0.6, camera.position.z)
    });

    useEffect(() => {

        const onKeyDown = (event: { key: any; }) => {
            switch (event.key) {
                case 'w': // W键向前移动
                    setMovingDirection('forward');
                    break;
                case 's': // S键向后移动
                    setMovingDirection('backward');
                    break;
                case 'a': // A键向左移动
                    setMovingDirection('left');
                    break;
                case 'd': // D键向右移动
                    setMovingDirection('right');
                    break;
                default:
                    setMovingDirection(null);
            }
        };

        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', () => {
            setMovingDirection(null)
        });

        return () => {
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [camera]);

    return <OrbitControls
        ref={orbitRef} args={[camera, gl.domElement]} maxPolarAngle={Math.PI / 2}
        minPolarAngle={0}
    />
}

