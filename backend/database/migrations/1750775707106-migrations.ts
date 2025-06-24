import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1750775707106 implements MigrationInterface {
    name = 'Migrations1750775707106'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "article" DROP COLUMN "line"`);
        await queryRunner.query(`ALTER TABLE "article" DROP COLUMN "shelf"`);
        await queryRunner.query(`ALTER TABLE "article" DROP COLUMN "min_stock"`);
        await queryRunner.query(`ALTER TABLE "article" DROP COLUMN "max_stock"`);
        await queryRunner.query(`ALTER TABLE "warehouse_article" ADD "min_stock" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "warehouse_article" ADD "max_stock" integer NOT NULL DEFAULT '100'`);
        await queryRunner.query(`ALTER TABLE "warehouse_article" ADD "line" character varying(100) NOT NULL DEFAULT 'Sin línea'`);
        await queryRunner.query(`ALTER TABLE "warehouse_article" ADD "shelf" character varying(100) NOT NULL DEFAULT 'Sin estante'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "warehouse_article" DROP COLUMN "shelf"`);
        await queryRunner.query(`ALTER TABLE "warehouse_article" DROP COLUMN "line"`);
        await queryRunner.query(`ALTER TABLE "warehouse_article" DROP COLUMN "max_stock"`);
        await queryRunner.query(`ALTER TABLE "warehouse_article" DROP COLUMN "min_stock"`);
        await queryRunner.query(`ALTER TABLE "article" ADD "max_stock" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "article" ADD "min_stock" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "article" ADD "shelf" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "article" ADD "line" character varying(100) NOT NULL`);
    }

}
