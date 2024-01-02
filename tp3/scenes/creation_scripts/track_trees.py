import random
import math

path = [
(22.86, -44.96),
(-40.34, -153.56),
(-42.94, -155.56),
(-47.46, -156.36),
(-51.38, -155.68),
(-55.1, -153.4),
(-67.86, -137.12),
(-91.1, -121.12),
(-109.82, -109.4),
(-113.66, -105.68),
(-115.02, -102.24),
(-114.42, -97.44),
(-105.1, -72.84),
(-93.02, -45.92),
(-89.94, -42.88),
(-85.14, -41.2),
(-79.14, -41.72),
(-73.94, -44.08),
(-70.34, -48.16),
(-69.22, -53.12),
(-70.46, -62.24),
(-79.82, -92.56),
(-79.38, -96.44),
(-78.58, -99.68),
(-75.22, -103.36),
(-70.26, -105.44),
(-66.1, -106.08),
(-59.9, -105.48),
(-55.06, -102.96),
(-51.54, -99.16),
(-49.98, -95.36),
(-32.7, -29.36),
(-31.14, -26.44),
(-28.1, -23.36),
(76.7, 80.16),
(78.86, 84.12),
(78.86, 87.28),
(77.74, 90.72),
(74.34, 94.56),
(70.94, 96.68),
(64.94, 98.56),
(58.74, 99.4),
(52.46, 99.4),
(47.26, 98.56),
(41.38, 96.52),
(36.78, 93.88),
(-40.54, 18.72),
(-44.38, 16.96),
(-49.82, 16.0),
(-53.98, 16.24),
(-58.62, 17.28),
(-61.98, 19.2),
(-65.74, 22.32),
(-68.34, 26.6),
(-70.1, 31.36),
(-79.26, 91.48),
(-79.14, 95.24),
(-78.26, 98.96),
(-76.34, 102.88),
(-71.46, 106.88),
(-64.26, 110.56),
(-43.26, 116.8),
(-17.22, 122.44),
(-5.46, 122.2),
(16.3, 117.08),
(22.54, 116.96),
(27.74, 118.8),
(32.02, 123.72),
(40.26, 141.6),
(45.22, 146.88),
(53.02, 151.8),
(60.66, 154.96),
(72.06, 156.36),
(81.42, 155.2),
(92.02, 152.04),
(100.5, 147.2),
(107.26, 141.12),
(111.66, 135.36),
(114.38, 127.24),
(115.02, 120.72),
(113.82, 112.96),
(110.3, 105.6),
(22.86, -44.96)]



minX = 500
maxX = -500
minY = 500
maxY = -500

for point in path:
    if (point[0] < minX):
        minX = point[0]
    elif (point[0] > maxX):
        maxX = point[0]

    if (point[1] < minY):
        minY = point[1]
    elif (point[1] > maxY):
        maxY = point[1]

minX = int(minX) - 50
maxX = int(maxX) + 50
minY = int(minY) - 50
maxY = int(maxY) + 50


def distance_to(ptA, ptB):
    return math.sqrt( pow(ptB[0] - ptA[0], 2) + pow(ptB[1] - ptA[1], 2))

radius_between_trees = 4
radius_between_track_points = 20
trees = []

random.seed(15)

for i in range(0, 500):
    # print("progress", i, len(trees))
    new_tree = (random.randint(minX, maxX), random.randint(minY, maxY))

    broke = False

    smallest_distance = 2* radius_between_track_points +1
    for path_point in path:    
        dt = distance_to(new_tree, path_point)    
        if dt < radius_between_track_points:
            # print("track")
            broke = True
            break
        if dt < smallest_distance:
            smallest_distance = dt

    if broke:
        continue

    if smallest_distance > radius_between_track_points*2:
        print("sm", smallest_distance)
        continue

    for placed_tree in trees:        
        if distance_to(new_tree, placed_tree) < radius_between_trees:
            # print("tree")
            broke = True
            break
    
    if broke:
        continue

    trees.append(new_tree)



for i in range(len(trees)):
    tree = trees[i]
    print(f"""        <node id="defaultTree{i}">
                <transforms>
                    <scale value3="3 3 3" />
                    <translate value3="{tree[0]} 0.1 {tree[1]}" />
                </transforms>
                <collider pos="0 0" size="0.4 0.4" />
                <children>
                    <primitive>
                        <model3d filepath="scenes/scene1/models/trees/{ "tree_simple_dark" if random.randint(0, 1) else "treeLarge"}.glb" />
                    </primitive>
                </children>
        </node>""")
    
for i in range(len(trees)):
    print(f"""        <noderef id="defaultTree{i}" />""")