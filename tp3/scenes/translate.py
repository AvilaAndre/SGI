path = [(-24.58, -31.86),
(-40.38, -59.01),
(-41.03, -59.51),
(-42.16, -59.71),
(-43.14, -59.54),
(-44.07, -58.97),
(-47.26, -54.9),
(-53.07, -50.9),
(-57.75, -47.97),
(-58.71, -47.04),
(-59.05, -46.18),
(-58.9, -44.98),
(-56.57, -38.83),
(-53.55, -32.1),
(-52.78, -31.34),
(-51.58, -30.92),
(-50.08, -31.05),
(-48.78, -31.64),
(-47.88, -32.66),
(-47.6, -33.9),
(-47.91, -36.18),
(-50.25, -43.76),
(-50.14, -44.73),
(-49.94, -45.54),
(-49.1, -46.46),
(-47.86, -46.98),
(-46.82, -47.14),
(-45.27, -46.99),
(-44.06, -46.36),
(-43.18, -45.41),
(-42.79, -44.46),
(-38.47, -27.96),
(-38.08, -27.23),
(-37.32, -26.46),
(-11.12, -0.58),
(-10.58, 0.41),
(-10.58, 1.2),
(-10.86, 2.06),
(-11.71, 3.02),
(-12.56, 3.55),
(-14.06, 4.02),
(-15.61, 4.23),
(-17.18, 4.23),
(-18.48, 4.02),
(-19.95, 3.51),
(-21.1, 2.85),
(-40.43, -15.94),
(-41.39, -16.38),
(-42.75, -16.62),
(-43.79, -16.56),
(-44.95, -16.3),
(-45.79, -15.82),
(-46.73, -15.04),
(-47.38, -13.97),
(-47.82, -12.78),
(-50.11, 2.25),
(-50.08, 3.19),
(-49.86, 4.12),
(-49.38, 5.1),
(-48.16, 6.1),
(-46.36, 7.02),
(-41.11, 8.58),
(-34.6, 9.99),
(-31.66, 9.93),
(-26.22, 8.65),
(-24.66, 8.62),
(-23.36, 9.08),
(-22.29, 10.31),
(-20.23, 14.78),
(-18.99, 16.1),
(-17.04, 17.33),
(-15.13, 18.12),
(-12.28, 18.47),
(-9.94, 18.18),
(-7.29, 17.39),
(-5.17, 16.18),
(-3.48, 14.66),
(-2.38, 13.22),
(-1.7, 11.19),
(-1.54, 9.56),
(-1.84, 7.62),
(-2.72, 5.78),
(-24.58, -31.86)]

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
    print(f"<point value2=\"{x*2} {y*2}\"/>")