import bpy
import json

buildings = ["WM"]

JSON_FILE = "WM_street.json"
JSON_PATH = bpy.path.abspath(f"//../public/json/{JSON_FILE}")

street_data = {}

for building_id in buildings:
    neighbor_parents = bpy.data.objects[building_id + "_neighbors"]
    street_data[building_id] = []
    for child in neighbor_parents.children:
        street_data[building_id].append(child.name)

with open(JSON_PATH, "w") as file:
    json.dump(street_data, file, indent=4)
