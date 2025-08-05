import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { In, IsNull, Repository, DataSource } from 'typeorm';
import { CostCenter } from '../entities/CostCenter.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCostCenterDto } from '../dto/costCenter/create-costCenter.dto';
import { UpdateCostCenterDto } from '../dto/costCenter/update-costCenter.dto';
import { ExcelImportService } from './excel-import.service';
import {
  ImportCostCenterRowDto,
  ImportCostCenterResult,
} from '../dto/costCenter/import-costCenter.dto';

@Injectable()
export class CostCenterService {
  @InjectRepository(CostCenter)
  private readonly costCenterRepository: Repository<CostCenter>;

  constructor(
    private readonly excelImportService: ExcelImportService,
    private readonly dataSource: DataSource
  ) {}

  async findAllCostCenters(page: number, limit: number, search?: string) {
    const query = this.costCenterRepository.createQueryBuilder('costCenter');
    if (search) {
      query.where('costCenter.description LIKE :search', {
        search: `%${search}%`,
      });
    }
    const [data, total] = await query
      .leftJoinAndSelect('costCenter.children', 'children')
      .where('costCenter.parent IS NULL')
      .orderBy('costCenter.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return { data, total };
  }

  async findAllCostCentersSimple() {
    return this.costCenterRepository.find({
      select: ['id', 'description'],
      where: {
        parent: IsNull(),
      },
    });
  }

  async findOneCostCenter(id: number) {
    const costCenter = await this.costCenterRepository.findOne({
      where: { id },
      relations: {
        children: true,
      },
    });
    if (!costCenter) {
      throw new NotFoundException('Cost center not found');
    }
    return costCenter;
  }

  async createCostCenter(createCostCenterDto: CreateCostCenterDto) {
    const { children, ...rest } = createCostCenterDto;
    const costCenter = this.costCenterRepository.create(rest);
    const costCenterSaved = await this.costCenterRepository.save(costCenter);
    const childrenCostCenters = children.map(child => {
      return this.costCenterRepository.create({
        ...child,
        parent: { id: costCenterSaved.id },
      });
    });
    await this.costCenterRepository.save(childrenCostCenters);
    return this.findOneCostCenter(costCenterSaved.id);
  }

  async updateCostCenter(id: number, updateCostCenterDto: UpdateCostCenterDto) {
    const { children, ...rest } = updateCostCenterDto;
    const costCenter = await this.costCenterRepository.findOne({
      where: { id },
      relations: {
        children: true,
      },
    });
    if (!costCenter) {
      throw new NotFoundException('Cost center not found');
    }
    let childrenCostCentersIds = costCenter.children.map(child => child.id);
    const costCenterSaved = await this.costCenterRepository.save({
      ...costCenter,
      ...rest,
    });
    for (const child of children) {
      const { id, ...rest } = child;
      if (id) {
        const childCostCenter = await this.findOneCostCenter(id);
        await this.costCenterRepository.update(childCostCenter.id, {
          ...rest,
          parent: { id: costCenterSaved.id },
        });
        childrenCostCentersIds = childrenCostCentersIds.filter(
          id => id !== childCostCenter.id
        );
      } else {
        const childCostCenter = await this.costCenterRepository.create({
          ...rest,
          parent: { id: costCenterSaved.id },
        });
        await this.costCenterRepository.save(childCostCenter);
      }
    }
    if (childrenCostCentersIds && childrenCostCentersIds.length > 0) {
      await this.costCenterRepository.softDelete({
        id: In(childrenCostCentersIds),
      });
    }
    return await this.findOneCostCenter(costCenterSaved.id);
  }

  async deleteCostCenter(id: number) {
    const costCenter = await this.costCenterRepository.findOne({
      where: { id },
    });
    if (!costCenter) {
      throw new NotFoundException('Cost center not found');
    }
    await this.costCenterRepository.softRemove(costCenter);
  }

  async importFromExcel(
    file: Express.Multer.File
  ): Promise<ImportCostCenterResult> {
    try {
      // Parsear el archivo Excel
      const costCentersData =
        await this.excelImportService.parseCostCenterExcel(file);

      const results: ImportCostCenterResult = {
        success: 0,
        errors: [],
        total: costCentersData.length,
      };

      // Pre-validar todos los datos antes de procesar
      const validationResults =
        await this.preValidateCostCenters(costCentersData);
      results.errors.push(...validationResults.errors);

      // Filtrar centros de costo válidos para procesamiento
      const validCostCenters = costCentersData.filter(
        (_, index) =>
          !validationResults.errors.some(error => error.row === index + 2)
      );

      if (validCostCenters.length === 0) {
        return results;
      }

      // Procesar centros de costo en lotes para mejor rendimiento
      const batchSize = 50; // Procesar 50 centros de costo a la vez
      const batches: ImportCostCenterRowDto[][] = [];

      for (let i = 0; i < validCostCenters.length; i += batchSize) {
        batches.push(validCostCenters.slice(i, i + batchSize));
      }

      for (const batch of batches) {
        const batchResults = await this.processCostCenterBatch(batch);
        results.success += batchResults.success;
        results.errors.push(...batchResults.errors);
      }

      return results;
    } catch (error) {
      throw new BadRequestException(
        'Error al procesar el archivo: ' + error.message
      );
    }
  }

  private async preValidateCostCenters(
    costCenters: ImportCostCenterRowDto[]
  ): Promise<{ errors: Array<{ row: number; error: string }> }> {
    const errors: Array<{ row: number; error: string }> = [];

    for (let i = 0; i < costCenters.length; i++) {
      const costCenter = costCenters[i];
      const rowNumber = i + 2; // +2 porque Excel empieza en 1 y la primera fila son headers

      // Validar ID
      if (!costCenter.id || costCenter.id <= 0) {
        errors.push({
          row: rowNumber,
          error: 'El ID es obligatorio y debe ser mayor a 0',
        });
        continue;
      }

      // Validar descripción
      if (
        !costCenter.description ||
        costCenter.description.trim().length === 0
      ) {
        errors.push({
          row: rowNumber,
          error: 'La descripción es obligatoria',
        });
      }

      // Verificar si el ID ya existe
      const existingCostCenter = await this.costCenterRepository.findOne({
        where: { id: costCenter.id },
      });
      if (existingCostCenter) {
        errors.push({
          row: rowNumber,
          error: `El ID '${costCenter.id}' ya existe`,
        });
      }

      // Validar código si se proporciona
      if (costCenter.code && costCenter.code.trim().length > 0) {
        // Verificar si el código ya existe
        const existingCostCenterByCode =
          await this.costCenterRepository.findOne({
            where: { code: costCenter.code },
          });
        if (existingCostCenterByCode) {
          errors.push({
            row: rowNumber,
            error: `El código '${costCenter.code}' ya existe`,
          });
        }
      }

      // Validar equipo padre si se especifica
      if (costCenter.parentCode && costCenter.parentCode.trim().length > 0) {
        // Verificar que el equipo padre esté definido en el archivo recibido
        const parentExists = costCenters.some(
          cc => cc.code === costCenter.parentCode && cc.id !== costCenter.id
        );
        if (!parentExists) {
          errors.push({
            row: rowNumber,
            error: `El equipo padre '${costCenter.parentCode}' no está definido en el archivo`,
          });
        }
      }
    }

    return { errors };
  }

  private async processCostCenterBatch(
    costCenters: ImportCostCenterRowDto[]
  ): Promise<{
    success: number;
    errors: Array<{ row: number; error: string }>;
  }> {
    const results = {
      success: 0,
      errors: [] as Array<{ row: number; error: string }>,
    };

    for (let i = 0; i < costCenters.length; i++) {
      const costCenter = costCenters[i];
      const rowNumber = i + 2;

      try {
        // Buscar el centro de costo padre si se especifica
        let parentCostCenter: CostCenter | undefined = undefined;
        if (costCenter.parentCode && costCenter.parentCode.trim().length > 0) {
          parentCostCenter =
            (await this.costCenterRepository.findOne({
              where: { code: costCenter.parentCode },
            })) || undefined;
        }

        // Crear el centro de costo con ID específico
        await this.forceInsertCostCenterWithId(
          costCenter,
          parentCostCenter?.id
        );

        results.success++;
      } catch (error) {
        results.errors.push({
          row: rowNumber,
          error: `Error al crear centro de costo: ${error.message}`,
        });
      }
    }

    return results;
  }

  /**
   * Fuerza la inserción de un centro de costo con ID específico y reinicia la secuencia
   */
  private async forceInsertCostCenterWithId(
    costCenterData: ImportCostCenterRowDto,
    parentId?: number
  ): Promise<CostCenter> {
    try {
      // Forzar inserción con ID específico
      const insertQuery = `
        INSERT INTO cost_center (
          id, description, code, serial, code_mine, model, brand, 
          license_plate, owner, parent_id, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `;

      await this.dataSource.query(insertQuery, [
        costCenterData.id,
        costCenterData.description,
        costCenterData.code || null,
        costCenterData.serial || null,
        costCenterData.codeMine || null,
        costCenterData.model || null,
        costCenterData.brand || null,
        costCenterData.licensePlate || null,
        costCenterData.owner || null,
        parentId || null,
        new Date(),
        new Date(),
      ]);

      // Reiniciar la secuencia
      await this.dataSource.query(`
        SELECT setval('cost_center_id_seq', (SELECT MAX(id) FROM cost_center));
      `);

      // Retornar el centro de costo creado
      const costCenter = await this.findOneCostCenter(costCenterData.id!);
      return costCenter;
    } catch (error) {
      console.error(`FORCE INSERT - ERROR: ${error.message}`);
      console.error(`FORCE INSERT - Stack trace: ${error.stack}`);
      throw error;
    }
  }

  generateCostCenterTemplate(): Buffer {
    return this.excelImportService.generateCostCenterTemplate();
  }
}
