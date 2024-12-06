const { ShardingManager } = require('discord.js');
const config = require('./config.json');

const manager = new ShardingManager('./src/index.js', {
    token: config.token,
    totalShards: 'auto',
    respawn: true
});

manager.on('shardCreate', shard => {
    console.log(`Launched shard ${shard.id}`);
    
    shard.on('ready', () => {
        console.log(`Shard ${shard.id} ready`);
    });

    shard.on('disconnect', () => {
        console.log(`Shard ${shard.id} disconnected`);
    });

    shard.on('error', error => {
        console.error(`Shard ${shard.id} error:`, error);
    });
});

manager.spawn()
    .catch(console.error);