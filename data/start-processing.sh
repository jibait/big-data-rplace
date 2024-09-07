#!/bin/sh

# Check if hadoop is running
if [ -z "$(jps | grep NameNode)" ]; then
  echo "Starting Hadoop"
  # Execute the /root/start-hadoop.sh script without printing the output
  sh /root/start-hadoop.sh > /dev/null
fi

echo "Creating and cleaning HDFS directories"
hdfs dfs -mkdir -p .
hdfs dfs -mkdir -p data
hdfs dfs -mkdir -p data/input

hdfs dfs -rm -r -f data/output
hdfs dfs -mkdir -p data/output

# Check if the input file exists
if [ ! -f /root/input/$INPUT_FILE_NAME ]; then
  echo "Input file /root/input/$INPUT_FILE_NAME does not exist"
  exit 1
fi

# Copy the input files to HDFS
echo "Copying input file /root/input/$INPUT_FILE_NAME to HDFS"
hdfs dfs -put -f /root/input/$INPUT_FILE_NAME data/input

echo "Starting job execution"
# For each files in /root/scripts
for f in /root/scripts/*; do
  # Execute the file
  echo "Executing $f"
#   spark-submit $f data/input/10k.csv data/output/$(basename $f | cut -d. -f1)
  python3 $f data/input/$INPUT_FILE_NAME data/output/$(basename $f | cut -d. -f1)
done