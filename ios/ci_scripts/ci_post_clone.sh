#!/bin/sh

# Install CocoaPods and bun.
brew tap oven-sh/bun
brew install cocoapods node bun

bun install

npm config set maxsockets 3

# Install dependencies you manage with CocoaPods.
bun pods