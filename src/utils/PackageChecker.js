const fs = require("node:fs");
const { execSync } = require("node:child_process");
const path = require('node:path');
const { info, error, success } = require('./logs');

const IGNORED_FOLDERS = ['node_modules', '.git'];
const IGNORED_PACKAGES = [''];

function ReadFolder(basePath = '', depth = 5) {
    const files = [];
    const fullPath = path.join(__dirname, basePath);
    
    if (!fs.existsSync(fullPath)) {
        return [];
    }
    
    const readDirectory = (currentPath, currentDepth) => {
        if (currentDepth === 0) return;

        const folderFiles = fs.readdirSync(currentPath, { withFileTypes: true });

        for (const file of folderFiles) {
            const filePath = path.join(currentPath, file.name);

            if (file.isDirectory()) {
                if (IGNORED_FOLDERS.includes(file.name)) continue;
                readDirectory(filePath, currentDepth - 1);
                continue;
            }

            if (!file.name.endsWith('.js')) continue;

            try {
                const data = fs.readFileSync(filePath, 'utf-8');
                files.push({ path: filePath, depth: currentDepth, data });
            } catch (err) {
                error(`Failed to load ${filePath}: ${err.message}`);
            }
        }
    };

    readDirectory(fullPath, depth);
    return files;
}

const builtInModules = [
    'assert', 'async_hooks', 'buffer', 'child_process', 'cluster', 'console',
    'constants', 'crypto', 'dgram', 'dns', 'domain', 'events', 'fs', 'http',
    'http2', 'https', 'inspector', 'module', 'net', 'os', 'path', 'perf_hooks',
    'process', 'punycode', 'querystring', 'readline', 'repl', 'stream',
    'string_decoder', 'timers', 'tls', 'trace_events', 'tty', 'url', 'util',
    'v8', 'vm', 'wasi', 'worker_threads', 'zlib'
];

function getPackages(file) {
    const content = fs.readFileSync(file, "utf-8");
    const requirePatterns = [
        /require\(['"`]([^'"`{}$]+)['"`]\)/g,
        /require\(`([^`{}$]+)`\)/g,
        /from ['"`]([^'"`{}$]+)['"`]/g,
        /import\s+(?:(?:\*\s+as\s+\w+|{\s*[\w\s,]+}|\w+)\s+from\s+)?['"`]([^'"`{}$]+)['"`]/g
    ];

    const packages = new Set();
    for (const pattern of requirePatterns) {
        const matches = [...content.matchAll(pattern)];
        matches.forEach(match => {
            const pkg = match[1].split('/')[0];
            if (filterPackages(pkg)) {
                packages.add(pkg);
            }
        });
    }
    
    return Array.from(packages);
}

function npmCommand(command) {
    try {
        execSync(command, { stdio: "inherit" });
    } catch (error) {
        throw new Error(`npm command failed: ${error.message}`);
    }
}

function filterPackages(package) {
    return !builtInModules.includes(package) && 
           !package.startsWith("node:") && 
           !package.startsWith(".") && 
           !IGNORED_PACKAGES.includes(package);
}

async function managePackages(client) {
    try {
        const files = ReadFolder('..', 3).map(file => file.path);
        const packageJSONPath = path.join(__dirname, '..', '..', 'package.json');

        if (!fs.existsSync(packageJSONPath)) {
            throw new Error("No package.json found");
        }

        const packageJSON = require(packageJSONPath);
        const installedPackages = Object.keys(packageJSON.dependencies || {});
        const requiredPackages = files.map(getPackages).flat();
        
        const filteredRequiredPackages = requiredPackages.filter(filterPackages);
        const unusedPackages = installedPackages.filter(pkg => !filteredRequiredPackages.includes(pkg));
        const missingPackages = filteredRequiredPackages.filter(pkg => !installedPackages.includes(pkg));

        if (unusedPackages.length) {
            info(`Uninstalling unused packages: ${unusedPackages.join(", ")}`);
            npmCommand(`npm uninstall ${unusedPackages.join(" ")}`);
        }

        if (missingPackages.length) {
            info(`Installing missing packages: ${missingPackages.join(", ")}`);
            npmCommand(`npm install ${missingPackages.join(" ")}`);
        }

        success('Package management completed.');
    } catch (err) {
        error(`Package management failed: ${err.message}`);
        throw err;
    }
}

module.exports = managePackages;