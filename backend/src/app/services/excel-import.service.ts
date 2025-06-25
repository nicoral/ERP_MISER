import { Injectable, BadRequestException } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { ImportEmployeeRowDto } from '../dto/employee/import-employee.dto';
import {
  ImportArticleDto,
  ImportWarehouseStockDto,
} from '../dto/article/import-article.dto';

export interface ImportArticleResult {
  success: number;
  errors: string[];
  total: number;
}

@Injectable()
export class ExcelImportService {
  /**
   * Lee un archivo Excel y extrae los datos de empleados
   */
  async parseEmployeeExcel(
    file: Express.Multer.File
  ): Promise<ImportEmployeeRowDto[]> {
    try {
      // Leer el archivo Excel
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });

      // Obtener la primera hoja
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Convertir a JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: null,
      });

      // Validar que hay datos
      if (!jsonData || jsonData.length < 2) {
        throw new BadRequestException(
          'El archivo Excel debe contener al menos una fila de encabezados y una fila de datos'
        );
      }

      // Obtener encabezados (primera fila)
      const headers = jsonData[0] as string[];

      // Validar encabezados requeridos usando exactamente los del template
      const requiredHeaders = [
        'Email',
        'DocumentoId',
        'Tipo de documento',
        'Apellidos y nombres',
        'Area',
        'Cargo',
        'Celular',
        'Direccion',
        'Estado',
        'Fecha de subida',
        'Fecha de cumpleaños',
      ];

      const missingHeaders = requiredHeaders.filter(
        header => !headers.includes(header)
      );

      if (missingHeaders.length > 0) {
        throw new BadRequestException(
          `Faltan encabezados requeridos: ${missingHeaders.join(', ')}`
        );
      }

      // Procesar filas de datos
      const employees: ImportEmployeeRowDto[] = [];

      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i] as (string | number | boolean | null)[];
        if (
          !row ||
          row.every(cell => cell === null || cell === undefined || cell === '')
        ) {
          continue;
        }

        // Extraer datos usando índices exactos del template
        const fullName = String(row[3] || '').trim();
        const names = fullName.split(' ');
        const firstName = names.slice(2).join(' ') || '';
        const lastName = names.slice(0, 2).join(' ') || '';

        const employeeData: ImportEmployeeRowDto = {
          documentId: String(row[1] || '').trim(),
          email:
            String(row[0] || '').trim() ??
            `${String(row[1] || '').trim()}@myser.com`,
          documentType: String(row[2] || '').trim(),
          firstName,
          lastName,
          area: String(row[4] || '').trim(),
          position: String(row[5] || '').trim(),
          phone: String(row[6] || '').trim(),
          address: String(row[7] || '').trim(),
          active: this.parseBoolean(row[8]),
          hireDate: this.parseDate(row[9]),
          birthDate: this.parseDate(row[10]),
        };

        employees.push(employeeData);
      }

      if (employees.length === 0) {
        throw new BadRequestException(
          'No se encontraron datos válidos de empleados en el archivo'
        );
      }

      return employees;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        'Error al procesar el archivo Excel: ' + error.message
      );
    }
  }

  /**
   * Lee un archivo Excel y extrae los datos de artículos
   */
  async parseArticleExcel(
    file: Express.Multer.File
  ): Promise<ImportArticleDto[]> {
    try {
      // Leer el archivo Excel
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });

      // Obtener la primera hoja
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Convertir a JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: null,
      });

      // Validar que hay datos
      if (!jsonData || jsonData.length < 2) {
        throw new BadRequestException(
          'El archivo Excel debe contener al menos una fila de encabezados y una fila de datos'
        );
      }

      // Obtener encabezados (primera fila)
      const headers = jsonData[0] as string[];

      // Validar encabezados requeridos usando exactamente los del template
      const requiredHeaders = [
        'ID',
        'Nombre',
        'Código',
        'Unidad de Medida',
        'Tipo',
        'Clasificación de Rotación',
        'Activo',
        'Marca',
        'Almacén ID',
        'Stock',
        'Stock Mínimo',
        'Stock Máximo',
        'Línea',
        'Estante',
        'Valorado',
      ];

      const missingHeaders = requiredHeaders.filter(
        header => !headers.includes(header)
      );

      if (missingHeaders.length > 0) {
        throw new BadRequestException(
          `Faltan encabezados requeridos: ${missingHeaders.join(', ')}`
        );
      }

      // Agrupar filas por ID de artículo
      const articleGroups = new Map<
        number,
        Array<{ row: (string | number | boolean | null)[]; rowNumber: number }>
      >();

      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i] as (string | number | boolean | null)[];
        if (
          !row ||
          row.every(cell => cell === null || cell === undefined || cell === '')
        ) {
          continue;
        }

        const articleId = typeof row[0] === 'number' ? row[0] : Number(row[0]);
        if (!articleGroups.has(articleId)) {
          articleGroups.set(articleId, []);
        }
        articleGroups.get(articleId)!.push({ row, rowNumber: i + 1 });
      }

      // Convertir grupos a DTOs
      const articles: ImportArticleDto[] = [];

      for (const [, rows] of articleGroups) {
        const firstRow = rows[0].row;

        // Extraer datos del artículo usando índices exactos del template
        const articleData: Partial<ImportArticleDto> = {
          id:
            typeof firstRow[0] === 'number' ? firstRow[0] : Number(firstRow[0]),
          name: String(firstRow[1] || '').trim(),
          code: String(firstRow[2] || '').trim(),
          unitOfMeasure: String(firstRow[3] || '').trim(),
          type: String(firstRow[4] || '').trim(),
          rotationClassification: String(firstRow[5] || '').trim(),
          active: this.parseBoolean(firstRow[6]),
          brandName: String(firstRow[7] || '').trim(),
        };

        // Extraer configuraciones de almacén únicas (sin repetir warehouses)
        const warehouseMap = new Map<string, ImportWarehouseStockDto>();

        for (const { row } of rows) {
          const warehouseId = String(row[8] || '').trim();
          if (warehouseId && !warehouseMap.has(warehouseId)) {
            warehouseMap.set(warehouseId, {
              warehouseId: Number(warehouseId),
              stock: typeof row[9] === 'number' ? row[9] : Number(row[9]) || 0,
              minStock:
                typeof row[10] === 'number' ? row[10] : Number(row[10]) || 0,
              maxStock:
                typeof row[11] === 'number' ? row[11] : Number(row[11]) || 0,
              line: String(row[12] || '').trim(),
              shelf: String(row[13] || '').trim(),
              valued:
                typeof row[14] === 'number' ? row[14] : Number(row[14]) || 0,
            });
          }
        }

        articles.push({
          ...articleData,
          warehouseStocks: Array.from(warehouseMap.values()),
        } as ImportArticleDto);
      }

      if (articles.length === 0) {
        throw new BadRequestException(
          'No se encontraron datos válidos de artículos en el archivo'
        );
      }

      return articles;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        'Error al procesar el archivo Excel: ' + error.message
      );
    }
  }

  /**
   * Parsea una fecha desde diferentes formatos
   */
  private parseDate(
    value: string | number | boolean | null
  ): string | undefined {
    if (!value) return undefined;

    try {
      // Si es un número (fecha de Excel), convertir
      if (typeof value === 'number') {
        const date = XLSX.SSF.parse_date_code(value);
        return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
      }

      // Si es un string, intentar parsear
      if (typeof value === 'string') {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0];
        }
      }

      return undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * Parsea un valor booleano desde diferentes formatos
   */
  private parseBoolean(value: string | number | boolean | null): boolean {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const lower = value.toLowerCase();
      if (lower === 'true' || lower === '1' || lower === 'sí' || lower === 'si')
        return true;
      if (lower === 'false' || lower === '0' || lower === 'no') return false;
    }
    if (typeof value === 'number') return value !== 0;
    return false;
  }

  /**
   * Genera un template de Excel para importación de empleados
   */
  generateEmployeeTemplate(): Buffer {
    const template = [
      [
        'Email',
        'DocumentoId',
        'Tipo de documento',
        'Apellidos y nombres',
        'Area',
        'Cargo',
        'Celular',
        'Direccion',
        'Estado',
        'Fecha de subida',
        'Fecha de cumpleaños',
      ],
      [
        'ejemplo@empresa.com',
        '12345678',
        'DNI',
        'Juan Pérez',
        'IT',
        'Desarrollador',
        '123456789',
        'Calle 123',
        'ACTIVO',
        '2024-01-15',
        '1990-05-20',
      ],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(template);

    // Configurar el ancho de las columnas para que se ajusten al contenido
    const columnWidths = [
      { wch: 25 }, // Email
      { wch: 15 }, // DocumentoId
      { wch: 18 }, // Tipo de documento
      { wch: 25 }, // Apellidos y nombres
      { wch: 12 }, // Area
      { wch: 20 }, // Cargo
      { wch: 15 }, // Celular
      { wch: 30 }, // Direccion
      { wch: 10 }, // Estado
      { wch: 15 }, // Fecha de subida
      { wch: 18 }, // Fecha de cumpleaños
    ];

    worksheet['!cols'] = columnWidths;

    // Configurar el estilo de la primera fila (encabezados)
    const headerStyle = {
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '366092' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' },
      },
    };

    // Aplicar estilo a los encabezados
    for (let col = 0; col < template[0].length; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!worksheet[cellRef]) {
        worksheet[cellRef] = { v: template[0][col] };
      }
      worksheet[cellRef].s = headerStyle;
    }

    // Configurar el estilo de la fila de ejemplo
    const exampleStyle = {
      font: { color: { rgb: '666666' } },
      fill: { fgColor: { rgb: 'F2F2F2' } },
      border: {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' },
      },
    };

    // Aplicar estilo a la fila de ejemplo
    for (let col = 0; col < template[1].length; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: 1, c: col });
      if (!worksheet[cellRef]) {
        worksheet[cellRef] = { v: template[1][col] };
      }
      worksheet[cellRef].s = exampleStyle;
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Empleados');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  /**
   * Genera un template de Excel para importación de artículos
   */
  generateArticleTemplate(): Buffer {
    const template = [
      [
        'ID',
        'Nombre',
        'Código',
        'Unidad de Medida',
        'Tipo',
        'Clasificación de Rotación',
        'Activo',
        'Marca',
        'Almacén ID',
        'Stock',
        'Stock Mínimo',
        'Stock Máximo',
        'Línea',
        'Estante',
        'Valorado',
      ],
      [
        1,
        'Laptop HP Pavilion',
        'LAP001',
        'UNIDAD',
        'NUEVO',
        'ALTA',
        true,
        'HP',
        '1',
        10,
        5,
        50,
        'Línea ELECTRONICA 1',
        'Estante A 1',
        1500.0,
      ],
      [
        1,
        'Laptop HP Pavilion',
        'LAP001',
        'UNIDAD',
        'NUEVO',
        'ALTA',
        true,
        'HP',
        '2',
        5,
        2,
        20,
        'Línea ELECTRONICA 2',
        'Estante B 3',
        1500.0,
      ],
      [
        2,
        'Mouse Inalámbrico',
        'MOU001',
        'UNIDAD',
        'NUEVO',
        'MEDIA',
        true,
        'Logitech',
        '1',
        25,
        10,
        100,
        'Línea ELECTRONICA 3',
        'Estante C 2',
        25.0,
      ],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(template);

    // Configurar anchos de columna
    const columnWidths = [
      { wch: 8 }, // ID
      { wch: 25 }, // Nombre
      { wch: 12 }, // Código
      { wch: 15 }, // Unidad de Medida
      { wch: 10 }, // Tipo
      { wch: 20 }, // Clasificación de Rotación
      { wch: 8 }, // Activo
      { wch: 15 }, // Marca
      { wch: 8 }, // Almacén ID
      { wch: 8 }, // Stock
      { wch: 12 }, // Stock Mínimo
      { wch: 12 }, // Stock Máximo
      { wch: 20 }, // Línea
      { wch: 15 }, // Estante
      { wch: 12 }, // Valorado
    ];
    worksheet['!cols'] = columnWidths;

    // Estilo para headers
    const headerStyle = {
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '4472C4' } },
      alignment: { horizontal: 'center' },
    };

    // Aplicar estilo a los encabezados
    for (let col = 0; col < template[0].length; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!worksheet[cellAddress]) continue;

      worksheet[cellAddress].s = headerStyle;
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Artículos');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
}
