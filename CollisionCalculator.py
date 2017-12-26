import math
from copy import deepcopy

def recurse_det(matrix, column):
    # recurse_det() returns the reduced matrix required for 
    # naively finding the determinant of a matrix.
    result = []
    orig_size = len(matrix)
    for row in range(1, len(matrix)):
        result.append(matrix[row][0:column]+matrix[row][column+1:orig_size])

    return result

def det(matrix):
    # Naive implementation

    if(len(matrix) == 0):
        return 1
    elif(len(matrix) == 1):
        return matrix[0][0]

    multiplier = 1
    result = 0
    for column, num in enumerate(matrix[0]):
        result += multiplier*num*(det(recurse_det(matrix, column)))
        multiplier *= -1
    return result

def cramer(system, answer, col):
    D = det(system)
    # First replace column with answer column:
    for i in range(0, len(system)):
        # We consider row i
        system[i][col] = answer[i]
    # Now we get "D_col"
    D_col = det(system)
    # Now we apply the result of Cramer's rule.
    return D_col/D

def hypotenuse(x, y):
    return (x**2 + y**2)**0.5

# User Interaction

m1 = float(input("Please enter the MASS of object 1: "))
m2 = float(input("Please enter the MASS of object 2: "))

v1 = float(input("Please enter the SPEED of object 1: "))
v2 = float(input("Please enter the SPEED of object 2: "))

a  = float(input("Please enter angle alpha (in degrees): "))*math.pi/180
b = float(input("Please enter angle beta (in degrees): "))*math.pi/180
e = float(input("Please enter the coefficient of restitution: "))

# Note that the unknowns are v1f, v2f, af, bf.
# We solve in two steps: first find v1fx, v2fx, v1fy, v2fy (using Cramer's rule)
#                        then find af, bf, v1f, v2f from these vars

# Conservation of momentum gives:
# m1*v1x + m2*v2x = m1*v1fx + m2*v2fx
# m1*v1y + m2*v2y = m1*v1fy + m2*v2fy


# Coefficient of restitution gives: 
# v2fx = v2x
# v1fx = v1x 
# v2fy - v1fy = e*v1y - e*v2y

# We construct a system indexed by [v1fy, v2fy]:

# First, get components of the original velocities:
v1x = v1*math.cos(a)
v2x = v2*math.cos(b)

v1y = -v1*math.sin(a)
v2y = v2*math.sin(b)

v1fx = v1x
v2fx = v2x 

system = [
    [m1, m2]
    [-1, 1]
]

answers = [
    m1*v1y+m2*v2y
    e*(v1y - v2y)
]

v1fy = cramer(deepcopy(system), answers, 0)
v2fy = cramer(deepcopy(system), answers, 1)

v1f = hypotenuse(v1fx, v1fy)
v2f = hypotenuse(v2fx, v2fy)

af = 0
bf = 0
if v1f != 0:
    af = math.asin(v1fy/v1f)
if v2f != 0:
    bf = math.asin(v2fy/v2f)


print "v1f = ", str(v1f)
print "af = ", str(af*180/math.pi), " degrees"
print "v2f = ", str(v2f)
print "bf = ", str(bf*180/math.pi), " degrees"