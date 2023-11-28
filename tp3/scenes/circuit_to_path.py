points = [
    [-9.393073, 38.749017],
    [-9.395047, 38.745624],
    [-9.395129, 38.745561],
    [-9.39527, 38.745536],
    [-9.395393, 38.745558],
    [-9.395509, 38.745629],
    [-9.395908, 38.746138],
    [-9.396634, 38.746638],
    [-9.397219, 38.747004],
    [-9.397339, 38.74712],
    [-9.397381, 38.747227],
    [-9.397363, 38.747378],
    [-9.397071, 38.748146],
    [-9.396694, 38.748987],
    [-9.396598, 38.749083],
    [-9.396447, 38.749135],
    [-9.39626, 38.749119],
    [-9.396098, 38.749045],
    [-9.395985, 38.748918],
    [-9.39595, 38.748762],
    [-9.395989, 38.748478],
    [-9.396281, 38.74753],
    [-9.396267, 38.747409],
    [-9.396242, 38.747307],
    [-9.396137, 38.747192],
    [-9.395983, 38.747128],
    [-9.395853, 38.747107],
    [-9.395659, 38.747126],
    [-9.395507, 38.747205],
    [-9.395398, 38.747324],
    [-9.395349, 38.747442],
    [-9.394809, 38.749505],
    [-9.39476, 38.749596],
    [-9.394665, 38.749692],
    [-9.39139, 38.752927],
    [-9.391323, 38.753051],
    [-9.391323, 38.75315],
    [-9.391358, 38.753257],
    [-9.391464, 38.753378],
    [-9.39157, 38.753444],
    [-9.391757, 38.753502],
    [-9.391951, 38.753529],
    [-9.392148, 38.753529],
    [-9.39231, 38.753502],
    [-9.392494, 38.753439],
    [-9.392638, 38.753356],
    [-9.395054, 38.751007],
    [-9.395174, 38.750952],
    [-9.395344, 38.750922],
    [-9.395474, 38.75093],
    [-9.395619, 38.750963],
    [-9.395724, 38.751023],
    [-9.395841, 38.75112],
    [-9.395922, 38.751254],
    [-9.395978, 38.751403],
    [-9.396264, 38.753281],
    [-9.39626, 38.753399],
    [-9.396232, 38.753515],
    [-9.396172, 38.753638],
    [-9.39602, 38.753762],
    [-9.395795, 38.753878],
    [-9.395139, 38.754073],
    [-9.394325, 38.754249],
    [-9.393958, 38.754241],
    [-9.393278, 38.754081],
    [-9.393082, 38.754077],
    [-9.39292, 38.754135],
    [-9.392786, 38.754289],
    [-9.392529, 38.754847],
    [-9.392374, 38.755012],
    [-9.39213, 38.755166],
    [-9.391891, 38.755265],
    [-9.391535, 38.755309],
    [-9.391242, 38.755273],
    [-9.390911, 38.755174],
    [-9.390646, 38.755023],
    [-9.390435, 38.754833],
    [-9.390297, 38.754652],
    [-9.390213, 38.754399],
    [-9.390192, 38.754195],
    [-9.39023, 38.753953],
    [-9.39034, 38.753722],
    [-9.393073, 38.749017]
]


for point in points:
    x, y = (point[0] + 9.39, point[1] - 38.753)

    print(f"<point value2=\"{round(x * 8000, 2)} {round(y * 8000, 2)}\"/>")