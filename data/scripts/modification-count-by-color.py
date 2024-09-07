import sys
import shutil
from pyspark import SparkContext
import findspark
findspark.init()

# Script which counts the number of modifications by color
# Result is formatted as `color,count`

sc = SparkContext("local[*]", "modification-count-by-color")
sc.setLogLevel("ERROR")

if len(sys.argv) != 3:
    print("Usage: modification-count-by-color <input-file> <output-file>")
    sys.exit(1)

input_file = sys.argv[1]
output_file = sys.argv[2]

# Delete output file if it already exists
shutil.rmtree(output_file, ignore_errors=True)

lines = sc.textFile(input_file)

# Remove the first line (headers)
header = lines.first()
lines = lines.filter(lambda line: line != header)

# Extracts the color from a line
def extract_colors(line):
    csv_attr = line.replace('"', "").split(",")
    # csv_attr[0] : timestamp (ex: `2022-04-04 00:53:51.577 UTC`)
    # csv_attr[1] : user hash (ex: `ovTZk4GyTS1mDQnTbV+vDOCu1f+u6w+CkIZ6445vD4XN8alFy/6GtNkYp5MSic6Tjo/fBCCGe6oZKMAN3rEZHw==`)
    # csv_attr[2] : color (ex: `#00CCC0`)
    # csv_attr[3] : x (ex: `0`)
    # csv_attr[4] : y (ex: `0`)
    return (csv_attr[2], 1)

placed_colors = lines.map(lambda line: extract_colors(line))
result = placed_colors.reduceByKey(lambda a, b: a + b)
sorted_result = result.sortBy(lambda x: x[1], ascending=False)
formated_result = sorted_result.map(lambda x: x[0] + "," + str(x[1]))
formated_result.coalesce(1).saveAsTextFile(output_file)