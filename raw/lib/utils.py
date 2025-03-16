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


def select_object_recursive(obj):
    """
    Selects an object and all its immediate and nested children.

    Args:
        obj: The Blender object to select.
    """

    if obj is None:
        return

    # Select the object itself
    obj.select_set(True)

    # Recursively select children
    for child in obj.children:
        select_object_recursive(child)
