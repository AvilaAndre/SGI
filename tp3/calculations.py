from PIL import Image

# Load the image to get its dimensions
image_path = '/Users/sofiagoncalves/Desktop/Mestrado/1º ano/Sistemas Gráficos Interativos/sgi-t05-g07/tp3/scenes/scene1/textures/feup.png'
with Image.open(image_path) as img:
    image_width, image_height = img.size

# Calculate the aspect ratio
aspect_ratio = image_width / image_height

print(aspect_ratio)
