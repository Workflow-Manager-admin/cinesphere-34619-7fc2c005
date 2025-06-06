#!/bin/bash
cd /home/kavia/workspace/code-generation/cinesphere-34619-7fc2c005/cine_sphere
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

