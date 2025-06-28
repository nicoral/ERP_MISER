import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { Employee } from '../../app/entities/Employee.entity';
import { Warehouse } from '../../app/entities/Warehouse.entity';
import { Supplier } from '../../app/entities/Supplier.entity';
import { AuditLog } from '../../app/entities/AuditLog.entity';
import { Role } from '../../app/entities/Role.entity';
import { Permission } from '../../app/entities/Permission.entity';
import { Article } from '../../app/entities/Article.entity';
import { WarehouseArticle } from '../../app/entities/WarehouseArticle.entity';
import { Brand } from '../../app/entities/Brand.entity';
import { RequirementArticle } from '../../app/entities/RequirementArticle.entity';
import { Requirement } from '../../app/entities/Requirement.entity';
import { CostCenter } from '../../app/entities/CostCenter.entity';
import { SupplierQuotationItem } from '../../app/entities/SupplierQuotationItem.entity';
import { SupplierQuotation } from '../../app/entities/SupplierQuotation.entity';
import { FinalSelectionItem } from '../../app/entities/FinalSelectionItem.entity';
import { QuotationSupplierArticle } from '../../app/entities/QuotationSupplierArticle.entity';
import { FinalSelection } from '../../app/entities/FinalSelection.entity';
import { QuotationSupplier } from '../../app/entities/QuotationSupplier.entity';
import { GeneralSettings } from '../../app/entities/GeneralSettings.entity';
import { QuotationRequest } from '../../app/entities/QuotationRequest.entity';

config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.TYPEORM_HOST,
  port: parseInt(process.env.TYPEORM_PORT ?? '5432'),
  username: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  database: process.env.TYPEORM_DATABASE,
  entities: [
    Employee,
    Role,
    Permission,
    Warehouse,
    Article,
    Supplier,
    WarehouseArticle,
    AuditLog,
    Brand,
    CostCenter,
    Requirement,
    RequirementArticle,
    GeneralSettings,
    QuotationRequest,
    QuotationSupplier,
    QuotationSupplierArticle,
    SupplierQuotationItem,
    FinalSelection,
    FinalSelectionItem,
    SupplierQuotation,
    SupplierQuotationItem,  
  ],
  synchronize: false,
  connectTimeoutMS: 5000,
  ssl: {
    rejectUnauthorized: false,
  },
  extra: {
    max: 2,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 5000,
  },
});

async function testConnection() {
  try {
    await dataSource.initialize();
    console.log('✅ Conexión exitosa a la base de datos');
    console.log('Configuración:', {
      host: process.env.TYPEORM_HOST,
      port: process.env.TYPEORM_PORT,
      database: process.env.TYPEORM_DATABASE,
      username: process.env.TYPEORM_USERNAME,
    });
    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    console.log('Configuración actual:', {
      host: process.env.TYPEORM_HOST,
      port: process.env.TYPEORM_PORT,
      database: process.env.TYPEORM_DATABASE,
      username: process.env.TYPEORM_USERNAME,
    });
  }
}

testConnection();
