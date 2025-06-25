import { DataSource } from 'typeorm';
import { GeneralSettings } from '../../src/app/entities/GeneralSettings.entity';
import { Seeder } from 'typeorm-extension';

export default class GeneralSettingsSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const generalSettingsRepository = dataSource.getRepository(GeneralSettings);

    // Verificar si ya existe una configuración
    const existingSettings = await generalSettingsRepository.findOne({
      where: {},
    });

    if (existingSettings) {
      console.log('Configuración general ya existe, saltando seeder...');
      return;
    }

    // Crear configuración por defecto
    const defaultSettings = generalSettingsRepository.create({
      companyName: 'MISER ERP',
      companyLogoUrl: null,
      exchangeRateSale: null,
      exchangeRatePurchase: null,
      exchangeRateDate: null,
      exchangeRateDateString: null,
      exchangeRateAutoUpdate: true,
      timezone: 'America/Lima',
      additionalSettings: null,
    });

    await generalSettingsRepository.save(defaultSettings);
    console.log('Configuración general creada exitosamente');
  }
} 