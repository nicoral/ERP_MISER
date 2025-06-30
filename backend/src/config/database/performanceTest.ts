import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { options } from './dataSource';

config();

async function testDatabasePerformance() {
  const dataSource = new DataSource(options);
  
  try {
    console.log('🔍 Iniciando diagnóstico de rendimiento...');
    
    // Test 1: Tiempo de conexión inicial
    const startTime = Date.now();
    await dataSource.initialize();
    const connectionTime = Date.now() - startTime;
    console.log(`✅ Tiempo de conexión inicial: ${connectionTime}ms`);
    
    // Test 2: Query simple
    const queryStart = Date.now();
    await dataSource.query('SELECT NOW() as current_time');
    const queryTime = Date.now() - queryStart;
    console.log(`✅ Query simple: ${queryTime}ms`);
    
    // Test 3: Query con JOIN
    const joinStart = Date.now();
    await dataSource.query(`
      SELECT e.id, e.first_name
      FROM employee e 
      LIMIT 10
    `);
    const joinTime = Date.now() - joinStart;
    console.log(`✅ Query con JOIN: ${joinTime}ms`);
    
    // Test 4: Múltiples conexiones simultáneas
    const concurrentStart = Date.now();
    const promises = Array.from({ length: 5 }, () => 
      dataSource.query('SELECT pg_sleep(0.1)')
    );
    await Promise.all(promises);
    const concurrentTime = Date.now() - concurrentStart;
    console.log(`✅ 5 queries concurrentes: ${concurrentTime}ms`);
    
    // Test 5: Información de la conexión
    const connectionInfo = await dataSource.query(`
      SELECT 
        current_database() as database,
        current_user as user,
        inet_server_addr() as server_address,
        inet_server_port() as server_port,
        version() as postgres_version
    `);
    
    console.log('\n📊 Información de la conexión:');
    console.log(connectionInfo[0]);
    
    // Test 6: Estadísticas de conexiones
    const poolStats = await dataSource.query(`
      SELECT 
        count(*) as total_connections,
        count(*) FILTER (WHERE state = 'active') as active_connections,
        count(*) FILTER (WHERE state = 'idle') as idle_connections
      FROM pg_stat_activity 
      WHERE datname = current_database()
    `);
    
    console.log('\n📈 Estadísticas de conexiones:');
    console.log(poolStats[0]);
    
    // Evaluación de rendimiento
    console.log('\n🎯 Evaluación de rendimiento:');
    if (connectionTime < 1000) {
      console.log('✅ Conexión inicial: EXCELENTE');
    } else if (connectionTime < 3000) {
      console.log('⚠️ Conexión inicial: ACEPTABLE');
    } else {
      console.log('❌ Conexión inicial: LENTA');
    }
    
    if (queryTime < 100) {
      console.log('✅ Query simple: EXCELENTE');
    } else if (queryTime < 500) {
      console.log('⚠️ Query simple: ACEPTABLE');
    } else {
      console.log('❌ Query simple: LENTA');
    }
    
    await dataSource.destroy();
    console.log('\n✅ Diagnóstico completado');
    
  } catch (error) {
    console.error('❌ Error durante el diagnóstico:', error.message);
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  testDatabasePerformance();
}

export { testDatabasePerformance }; 