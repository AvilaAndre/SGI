path = [(11.42, -22.48),
(-20.18, -76.78),
(-21.48, -77.78),
(-23.74, -78.18),
(-25.7, -77.84),
(-27.56, -76.7),
(-33.94, -68.56),
(-45.56, -60.56),
(-54.92, -54.7),
(-56.84, -52.84),
(-57.52, -51.12),
(-57.22, -48.72),
(-52.56, -36.42),
(-46.52, -22.96),
(-44.98, -21.44),
(-42.58, -20.6),
(-39.58, -20.86),
(-36.98, -22.04),
(-35.18, -24.08),
(-34.62, -26.56),
(-35.24, -31.12),
(-39.92, -46.28),
(-39.7, -48.22),
(-39.3, -49.84),
(-37.62, -51.68),
(-35.14, -52.72),
(-33.06, -53.04),
(-29.96, -52.74),
(-27.54, -51.48),
(-25.78, -49.58),
(-25.0, -47.68),
(-16.36, -14.68),
(-15.58, -13.22),
(-14.06, -11.68),
(38.34, 40.08),
(39.42, 42.06),
(39.42, 43.64),
(38.86, 45.36),
(37.16, 47.28),
(35.46, 48.34),
(32.46, 49.28),
(29.36, 49.7),
(26.22, 49.7),
(23.62, 49.28),
(20.68, 48.26),
(18.38, 46.94),
(-20.28, 9.36),
(-22.2, 8.48),
(-24.92, 8.0),
(-27.0, 8.12),
(-29.32, 8.64),
(-31.0, 9.6),
(-32.88, 11.16),
(-34.18, 13.3),
(-35.06, 15.68),
(-39.64, 45.74),
(-39.58, 47.62),
(-39.14, 49.48),
(-38.18, 51.44),
(-35.74, 53.44),
(-32.14, 55.28),
(-21.64, 58.4),
(-8.62, 61.22),
(-2.74, 61.1),
(8.14, 58.54),
(11.26, 58.48),
(13.86, 59.4),
(16.0, 61.86),
(20.12, 70.8),
(22.6, 73.44),
(26.5, 75.9),
(30.32, 77.48),
(36.02, 78.18),
(40.7, 77.6),
(46.0, 76.02),
(50.24, 73.6),
(53.62, 70.56),
(55.82, 67.68),
(57.18, 63.62),
(57.5, 60.36),
(56.9, 56.48),
(55.14, 52.8),
(11.42, -22.48)]


print(path)

largest_x = 0
largest_x_defined = False
smallest_x = 0
smallest_x_defined = False
largest_y = 0
largest_y_defined = False
smallest_y = 0
smallest_y_defined = False

for x, y in path: 
    if x > largest_x or not largest_x_defined:
        largest_x = x
        largest_x_defined=True
    if x < smallest_x or not smallest_x_defined:
        smallest_x= x
        smallest_x_defined = True
    if y > largest_y or not largest_y_defined:
        largest_y = y
        largest_y_defined = True
    if y < smallest_y or not smallest_y_defined:
        smallest_y = y
        smallest_y_defined = True

print("largestX", largest_x)
print("smallestX", smallest_x)
print("largestY", largest_y)
print("smallestY", smallest_y)

delta_x = round(-(largest_x + smallest_x)/2, 2)
delta_y = round(-(largest_y + smallest_y)/2, 2)

print("delta_x", delta_x)
print("delta_y", delta_y)



points = list(map(lambda point: (round(point[0] + delta_x, 2), round(point[1] + delta_y, 2) ), path))

for x, y in points:
    print(f"<point value2=\"{round(x*3, 2)} {round(y*3, 2)}\"/>")