#!/usr/bin/env bash

# for testing purposes prime the api database with examples of events read from 
# examples.json

set -xe

needs() {
  for dep in "$@"; do
    command -v "${dep}" >/dev/null 2>&1 || { echo >&2 "require ${dep} but not found in PATH; $*"; exit 1; }
  done
}

needs "jq" "curl"

script_dir="$(dirname $(readlink -f ${BASH_SOURCE[0]}))"
ex_file="${script_dir}/examples.json"

ex_len=$(jq '. | length' "${ex_file}")

for i in $(seq 0 $((ex_len-1))); do
  ex="$(jq -r ".[$i] | tostring" "${ex_file}")"
  curl -X "POST" -H "Content-Type: application/json" --data "${ex}" localhost:5000/api/events
done
