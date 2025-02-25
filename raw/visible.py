import bpy

def show_all():
    for obj in bpy.data.objects:
        obj.hide_set(False)
        
        