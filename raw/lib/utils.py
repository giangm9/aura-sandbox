import mathutils


def get_world_bounds(obj):
    """Gets the world bounding box of an object."""
    if obj.type == "MESH":
        matrix_world = obj.matrix_world
        bounding_box = [
            matrix_world @ mathutils.Vector(corner) for corner in obj.bound_box
        ]
        return bounding_box
    else:
        print("Object is not a mesh")
        return None
