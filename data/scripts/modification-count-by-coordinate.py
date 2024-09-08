import sys
import shutil
from pyspark import SparkContext
import findspark
findspark.init()
from PIL import Image, ImageDraw
import time
import os
import subprocess
import math

# Script which counts the number of modifications by coordinate
# Result is formatted as `x,y,count`

sc = SparkContext("local[*]", "modification-count-by-coordinate")
sc.setLogLevel("ERROR")

if len(sys.argv) != 3:
    print("Usage: modification-count-by-coordinate <input-file> <output-file>")
    sys.exit(1)

input_file = sys.argv[1]
output_file = sys.argv[2]

# Delete output file if it already exists
shutil.rmtree(output_file, ignore_errors=True)

lines = sc.textFile(input_file)

# Remove the first line (headers)
header = lines.first()
lines = lines.filter(lambda line: line != header)

# Extracts the coordinates from a line
def extract_coordinates(line):
    csv_attr = line.replace('"', "").split(",")
    # csv_attr[0] : timestamp (ex: `2022-04-04 00:53:51.577 UTC`)
    # csv_attr[1] : user hash (ex: `ovTZk4GyTS1mDQnTbV+vDOCu1f+u6w+CkIZ6445vD4XN8alFy/6GtNkYp5MSic6Tjo/fBCCGe6oZKMAN3rEZHw==`)
    # csv_attr[2] : color (ex: `#00CCC0`)
    # csv_attr[3] : x (ex: `0`)
    # csv_attr[4] : y (ex: `0`)
    return (csv_attr[3] + "," + csv_attr[4], 1)

coordinates = lines.map(lambda line: extract_coordinates(line))
result = coordinates.reduceByKey(lambda a, b: a + b)

sorted_result = result.sortBy(lambda x: x[1], ascending=False)

formated_result = sorted_result.map(lambda x: x[0] + "," + str(x[1]))

# Get max value
max_value = int(sorted_result.first()[1])
print("Max value: " + str(max_value))

collected_formated_result = formated_result.coalesce(1).collect()

print("Generating the image...")

# Image creation
image = Image.new("RGB", (2000, 2000), "white")
draw = ImageDraw.Draw(image)

# Draw the pixels
for coordinates in collected_formated_result:
    x, y, count = coordinates.split(",")

    # Transformation logarithmique
    log_count = math.log1p(int(count))  # Utilise log1p pour éviter log(0) qui est indéfini
    log_max_value = math.log1p(max_value)

    intensity = log_count / log_max_value

    color = int((1 - intensity) * 255)

    draw.point((int(x), int(y)), fill=(color, color, 255))

# Save the image locally
local_image_path = "/tmp/modification-count-by-coordinate-" + str(int(time.time() * 1000))  + ".png"
print("Saving the image to " + local_image_path)
image.save(local_image_path, "PNG")

# HDFS path where the image will be saved
hdfs_image_path = output_file + ".png"

# Command to copy the image to HDFS
hdfs_command = f"hdfs dfs -put {local_image_path} {hdfs_image_path}"

# Execute the command
try:
    subprocess.run(hdfs_command, check=True, shell=True)
    print(f"Image successfully saved to HDFS at {hdfs_image_path}")
except subprocess.CalledProcessError as e:
    print(f"Failed to save image to HDFS: {e}")
