const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');
const path = require("node:path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot)

// Add the additional `cjs` extension to the resolver
config.resolver.sourceExts.push("cjs");


// 1. Watch all files within the monorepo
config.watchFolders = [workspaceRoot];
// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, "node_modules"),
    path.resolve(workspaceRoot, "node_modules"),
];

// Force resolution of React to avoid multiple copies
config.resolver.alias = {
  'react': path.resolve(workspaceRoot, 'node_modules/react'),
  'react-dom': path.resolve(workspaceRoot, 'node_modules/react-dom'),
  '@types/react': path.resolve(workspaceRoot, 'node_modules/@types/react'),
};

// Ensure we prioritize local node_modules
config.resolver.disableHierarchicalLookup = false;

// Clear any existing platform extensions and use defaults
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = withNativeWind(config, { input: './global.css' })