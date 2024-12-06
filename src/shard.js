const AdvancedShardManager = require('../src/utils/sharding');
const config = require('../config.json');
const { shard } = require('../src/utils/logs')

const path = './src/index.js';

const manager = new AdvancedShardManager(path, {
    token: config.token,
    totalShards: 'auto',
    shardsPerCluster: 2,
    maxMemoryPerShard: 1024,
});

manager.spawn();

/*manager.on('shardStatsUpdate', (shardId, stats) => {
    shard(`Shard ${shardId} stats updated.`);
});*/
