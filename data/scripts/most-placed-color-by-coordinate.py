import sys
import shutil
from pyspark import SparkContext
import findspark
findspark.init()

# Script which counts the most placed color by coordinate
# Result is formatted as `x,y,color`

sc = SparkContext("local", "most-placed-color-by-coordinate")

if len(sys.argv) != 3:
    print("Usage: most-placed-color-by-coordinate <input-file> <output-file>")
    sys.exit(1)

input_file = sys.argv[1]
output_file = sys.argv[2]

# Delete output file if it already exists
shutil.rmtree(output_file, ignore_errors=True)

lines = sc.textFile(input_file)

# Remove the first line (headers)
header = lines.first()
lines = lines.filter(lambda line: line != header)

# Extracts the coordinates and color from a line
def extract_coordinates_and_color(line):
    csv_attr = line.replace('"', "").split(",")
    # csv_attr[0] : timestamp (ex: `2022-04-04 00:53:51.577 UTC`)
    # csv_attr[1] : user hash (ex: `ovTZk4GyTS1mDQnTbV+vDOCu1f+u6w+CkIZ6445vD4XN8alFy/6GtNkYp5MSic6Tjo/fBCCGe6oZKMAN3rEZHw==`)
    # csv_attr[2] : color (ex: `#00CCC0`)
    # csv_attr[3] : x (ex: `0`)
    # csv_attr[4] : y (ex: `0`)
    return (csv_attr[3] + "," + csv_attr[4] + "," + csv_attr[2], 1)

modifications_with_coordinates_and_color = lines.map(lambda line: extract_coordinates_and_color(line))
coordinates_and_color_count = modifications_with_coordinates_and_color.reduceByKey(lambda a, b: a + b)

def color_count_by_coordinates_from_coordinates_and_color_count(x):
    key_values = x[0].split(",")
    return (key_values[0] + "," + key_values[1], (key_values[2], x[1]))

color_count_by_coordinates = coordinates_and_color_count.map(lambda x: color_count_by_coordinates_from_coordinates_and_color_count(x))

most_placed_color_by_coordinates = color_count_by_coordinates.reduceByKey(lambda a, b: a if a[1] > b[1] else b)

formated_result = most_placed_color_by_coordinates.map(lambda x: x[0] + "," + str(x[1][0]))
formated_result.saveAsTextFile(output_file)