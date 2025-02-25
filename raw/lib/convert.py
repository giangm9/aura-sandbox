# Convert between blender and webgl coordinate systems

def convert_to_webgl(x, y, z):
    return x, z, -y
