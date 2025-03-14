import json, bpy, pprint
import lib.utils as utils

entryData = {
    "NOTE": "This file is generated by Blender. Do not edit this file manually.",
    "name": "WM",
    "version": "1.0",
    "startBuildingId": "WM",
    "environment": {"skybox": "skybox.hdr"},
    "buildings": [["WM", "/glb/WM.glb", "/json/WM.json"]],
}
camera = bpy.data.objects["ProjectStart"]

entryData["startCameraPosition"] = [
    camera.location.x,
    camera.location.z,
    -camera.location.y,
]

entry_path = bpy.path.abspath("//../public/json/entry.json")

with open(entry_path, "w") as file:
    json.dump(entryData, file, indent=4)


buildings = ["WM"]


for building_id in buildings:
    building_data = {
        "NOTE": "This file is generated by Blender. Do not edit this file manually.",
        "id": building_id,
        "name": building_id,
    }

    start_camera = bpy.data.objects[f"{building_id}_Start"]
    building_data["cameraStartPosition"] = [
        start_camera.location.x,
        start_camera.location.z,
        -start_camera.location.y,
    ]

    building = bpy.data.objects[building_id]
    building_data["floors"] = []

    center_object = bpy.data.objects[f"{building_id}_Center"]
    building_data["center"] = [
        center_object.location.x,
        center_object.location.z,
        -center_object.location.y,
    ]
    floor_names = list(
        map(
            lambda name: f"{building_id}_F{name}",
            ["Bottom", "3", "4", "5", "6", "7", "8", "Top"],
        )
    )

    for name in floor_names:
        floor = bpy.data.objects.get(name)
        floor_data = {
            "id": floor.name,
            "name": floor.name.replace(f"{building_id}_F", "Floor_"),
            "facade": f"{floor.name}_Facade",
            "proxy": f"{floor.name}_Proxy",
        }

        units = []

        for unit in floor.children:
            cover_name = f"{unit.name}_Cover"
            if bpy.data.objects.get(cover_name):
                unit_data = [
                    unit.name,
                    unit.name.replace(f"{building_id}_F{floor.name}_", ""),
                    cover_name,
                ]
                units.append(unit_data)

        floor_data["units"] = units

        building_data["floors"].append(floor_data)

    building_data_path = bpy.path.abspath(f"//../public/json/{building_id}.json")

    with open(building_data_path, "w") as file:
        json.dump(building_data, file, indent=2)

    builing_glb_path = bpy.path.abspath(f"//../public/glb/{building_id}.glb")
    bpy.ops.export_scene.gltf(
        filepath=builing_glb_path, export_format="GLB", export_apply=True
    )
