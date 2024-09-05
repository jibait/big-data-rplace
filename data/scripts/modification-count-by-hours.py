import sys
import shutil
from pyspark import SparkContext
import findspark
import datetime

findspark.init()

# Script which counts the number of modifications by hour
# Result is formatted as `hour,count`

sc = SparkContext("local", "modification-count-by-hour")

if len(sys.argv) != 3:
    print("Usage: modification-count-by-hour <input-file> <output-file>")
    sys.exit(1)

input_file = sys.argv[1]
output_file = sys.argv[2]

# Delete output file if it already exists
shutil.rmtree(output_file, ignore_errors=True)

lines = sc.textFile(input_file)

# Remove the first line (headers)
header = lines.first()
lines = lines.filter(lambda line: line != header)

# Extracts the year-month-day hour from a line
def extract_hour(line):
    csv_attr = line.replace('"', "").split(",")
    # First, try to parse with microseconds
    try:
        timestamp = datetime.datetime.strptime(csv_attr[0], "%Y-%m-%d %H:%M:%S.%f %Z")
    except ValueError:
        # If it fails, parse without microseconds
        timestamp = datetime.datetime.strptime(csv_attr[0], "%Y-%m-%d %H:%M:%S %Z")
    time = timestamp.strftime("%Y-%m-%d %H")
    return (time, 1)

hour_counts = lines.map(lambda line: extract_hour(line))
result = hour_counts.reduceByKey(lambda a, b: a + b)
sorted_result = result.sortBy(lambda x: x[0])
formatted_result = sorted_result.map(lambda x: str(x[0]) + "," + str(x[1]))
formatted_result.saveAsTextFile(output_file)
