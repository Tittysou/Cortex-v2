const { ShardingManager } = require('discord.js');
const { EventEmitter } = require('events');
const os = require('os');
const config = require('../../config.json');
const logger = require('./logs');

class AdvancedShardManager extends EventEmitter {
    constructor(file, options = {}) {
        super();
        
        this.file = file;
        this.options = {
            token: config.token,
            totalShards: 'auto',
            shardsPerCluster: 2,
            respawn: true,
            autoSpawn: true,
            timeout: 30000,
            maxMemoryPerShard: 1024,
            monitoring: {
                enabled: true,
                port: 3000
            },
            ...options
        };

        this.manager = new ShardingManager(this.file, {
            token: this.options.token,
            totalShards: this.options.totalShards,
            respawn: this.options.respawn,
            timeout: this.options.timeout
        });

        this.stats = {
            totalGuilds: 0,
            totalUsers: 0,
            shards: new Map(),
            lastUpdate: Date.now()
        };

        this.setupEvents();
    }

    setupEvents() {
        this.manager.on('shardCreate', shard => {            
            logger.shard(`Launched shard ${shard.id}`);
            this.setupShardListeners(shard);

            this.stats.shards.set(shard.id, {
                id: shard.id,
                status: 'initializing',
                guilds: 0,
                users: 0,
                ping: 0,
                ram: 0,
                uptime: 0
            });
        });
    }

    setupShardListeners(shard) {
        shard.on('ready', () => {
            this.updateShardStats(shard.id, { status: 'ready' });
        });

        shard.on('disconnect', () => {
            logger.shard(`Shard ${shard.id} Disconnected`);
            this.updateShardStats(shard.id, { status: 'disconnected' });
        });

        shard.on('death', () => {
            logger.shard(`Shard ${shard.id} Died, attempting to respawn...`);
            this.updateShardStats(shard.id, { status: 'dead' });
        });

        shard.on('error', (error) => {
            logger.shard(`Shard ${shard.id} Error:`, error);
            this.updateShardStats(shard.id, { status: 'error' });
        });

        setInterval(() => this.collectShardStats(shard), 30000);
    }

    async collectShardStats(shard) {
        try {
            const stats = await shard.fetchClientValue('stats');
            const memUsage = process.memoryUsage();
            
            this.updateShardStats(shard.id, {
                ...stats,
                ram: Math.round(memUsage.heapUsed / 1024 / 1024),
                status: 'ready'
            });

            if (memUsage.heapUsed / 1024 / 1024 > this.options.maxMemoryPerShard) {
                logger.shard(`Shard ${shard.id} Memory threshold exceeded, restarting...`);
                await shard.respawn();
            }
        } catch (error) {
            logger.shard(`Shard ${shard.id} Failed to collect stats:`, error);
        }
    }

    updateShardStats(shardId, stats) {
        const currentStats = this.stats.shards.get(shardId) || {};
        this.stats.shards.set(shardId, { ...currentStats, ...stats });
        this.emit('shardStatsUpdate', shardId, this.stats.shards.get(shardId));
    }

    async broadcastToShards(event, data) {
        return await this.manager.broadcastEval((client, context) => {
            client.emit(context.event, context.data);
        }, { context: { event, data } });
    }

    async getAverageLatency() {
        const pings = await this.manager.fetchClientValues('ws.ping');
        return pings.reduce((acc, ping) => acc + ping, 0) / pings.length;
    }

    async spawn() {
        try {
            await this.manager.spawn(this.options.totalShards, this.options.shardsPerCluster);
        } catch (error) {
            throw error;
        }
    }
}

module.exports = AdvancedShardManager;
