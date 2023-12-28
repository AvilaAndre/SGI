from PIL import Image

# Load the image to get its dimensions
image_path = '/Users/sofiagoncalves/Downloads/brownStart.png'
with Image.open(image_path) as img:
    image_width, image_height = img.size

# Provide the dimensions
print(image_width, image_height)
