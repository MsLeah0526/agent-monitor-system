#!/bin/bash

# Test script for WebSocket server
# This script starts the WebSocket server and test clients

echo "=== Agent Monitor System - WebSocket Test ==="
echo ""

# Kill any existing processes on ports 8080
echo "Cleaning up existing processes..."
lsof -ti:8080 | xargs kill -9 2>/dev/null || true

# Start WebSocket server
echo "Starting WebSocket server on port 8080..."
node backend/websocket-main.js &
WS_PID=$!

# Wait for server to start
sleep 3

# Start a test client
echo "Starting test client..."
node backend/test-client.js &
TEST_PID=$!

echo ""
echo "=== Test running ==="
echo "WebSocket Server PID: $WS_PID"
echo "Test Client PID: $TEST_PID"
echo ""
echo "Press Ctrl+C to stop all processes"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Stopping all processes..."
    kill $WS_PID 2>/dev/null || true
    kill $TEST_PID 2>/dev/null || true
    exit 0
}

# Trap signals
trap cleanup SIGINT SIGTERM

# Wait for processes
wait
