from PIL import Image, ImageDraw, ImageFont

# Define the font name and size
font_name = ""  # Change this to your desired font
font_size = 80

# Create a blank image for the sprite sheet
sheet_width = 1020  # Change this according to the number of characters you want to include
sheet_height = 1020
sprite_size = 102
columns = sheet_width // sprite_size
rows = sheet_height // sprite_size

sprite_sheet = Image.new("RGBA", (sheet_width, sheet_height), (0, 0, 0 , 0))

# Load the specified font
font = ImageFont.truetype("/Users/sofiagoncalves/Downloads/Sofia_Sans/SofiaSans-VariableFont_wght.ttf", font_size)


# Create a draw object
draw = ImageDraw.Draw(sprite_sheet)

# Characters to include in the sprite sheet
characters = [chr(i) for i in range(32, 127)]  # ASCII characters from 32 to 126

# Loop through characters and draw on the sprite sheet
x = 0
y = 0
for char in characters:
    draw.text((x, y), char, font=font, fill="black")
    x += sprite_size
    if x >= sheet_width:
        x = 0
        y += sprite_size

# Save the sprite sheet
sprite_sheet.save("sprite_sheet_black.png")