from PIL import Image
import os

def resize_image(input_path, output_path, size):
    try:
        with Image.open(input_path) as img:
            # Resize using LANCZOS for high quality downsampling
            resized_img = img.resize(size, Image.Resampling.LANCZOS)
            resized_img.save(output_path, "PNG")
            print(f"Successfully resized {input_path} to {size} and saved as {output_path}")
    except Exception as e:
        print(f"Error resizing {input_path}: {e}")

# Source image
source_image = "logo_final.png"

# Targets
targets = [
    ("icon16.png", (16, 16)),
    ("icon48.png", (48, 48)),
    ("icon128.png", (128, 128))
]

if os.path.exists(source_image):
    for output_name, size in targets:
        resize_image(source_image, output_name, size)
else:
    print(f"Source image {source_image} not found!")
