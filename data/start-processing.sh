#!/bin/sh

# Check if hadoop is running
if [ -z "$(jps | grep NameNode)" ]; then
  echo "Starting Hadoop"
  # Execute the /root/start-hadoop.sh script without printing the output
  sh /root/start-hadoop.sh > /dev/null
fi

# Check if hadoop's safe mode is enabled
if [ ! -z "$(hdfs dfsadmin -safemode get | grep ON)" ]; then
  # Disable hadoop's safe mode
  echo "Disabling Hadoop's safe mode"
  hdfs dfsadmin -safemode leave
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

# Check if the input file has already been copied to HDFS
if [ ! -z "$(hdfs dfs -ls data/input | grep $INPUT_FILE_NAME)" ]; then
  echo "Input file /root/input/$INPUT_FILE_NAME has already been copied to HDFS"
else
  echo "Copying input file /root/input/$INPUT_FILE_NAME to HDFS"
  hdfs dfs -put -f /root/input/$INPUT_FILE_NAME data/input
fi

echo "Starting job execution"
# For each files in /root/scripts
for f in /root/scripts/*; do
  # Execute the file
  echo "---"
  echo "Executing $f"
  python3 $f data/input/$INPUT_FILE_NAME data/output/$(basename $f | cut -d. -f1)
done