import math

spectators = [
    (0, 0.3),
    (2, .4),
    (6, 0),
    (7, 0),
    (9, -.2),
    (12, .2),
    (4, -.6),
]

offset = (4, -4)
# rotate spectators
rotation = 0.8
rot_cos = math.cos(rotation)
rot_sin = math.sin(rotation)

for i in range(len(spectators)):
    x, z = spectators[i]

    spectators[i] = (
            round(x * rot_cos - z * rot_sin + offset[0], 2),
            round(x * rot_sin + z * rot_cos + offset[1], 2)
        )




for i in range(len(spectators)):
    x, z = spectators[i]
    print(f"""            <node id="spectator-{i}">
                <transforms>
                    <scale value3="0.5 0.5 0.5" />
                    <translate value3="{x} 0.1 {z}" />
                    <rotate value3="0 -0.9 0" />
                </transforms>
                <collider pos="0 0" size="1.2 1.2" />
                <children>
                    <primitive>
                        <model3d filepath="scenes/scene1/models/spectators/PrototypePete.gltf" />
                    </primitive>
                </children>
            </node>""")

for i in range(len(spectators)):
    print(f"""            <noderef id="spectator-{i}" /> """)

for i in range(len(spectators)):
    x, z = spectators[i]

    print(f"""            <animation id="spectator-cheer-{i}" duration="0.6" repeat="true" autostart="true">
                <tracks>
                    <track id="spectators" interpolation="smooth"><noderef value="spectator-{i}"/></track>
                </tracks>
                <timestamps>
                    <timestamp value="0"><key id="spectators"><translate value3="{x} 0 {z}"/></key></timestamp>
                    <timestamp value="{round(0.3 + 0.01 * i, 2)}"><key id="spectators"><translate value3="{x} {round(0.27 + 0.01*i, 2)} {z}"/></key></timestamp>
                    <timestamp value="0.6"><key id="spectators"><translate value3="{x} 0 {z}"/></key></timestamp>
                </timestamps>
            </animation>""")