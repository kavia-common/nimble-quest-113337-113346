#!/bin/bash
cd /home/kavia/workspace/code-generation/nimble-quest-113337-113346/game_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

