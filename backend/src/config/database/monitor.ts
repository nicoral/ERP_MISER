import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { options } from './dataSource';

config();

class DatabaseMonitor {
  private dataSource: DataSource;
  private isMonitoring = false;
  private intervalId: NodeJS.Timeout | null = null;

  constructor() {
    this.dataSource = new DataSource(options);
  }

  async startMonitoring(intervalMs: number = 30000) {
    if (this.isMonitoring) {
      console.log('⚠️ Monitoreo ya está activo');
      return;
    }

    try {
      await this.dataSource.initialize();
      console.log('🔍 Iniciando monitoreo de base de datos...');
      
      this.isMonitoring = true;
      this.intervalId = setInterval(() => {
        this.checkPerformance();
      }, intervalMs);

      // Primera verificación inmediata
      await this.checkPerformance();
      
    } catch (error) {
      console.error('❌ Error iniciando monitoreo:', error.message);
    }
  }

  async stopMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    this.isMonitoring = false;
    
    if (this.dataSource.isInitialized) {
      await this.dataSource.destroy();
    }
    
    console.log('🛑 Monitoreo detenido');
  }

  private async checkPerformance() {
    try {
      const timestamp = new Date().toLocaleTimeString();
      
      // Test de latencia
      const startTime = Date.now();
      await this.dataSource.query('SELECT 1 as test');
      const latency = Date.now() - startTime;
      
      // Estadísticas de conexiones
      const connectionStats = await this.dataSource.query(`
        SELECT 
          count(*) as total_connections,
          count(*) FILTER (WHERE state = 'active') as active_connections,
          count(*) FILTER (WHERE state = 'idle') as idle_connections,
          count(*) FILTER (WHERE state = 'idle in transaction') as idle_in_transaction
        FROM pg_stat_activity 
        WHERE datname = current_database()
      `);
      
      // Estadísticas de cache
      const cacheStats = await this.dataSource.query(`
        SELECT 
          sum(heap_blks_read) as heap_read,
          sum(heap_blks_hit) as heap_hit,
          CASE 
            WHEN sum(heap_blks_hit) + sum(heap_blks_read) = 0 THEN 0
            ELSE round(100.0 * sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)), 2)
          END as cache_hit_ratio
        FROM pg_statio_user_tables
      `);
      
      const stats = connectionStats[0];
      const cache = cacheStats[0];
      
      // Evaluación de estado
      let status = '✅';
      let message = 'Normal';
      
      if (latency > 500) {
        status = '⚠️';
        message = 'Lento';
      }
      
      if (latency > 1000) {
        status = '❌';
        message = 'Muy lento';
      }
      
      if (parseInt(stats.active_connections) > 15) {
        status = '⚠️';
        message = 'Muchas conexiones activas';
      }
      
      console.log(`[${timestamp}] ${status} Latencia: ${latency}ms | Conexiones: ${stats.active_connections}/${stats.total_connections} | Cache: ${cache.cache_hit_ratio}% | ${message}`);
      
    } catch (error) {
      console.error(`❌ Error en monitoreo: ${error.message}`);
    }
  }

  async getDetailedStats() {
    try {
      const stats = await this.dataSource.query(`
        SELECT 
          current_database() as database,
          current_user as user,
          version() as postgres_version,
          pg_size_pretty(pg_database_size(current_database())) as database_size,
          (SELECT setting FROM pg_settings WHERE name = 'max_connections') as max_connections,
          (SELECT count(*) FROM pg_stat_activity WHERE datname = current_database()) as current_connections
      `);
      
      console.log('\n📊 Estadísticas detalladas:');
      console.log(stats[0]);
      
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error.message);
    }
  }
}

// Uso del monitor
async function startMonitoring() {
  const monitor = new DatabaseMonitor();
  
  // Manejar cierre graceful
  process.on('SIGINT', async () => {
    console.log('\n🛑 Cerrando monitoreo...');
    await monitor.stopMonitoring();
    process.exit(0);
  });
  
  await monitor.startMonitoring(30000); // Verificar cada 30 segundos
  
  // Mostrar estadísticas detalladas cada 5 minutos
  setInterval(async () => {
    await monitor.getDetailedStats();
  }, 300000);
}

// Ejecutar si se llama directamente
if (require.main === module) {
  startMonitoring();
}

export { DatabaseMonitor }; 