import bpy  # type: ignore

building_name = "WM"

builing = bpy.data.objects[building_name]


for floor in builing.children:

    if not floor.name.startswith(f"{building_name}_F"):
        continue

    floor_name = floor.name.replace(f"{building_name}_F", "")
    floor_id = floor_name[0]
    floor.name = f"{building_name}_F{floor_name}"

    for unit in floor.children:
        name = unit.name
        if "Facade" in name:
            unit.name = f"{building_name}_F{floor_name}_Facade"
            continue
        if "Proxy" in name:
            unit.name = f"{building_name}_F{floor_name}_Proxy"
            continue

        unit_id = name.split("_")[-1].zfill(2)
        unit.name = f"{building_name}_F{floor_id}_{unit_id}"

        for component in unit.children:
            if "cover" in component.name:
                component.name = f"{building_name}_F{floor_id}_{unit_id}_Cover"
                continue
